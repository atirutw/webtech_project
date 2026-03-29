import { pool } from '../db/pool'

type ProductRow = {
    id: number
    name: string
    brand: string | null
    category: string
    type: string
    price: string
    image_url: string | null
    stock: number
    created_at: Date
}

export type Product = {
    id: number
    name: string
    brand: string
    category: string
    type: string
    price: number
    image: string
    stock: number
    createdAt: string
}

export type RecommendedProduct = {
    item: Product
    score: number
    coPurchaseCount: number
}

export type TrendingProduct = {
    item: Product
    soldCount: number
}

const toProduct = (row: ProductRow): Product => ({
    id: row.id,
    name: row.name,
    brand: row.brand ?? '',
    category: row.category,
    type: row.type,
    price: Number(row.price),
    image: row.image_url ?? '',
    stock: row.stock,
    createdAt: row.created_at.toISOString(),
})

export type ProductListParams = {
    page: number
    limit: number
    category?: string | undefined
    search?: string | undefined
    sort?: 'default' | 'lowToHigh' | 'highToLow' | undefined
    type?: string | undefined
    brand?: string | undefined
}

export const listProducts = async (
    params: ProductListParams,
): Promise<{ items: Product[]; total: number; page: number; limit: number; totalPages: number }> => {
    const whereClauses: string[] = []
    const values: Array<string | number> = []

    if (params.category) {
        values.push(params.category)
        whereClauses.push(`category = $${values.length}`)
    }

    if (params.type) {
        values.push(params.type)
        whereClauses.push(`type = $${values.length}`)
    }

    if (params.brand) {
        values.push(params.brand)
        whereClauses.push(`brand = $${values.length}`)
    }

    if (params.search) {
        values.push(`%${params.search}%`)
        whereClauses.push(`name ILIKE $${values.length}`)
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    const countResult = await pool.query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM products
        ${whereSql}
        `,
        values,
    )

    const total = Number(countResult.rows[0]?.count ?? 0)
    const totalPages = Math.max(1, Math.ceil(total / params.limit))
    const page = Math.min(Math.max(1, params.page), totalPages)
    const offset = (page - 1) * params.limit

    const sortSql =
        params.sort === 'lowToHigh'
            ? 'price ASC, id DESC'
            : params.sort === 'highToLow'
                ? 'price DESC, id DESC'
                : 'id DESC'

    const dataValues = [...values, params.limit, offset]

    const result = await pool.query<ProductRow>(
        `
        SELECT id, name, brand, category, type, price::text, image_url, stock, created_at
        FROM products
        ${whereSql}
        ORDER BY ${sortSql}
        LIMIT $${dataValues.length - 1}
        OFFSET $${dataValues.length}
        `,
        dataValues,
    )

    return {
        items: result.rows.map(toProduct),
        total,
        page,
        limit: params.limit,
        totalPages,
    }
}

export const listCategoryCounts = async (
    type?: string,
): Promise<Array<{ category: string; displayName: string; count: number; type: string }>> => {
    const values: string[] = []
    const whereSql = type
        ? (() => {
            values.push(type)
            return 'WHERE type = $1'
        })()
        : ''

    const result = await pool.query<{ category: string; display_name: string | null; count: string; type: string | null }>(
        `
        SELECT
            p.category,
            m.display_name,
            COALESCE(m.type, p.type) AS type,
            COUNT(*)::text AS count
        FROM products AS p
        LEFT JOIN product_category_display AS m
            ON m.category = p.category
        ${whereSql}
        GROUP BY p.category, m.display_name, COALESCE(m.type, p.type)
        ORDER BY COALESCE(m.type, p.type) ASC, p.category ASC
        `,
        values,
    )

    return result.rows.map((row) => ({
        category: row.category,
        displayName:
            row.display_name ??
            row.category
                .split('-')
                .filter(Boolean)
                .map((chunk) => `${chunk[0]?.toUpperCase() ?? ''}${chunk.slice(1)}`)
                .join(' '),
        count: Number(row.count),
        type: row.type ?? 'instrument',
    }))
}

export const createProduct = async (params: {
    name: string
    brand?: string | undefined
    category: string
    type: string
    price: number
    image?: string | undefined
    stock: number
}): Promise<Product> => {
    const result = await pool.query<ProductRow>(
        `
        INSERT INTO products (name, brand, category, type, price, image_url, stock)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, name, brand, category, type, price::text, image_url, stock, created_at
        `,
        [
            params.name,
            params.brand || null,
            params.category,
            params.type,
            params.price,
            params.image || null,
            params.stock,
        ],
    )

    const product = result.rows[0]

    if (!product) {
        throw new Error('Failed to create product')
    }

    return toProduct(product)
}

export const findProductById = async (id: number): Promise<Product | null> => {
    const result = await pool.query<ProductRow>(
        `
        SELECT id, name, brand, category, type, price::text, image_url, stock, created_at
        FROM products
        WHERE id = $1
        LIMIT 1
        `,
        [id],
    )

    const product = result.rows[0]

    if (!product) {
        return null
    }

    return toProduct(product)
}

export const updateProduct = async (
    id: number,
    params: {
        name?: string | undefined
        brand?: string | undefined
        category?: string | undefined
        type?: string | undefined
        price?: number | undefined
        image?: string | undefined
        stock?: number | undefined
    },
): Promise<Product | null> => {
    const updates: string[] = []
    const values: Array<string | number | null> = []

    if (params.name !== undefined) {
        values.push(params.name)
        updates.push(`name = $${values.length}`)
    }

    if (params.brand !== undefined) {
        values.push(params.brand || null)
        updates.push(`brand = $${values.length}`)
    }

    if (params.category !== undefined) {
        values.push(params.category)
        updates.push(`category = $${values.length}`)
    }

    if (params.type !== undefined) {
        values.push(params.type)
        updates.push(`type = $${values.length}`)
    }

    if (params.price !== undefined) {
        values.push(params.price)
        updates.push(`price = $${values.length}`)
    }

    if (params.image !== undefined) {
        values.push(params.image || null)
        updates.push(`image_url = $${values.length}`)
    }

    if (params.stock !== undefined) {
        values.push(params.stock)
        updates.push(`stock = $${values.length}`)
    }

    if (updates.length === 0) {
        return findProductById(id)
    }

    values.push(id)

    const result = await pool.query<ProductRow>(
        `
        UPDATE products
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, name, brand, category, type, price::text, image_url, stock, created_at
        `,
        values,
    )

    const product = result.rows[0]

    if (!product) {
        return null
    }

    return toProduct(product)
}

export const deleteProductById = async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM products WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
}

type RecommendedProductRow = ProductRow & {
    score: string
    co_purchase_count: string
}

export const listRecommendedProducts = async (productId: number, limit: number): Promise<RecommendedProduct[]> => {
    const safeLimit = Math.max(1, Math.min(12, limit))

    const result = await pool.query<RecommendedProductRow>(
        `
        WITH target AS (
            SELECT id, category, type, brand, price
            FROM products
            WHERE id = $1
            LIMIT 1
        ),
        co_purchase AS (
            SELECT
                oi2.product_id,
                COUNT(*)::text AS co_purchase_count
            FROM order_items oi1
            JOIN order_items oi2
                ON oi2.order_id = oi1.order_id
               AND oi2.product_id <> oi1.product_id
            WHERE oi1.product_id = $1
            GROUP BY oi2.product_id
        )
        SELECT
            p.id,
            p.name,
            p.brand,
            p.category,
            p.type,
            p.price::text,
            p.image_url,
            p.stock,
            p.created_at,
            (
                CASE WHEN p.category = t.category THEN 3 ELSE 0 END +
                CASE WHEN p.type = t.type THEN 2 ELSE 0 END +
                CASE WHEN p.brand IS NOT NULL AND t.brand IS NOT NULL AND p.brand = t.brand THEN 2 ELSE 0 END +
                CASE
                    WHEN t.price > 0 AND ABS(p.price - t.price) / t.price <= 0.20 THEN 2
                    WHEN t.price > 0 AND ABS(p.price - t.price) / t.price <= 0.40 THEN 1
                    ELSE 0
                END +
                CASE WHEN p.stock > 0 THEN 1 ELSE 0 END +
                COALESCE(cp.co_purchase_count::int, 0)
            )::text AS score,
            COALESCE(cp.co_purchase_count, '0') AS co_purchase_count
        FROM products p
        CROSS JOIN target t
        LEFT JOIN co_purchase cp ON cp.product_id = p.id
        WHERE p.id <> t.id
        ORDER BY score::int DESC, cp.co_purchase_count::int DESC, p.created_at DESC
        LIMIT $2
        `,
        [productId, safeLimit],
    )

    return result.rows.map((row) => ({
        item: toProduct(row),
        score: Number(row.score),
        coPurchaseCount: Number(row.co_purchase_count),
    }))
}

type TrendingProductRow = ProductRow & {
    sold_count: string
}

export const listTrendingProducts = async (limit: number): Promise<TrendingProduct[]> => {
    const safeLimit = Math.max(1, Math.min(12, limit))

    const result = await pool.query<TrendingProductRow>(
        `
        SELECT
            p.id,
            p.name,
            p.brand,
            p.category,
            p.type,
            p.price::text,
            p.image_url,
            p.stock,
            p.created_at,
            COALESCE(SUM(oi.quantity), 0)::text AS sold_count
        FROM products p
        LEFT JOIN order_items oi ON oi.product_id = p.id
        LEFT JOIN orders o ON o.id = oi.order_id
        GROUP BY p.id
        ORDER BY COALESCE(SUM(oi.quantity), 0) DESC, p.stock DESC, p.created_at DESC
        LIMIT $1
        `,
        [safeLimit],
    )

    return result.rows.map((row) => ({
        item: toProduct(row),
        soldCount: Number(row.sold_count),
    }))
}
