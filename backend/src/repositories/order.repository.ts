import { pool } from '../db/pool'

type OrderSummaryRow = {
    id: number
    user_id: number
    status: string
    total_amount: string
    created_at: Date
    item_count: string
}

type OrderRow = {
    id: number
    user_id: number
    status: string
    total_amount: string
    created_at: Date
    customer_name: string
    customer_email: string
}

type OrderItemRow = {
    product_id: number
    product_name: string
    quantity: number
    price_at_purchase: string
}

export type OrderSummary = {
    id: number
    userId: number
    status: string
    totalAmount: number
    itemCount: number
    createdAt: string
}

export type OrderItem = {
    productId: number
    productName: string
    quantity: number
    priceAtPurchase: number
}

export type OrderDetail = {
    id: number
    userId: number
    status: string
    totalAmount: number
    createdAt: string
    customer: {
        id: number
        name: string
        email: string
    }
    items: OrderItem[]
}

const toOrderSummary = (row: OrderSummaryRow): OrderSummary => ({
    id: row.id,
    userId: row.user_id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    itemCount: Number(row.item_count),
    createdAt: row.created_at.toISOString(),
})

const toOrderItem = (row: OrderItemRow): OrderItem => ({
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    priceAtPurchase: Number(row.price_at_purchase),
})

const getOrderItems = async (orderId: number): Promise<OrderItem[]> => {
    const result = await pool.query<OrderItemRow>(
        `
        SELECT
            oi.product_id,
            p.name AS product_name,
            oi.quantity,
            oi.price_at_purchase::text
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.id ASC
        `,
        [orderId],
    )

    return result.rows.map(toOrderItem)
}

const toOrderDetail = async (row: OrderRow): Promise<OrderDetail> => ({
    id: row.id,
    userId: row.user_id,
    status: row.status,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at.toISOString(),
    customer: {
        id: row.user_id,
        name: row.customer_name,
        email: row.customer_email,
    },
    items: await getOrderItems(row.id),
})

export const listOrderSummariesByUserId = async (userId: number): Promise<OrderSummary[]> => {
    const result = await pool.query<OrderSummaryRow>(
        `
        SELECT
            o.id,
            o.user_id,
            o.status,
            o.total_amount::text,
            o.created_at,
            COUNT(oi.id)::text AS item_count
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.user_id = $1
        GROUP BY o.id
        ORDER BY o.created_at DESC, o.id DESC
        `,
        [userId],
    )

    return result.rows.map(toOrderSummary)
}

export const findOrderDetailByIdForUser = async (orderId: number, userId: number): Promise<OrderDetail | null> => {
    const result = await pool.query<OrderRow>(
        `
        SELECT
            o.id,
            o.user_id,
            o.status,
            o.total_amount::text,
            o.created_at,
            u.name AS customer_name,
            u.email AS customer_email
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = $1
          AND o.user_id = $2
        LIMIT 1
        `,
        [orderId, userId],
    )

    const row = result.rows[0]
    if (!row) {
        return null
    }

    return toOrderDetail(row)
}

export const findOrderDetailById = async (orderId: number): Promise<OrderDetail | null> => {
    const result = await pool.query<OrderRow>(
        `
        SELECT
            o.id,
            o.user_id,
            o.status,
            o.total_amount::text,
            o.created_at,
            u.name AS customer_name,
            u.email AS customer_email
        FROM orders o
        JOIN users u ON u.id = o.user_id
        WHERE o.id = $1
        LIMIT 1
        `,
        [orderId],
    )

    const row = result.rows[0]
    if (!row) {
        return null
    }

    return toOrderDetail(row)
}
