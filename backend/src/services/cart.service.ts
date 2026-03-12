import { pool } from '../db/pool'
import {
    CartItem,
    clearCartByUserId,
    getCartItemByIdForUser,
    getCartItemsByUserId,
    removeCartItemById,
    updateCartItemQuantity,
    upsertCartItem,
} from '../repositories/cart.repository'
import { findProductById } from '../repositories/product.repository'
import { HttpError } from '../utils/http-error'

const summarizeCart = (items: CartItem[]) => ({
    items,
    total: Number(items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)),
})

export const getCart = async (userId: number): Promise<{ items: CartItem[]; total: number }> => {
    const items = await getCartItemsByUserId(userId)
    return summarizeCart(items)
}

export const addToCart = async (params: {
    userId: number
    productId: number
    quantity: number
}): Promise<{ items: CartItem[]; total: number }> => {
    const product = await findProductById(params.productId)

    if (!product) {
        throw new HttpError(404, 'Product not found')
    }

    if (product.stock <= 0) {
        throw new HttpError(409, 'Product is out of stock')
    }

    await upsertCartItem({
        userId: params.userId,
        productId: params.productId,
        quantityDelta: params.quantity,
    })

    return getCart(params.userId)
}

export const setCartItemQuantity = async (params: {
    userId: number
    cartItemId: number
    quantity: number
}): Promise<{ items: CartItem[]; total: number }> => {
    const item = await getCartItemByIdForUser(params.cartItemId, params.userId)

    if (!item) {
        throw new HttpError(404, 'Cart item not found')
    }

    if (params.quantity > item.stock) {
        throw new HttpError(409, 'Requested quantity exceeds stock')
    }

    const updated = await updateCartItemQuantity({
        cartItemId: params.cartItemId,
        userId: params.userId,
        quantity: params.quantity,
    })

    if (!updated) {
        throw new HttpError(404, 'Cart item not found')
    }

    return getCart(params.userId)
}

export const removeFromCart = async (params: {
    userId: number
    cartItemId: number
}): Promise<{ items: CartItem[]; total: number }> => {
    const deleted = await removeCartItemById(params.cartItemId, params.userId)

    if (!deleted) {
        throw new HttpError(404, 'Cart item not found')
    }

    return getCart(params.userId)
}

export const checkoutCart = async (userId: number): Promise<{
    order: {
        id: number
        status: string
        totalAmount: number
        createdAt: string
        items: Array<{ productId: number; name: string; quantity: number; priceAtPurchase: number }>
    }
}> => {
    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const cartResult = await client.query<{
            cart_item_id: number
            product_id: number
            name: string
            price: string
            stock: number
            quantity: number
        }>(
            `
            SELECT
                ci.id AS cart_item_id,
                p.id AS product_id,
                p.name,
                p.price::text,
                p.stock,
                ci.quantity
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = $1
            ORDER BY ci.id ASC
            `,
            [userId],
        )

        const cartItems = cartResult.rows

        if (cartItems.length === 0) {
            throw new HttpError(400, 'Cart is empty')
        }

        for (const item of cartItems) {
            if (item.quantity > item.stock) {
                throw new HttpError(409, `Insufficient stock for ${item.name}`)
            }
        }

        const totalAmount = Number(
            cartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0).toFixed(2),
        )

        const orderResult = await client.query<{ id: number; status: string; created_at: Date }>(
            `
            INSERT INTO orders (user_id, status, total_amount)
            VALUES ($1, $2, $3)
            RETURNING id, status, created_at
            `,
            [userId, 'pending', totalAmount],
        )

        const order = orderResult.rows[0]

        if (!order) {
            throw new Error('Failed to create order')
        }

        for (const item of cartItems) {
            await client.query(
                `
                INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                VALUES ($1, $2, $3, $4)
                `,
                [order.id, item.product_id, item.quantity, Number(item.price)],
            )

            await client.query(
                `
                UPDATE products
                SET stock = stock - $1
                WHERE id = $2
                `,
                [item.quantity, item.product_id],
            )
        }

        await client.query('DELETE FROM cart_items WHERE user_id = $1', [userId])

        await client.query('COMMIT')

        return {
            order: {
                id: order.id,
                status: order.status,
                totalAmount,
                createdAt: order.created_at.toISOString(),
                items: cartItems.map((item) => ({
                    productId: item.product_id,
                    name: item.name,
                    quantity: item.quantity,
                    priceAtPurchase: Number(item.price),
                })),
            },
        }
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }
}

export const clearCart = async (userId: number): Promise<{ items: CartItem[]; total: number }> => {
    await clearCartByUserId(userId)
    return getCart(userId)
}
