import { pool } from '../db/pool'

type UserRow = {
    id: number
    name: string
    email: string
    role: 'admin' | 'customer'
    created_at: Date
}

export type AdminUser = {
    id: number
    name: string
    email: string
    role: 'admin' | 'customer'
    createdAt: string
}

export type AdminDashboardSnapshot = {
    kpis: {
        totalRevenue: number
        ordersCount: number
        averageOrderValue: number
        customersCount: number
        openCarts: number
        lowStockProducts: number
    }
    salesByDay: Array<{
        day: string
        revenue: number
        orders: number
    }>
    topProducts: Array<{
        productId: number
        name: string
        soldCount: number
        revenue: number
    }>
    recentOrders: Array<{
        id: number
        customerName: string
        totalAmount: number
        status: string
        createdAt: string
    }>
    lowStock: Array<{
        productId: number
        name: string
        stock: number
    }>
}

const toAdminUser = (row: UserRow): AdminUser => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at.toISOString(),
})

export const listUsers = async (): Promise<AdminUser[]> => {
    const result = await pool.query<UserRow>(
        `
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        `,
    )

    return result.rows.map(toAdminUser)
}

export const findUserById = async (id: number): Promise<AdminUser | null> => {
    const result = await pool.query<UserRow>(
        `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [id],
    )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return toAdminUser(user)
}

export const countAdmins = async (): Promise<number> => {
    const result = await pool.query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM users
        WHERE role = 'admin'
        `,
    )

    return Number(result.rows[0]?.count ?? 0)
}

export const updateUserByAdmin = async (
    id: number,
    params: {
        name?: string | undefined
        email?: string | undefined
        role?: 'admin' | 'customer' | undefined
    },
): Promise<AdminUser | null> => {
    const updates: string[] = []
    const values: Array<string | number> = []

    if (params.name !== undefined) {
        values.push(params.name)
        updates.push(`name = $${values.length}`)
    }

    if (params.email !== undefined) {
        values.push(params.email)
        updates.push(`email = $${values.length}`)
    }

    if (params.role !== undefined) {
        values.push(params.role)
        updates.push(`role = $${values.length}`)
    }

    if (updates.length === 0) {
        return findUserById(id)
    }

    values.push(id)

    const result = await pool.query<UserRow>(
        `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, name, email, role, created_at
        `,
        values,
    )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return toAdminUser(user)
}

export const deleteUserById = async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
}

export const getAdminDashboardSnapshot = async (days: number): Promise<AdminDashboardSnapshot> => {
    const safeDays = Math.max(3, Math.min(30, days))

    const [kpiResult, salesByDayResult, topProductsResult, recentOrdersResult, lowStockResult] = await Promise.all([
        pool.query<{
            total_revenue: string
            orders_count: string
            average_order_value: string
            customers_count: string
            open_carts: string
            low_stock_products: string
        }>(
            `
            SELECT
                COALESCE((SELECT SUM(total_amount) FROM orders), 0)::text AS total_revenue,
                COALESCE((SELECT COUNT(*) FROM orders), 0)::text AS orders_count,
                COALESCE((SELECT AVG(total_amount) FROM orders), 0)::text AS average_order_value,
                COALESCE((SELECT COUNT(*) FROM users WHERE role = 'customer'), 0)::text AS customers_count,
                COALESCE((SELECT COUNT(DISTINCT user_id) FROM cart_items), 0)::text AS open_carts,
                COALESCE((SELECT COUNT(*) FROM products WHERE stock <= 5), 0)::text AS low_stock_products
            `,
        ),
        pool.query<{ day: Date; revenue: string; orders: string }>(
            `
            WITH days AS (
                SELECT generate_series(
                    CURRENT_DATE - ($1::int - 1),
                    CURRENT_DATE,
                    INTERVAL '1 day'
                )::date AS day
            )
            SELECT
                d.day,
                COALESCE(SUM(o.total_amount), 0)::text AS revenue,
                COALESCE(COUNT(o.id), 0)::text AS orders
            FROM days d
            LEFT JOIN orders o ON DATE(o.created_at) = d.day
            GROUP BY d.day
            ORDER BY d.day ASC
            `,
            [safeDays],
        ),
        pool.query<{ product_id: number; name: string; sold_count: string; revenue: string }>(
            `
            SELECT
                p.id AS product_id,
                p.name,
                COALESCE(SUM(oi.quantity), 0)::text AS sold_count,
                COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0)::text AS revenue
            FROM products p
            LEFT JOIN order_items oi ON oi.product_id = p.id
            GROUP BY p.id
            ORDER BY COALESCE(SUM(oi.quantity), 0) DESC,
                     COALESCE(SUM(oi.quantity * oi.price_at_purchase), 0) DESC,
                     p.id DESC
            LIMIT 5
            `,
        ),
        pool.query<{ id: number; customer_name: string; total_amount: string; status: string; created_at: Date }>(
            `
            SELECT
                o.id,
                u.name AS customer_name,
                o.total_amount::text,
                o.status,
                o.created_at
            FROM orders o
            JOIN users u ON u.id = o.user_id
            ORDER BY o.created_at DESC, o.id DESC
            LIMIT 6
            `,
        ),
        pool.query<{ product_id: number; name: string; stock: number }>(
            `
            SELECT id AS product_id, name, stock
            FROM products
            WHERE stock <= 5
            ORDER BY stock ASC, id DESC
            LIMIT 8
            `,
        ),
    ])

    const kpis = kpiResult.rows[0]

    if (!kpis) {
        throw new Error('Failed to load admin dashboard KPIs')
    }

    return {
        kpis: {
            totalRevenue: Number(kpis.total_revenue),
            ordersCount: Number(kpis.orders_count),
            averageOrderValue: Number(kpis.average_order_value),
            customersCount: Number(kpis.customers_count),
            openCarts: Number(kpis.open_carts),
            lowStockProducts: Number(kpis.low_stock_products),
        },
        salesByDay: salesByDayResult.rows.map((row) => ({
            day: row.day.toISOString(),
            revenue: Number(row.revenue),
            orders: Number(row.orders),
        })),
        topProducts: topProductsResult.rows.map((row) => ({
            productId: row.product_id,
            name: row.name,
            soldCount: Number(row.sold_count),
            revenue: Number(row.revenue),
        })),
        recentOrders: recentOrdersResult.rows.map((row) => ({
            id: row.id,
            customerName: row.customer_name,
            totalAmount: Number(row.total_amount),
            status: row.status,
            createdAt: row.created_at.toISOString(),
        })),
        lowStock: lowStockResult.rows.map((row) => ({
            productId: row.product_id,
            name: row.name,
            stock: row.stock,
        })),
    }
}
