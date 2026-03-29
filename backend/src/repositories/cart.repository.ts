import { pool } from '../db/pool'
import { resolveMediaUrl } from '../utils/media'

type CartRow = {
    cart_item_id: number
    product_id: number
    product_name: string
    product_brand: string | null
    product_type: string
    product_category: string
    product_image: string | null
    product_price: string
    product_stock: number
    quantity: number
}

export type CartItem = {
    cartItemId: number
    productId: number
    name: string
    brand: string
    type: string
    category: string
    image: string
    price: number
    stock: number
    qty: number
}

const toCartItem = (row: CartRow): CartItem => ({
    cartItemId: row.cart_item_id,
    productId: row.product_id,
    name: row.product_name,
    brand: row.product_brand ?? '',
    type: row.product_type,
    category: row.product_category,
    image: resolveMediaUrl(row.product_image),
    price: Number(row.product_price),
    stock: row.product_stock,
    qty: row.quantity,
})

export const getCartItemsByUserId = async (userId: number): Promise<CartItem[]> => {
    const result = await pool.query<CartRow>(
        `
        SELECT
            ci.id AS cart_item_id,
            p.id AS product_id,
            p.name AS product_name,
            p.brand AS product_brand,
            p.type AS product_type,
            p.category AS product_category,
            p.image_url AS product_image,
            p.price::text AS product_price,
            p.stock AS product_stock,
            ci.quantity
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.user_id = $1
        ORDER BY ci.id DESC
        `,
        [userId],
    )

    return result.rows.map(toCartItem)
}

export const getCartItemByIdForUser = async (cartItemId: number, userId: number): Promise<CartItem | null> => {
    const result = await pool.query<CartRow>(
        `
        SELECT
            ci.id AS cart_item_id,
            p.id AS product_id,
            p.name AS product_name,
            p.brand AS product_brand,
            p.type AS product_type,
            p.category AS product_category,
            p.image_url AS product_image,
            p.price::text AS product_price,
            p.stock AS product_stock,
            ci.quantity
        FROM cart_items ci
        JOIN products p ON p.id = ci.product_id
        WHERE ci.id = $1
          AND ci.user_id = $2
        LIMIT 1
        `,
        [cartItemId, userId],
    )

    const item = result.rows[0]
    if (!item) {
        return null
    }

    return toCartItem(item)
}

export const upsertCartItem = async (params: {
    userId: number
    productId: number
    quantityDelta: number
}): Promise<void> => {
    await pool.query(
        `
        INSERT INTO cart_items (user_id, product_id, quantity)
        VALUES ($1, $2, GREATEST(1, $3))
        ON CONFLICT (user_id, product_id)
        DO UPDATE
        SET quantity = GREATEST(1, cart_items.quantity + EXCLUDED.quantity)
        `,
        [params.userId, params.productId, params.quantityDelta],
    )
}

export const updateCartItemQuantity = async (params: {
    cartItemId: number
    userId: number
    quantity: number
}): Promise<boolean> => {
    const result = await pool.query(
        `
        UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
          AND user_id = $3
        `,
        [params.quantity, params.cartItemId, params.userId],
    )

    return (result.rowCount ?? 0) > 0
}

export const removeCartItemById = async (cartItemId: number, userId: number): Promise<boolean> => {
    const result = await pool.query(
        `
        DELETE FROM cart_items
        WHERE id = $1
          AND user_id = $2
        `,
        [cartItemId, userId],
    )

    return (result.rowCount ?? 0) > 0
}

export const clearCartByUserId = async (userId: number): Promise<void> => {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [userId])
}
