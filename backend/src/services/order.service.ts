import { findUserById } from '../repositories/admin.repository'
import { CartItem, getCartItemsByUserId } from '../repositories/cart.repository'
import {
    findOrderDetailById,
    findOrderDetailByIdForUser,
    listOrderSummariesByUserId,
    OrderDetail,
    OrderSummary,
} from '../repositories/order.repository'
import { pool } from '../db/pool'
import { HttpError } from '../utils/http-error'

type JourneyStage = 'placed' | 'confirmed' | 'packed' | 'shipped' | 'delivered'

type OrderJourneyStep = {
    key: JourneyStage
    label: string
    completed: boolean
    timestamp: string | null
}

const stageOrder: JourneyStage[] = ['placed', 'confirmed', 'packed', 'shipped', 'delivered']

const statusProgress: Record<string, JourneyStage> = {
    pending: 'placed',
    confirmed: 'confirmed',
    packed: 'packed',
    shipped: 'shipped',
    delivered: 'delivered',
}

const buildOrderJourney = (order: OrderDetail): OrderJourneyStep[] => {
    const createdAt = new Date(order.createdAt)
    const offsetsInHours: Record<JourneyStage, number> = {
        placed: 0,
        confirmed: 0,
        packed: 4,
        shipped: 28,
        delivered: 84,
    }

    const progress = statusProgress[order.status] ?? 'confirmed'
    const progressIndex = stageOrder.indexOf(progress)

    return stageOrder.map((stage) => {
        const stageIndex = stageOrder.indexOf(stage)
        const eta = new Date(createdAt)
        eta.setHours(eta.getHours() + offsetsInHours[stage])

        return {
            key: stage,
            label:
                stage === 'placed'
                    ? 'รับคำสั่งซื้อ'
                    : stage === 'confirmed'
                        ? 'ยืนยันคำสั่งซื้อ'
                        : stage === 'packed'
                            ? 'กำลังแพ็กสินค้า'
                            : stage === 'shipped'
                                ? 'ส่งให้ขนส่งแล้ว'
                                : 'จัดส่งสำเร็จ',
            completed: stageIndex <= progressIndex,
            timestamp: stageIndex <= progressIndex ? eta.toISOString() : null,
        }
    })
}

const withJourney = (order: OrderDetail): OrderDetail & { journey: OrderJourneyStep[] } => ({
    ...order,
    journey: buildOrderJourney(order),
})

const summarizeCart = (items: CartItem[]) => ({
    items,
    total: Number(items.reduce((sum, item) => sum + item.price * item.qty, 0).toFixed(2)),
})

export const listMyOrders = async (userId: number): Promise<OrderSummary[]> => {
    return listOrderSummariesByUserId(userId)
}

export const getMyOrderDetail = async (userId: number, orderId: number): Promise<OrderDetail> => {
    const order = await findOrderDetailByIdForUser(orderId, userId)

    if (!order) {
        throw new HttpError(404, 'Order not found')
    }

    return withJourney(order)
}

export const listOrdersByUserAsAdmin = async (targetUserId: number): Promise<OrderSummary[]> => {
    const user = await findUserById(targetUserId)

    if (!user) {
        throw new HttpError(404, 'User not found')
    }

    return listOrderSummariesByUserId(targetUserId)
}

export const getOrderDetailAsAdmin = async (orderId: number): Promise<OrderDetail> => {
    const order = await findOrderDetailById(orderId)

    if (!order) {
        throw new HttpError(404, 'Order not found')
    }

    return withJourney(order)
}

export const reorderMyOrder = async (userId: number, orderId: number): Promise<{ items: CartItem[]; total: number }> => {
    const order = await findOrderDetailByIdForUser(orderId, userId)

    if (!order) {
        throw new HttpError(404, 'Order not found')
    }

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        for (const item of order.items) {
            await client.query(
                `
                INSERT INTO cart_items (user_id, product_id, quantity)
                VALUES ($1, $2, $3)
                ON CONFLICT (user_id, product_id)
                DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
                `,
                [userId, item.productId, item.quantity],
            )
        }

        await client.query('COMMIT')
    } catch (error) {
        await client.query('ROLLBACK')
        throw error
    } finally {
        client.release()
    }

    const cartItems = await getCartItemsByUserId(userId)
    return summarizeCart(cartItems)
}
