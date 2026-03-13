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
