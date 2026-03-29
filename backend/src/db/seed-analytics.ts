import { initializeDatabase } from './init'
import { pool } from './pool'

type ProductRow = {
    id: number
    price: string
    stock: number
}

async function seedAnalytics(): Promise<void> {
    console.log('Seeding analytics data...')

    await initializeDatabase()

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        const existingOrders = await client.query<{ count: string }>(
            'SELECT COUNT(*)::text AS count FROM orders',
        )

        if (Number(existingOrders.rows[0]?.count ?? 0) > 0) {
            console.log('Orders already exist. Skipping analytics seed to avoid duplicates.')
            await client.query('ROLLBACK')
            return
        }

        const userResult = await client.query<{ id: number }>(
            `
            SELECT id
            FROM users
            WHERE role = 'customer'
            ORDER BY id ASC
            LIMIT 1
            `,
        )

        const userId = userResult.rows[0]?.id

        if (!userId) {
            throw new Error('No customer user found. Run seed:users first.')
        }

        const productResult = await client.query<ProductRow>(
            `
            SELECT id, price::text, stock
            FROM products
            WHERE stock > 0
            ORDER BY id ASC
            LIMIT 10
            `,
        )

        const products = productResult.rows

        if (products.length < 3) {
            throw new Error('Need at least 3 products with stock > 0. Run seed first.')
        }

        const statuses = ['confirmed', 'packed', 'shipped', 'delivered'] as const

        for (let index = 0; index < 8; index += 1) {
            const first = products[index % products.length]
            const second = products[(index + 2) % products.length]

            if (!first || !second) {
                continue
            }

            const qtyA = index % 2 === 0 ? 1 : 2
            const qtyB = 1
            const totalAmount = Number(first.price) * qtyA + Number(second.price) * qtyB

            const orderInsert = await client.query<{ id: number }>(
                `
                INSERT INTO orders (user_id, status, total_amount, created_at)
                VALUES ($1, $2, $3, NOW() - (($4::int || ' days')::interval))
                RETURNING id
                `,
                [userId, statuses[index % statuses.length], totalAmount.toFixed(2), 8 - index],
            )

            const orderId = orderInsert.rows[0]?.id

            if (!orderId) {
                throw new Error('Failed to create seeded order')
            }

            await client.query(
                `
                INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                VALUES ($1, $2, $3, $4),
                       ($1, $5, $6, $7)
                `,
                [
                    orderId,
                    first.id,
                    qtyA,
                    Number(first.price),
                    second.id,
                    qtyB,
                    Number(second.price),
                ],
            )
        }

        const cartSeedProducts = products.slice(0, 2)
        for (const item of cartSeedProducts) {
            await client.query(
                `
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, 1)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET quantity = EXCLUDED.quantity
                `,
                [userId, item.id],
            )
        }

        await client.query('COMMIT')
        console.log('Analytics seed completed successfully')
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('Analytics seed failed', error)
        process.exitCode = 1
    } finally {
        client.release()
        await pool.end()
    }
}

void seedAnalytics()
