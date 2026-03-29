import { findUserById } from '../repositories/admin.repository'
import {
    findOrderDetailById,
    findOrderDetailByIdForUser,
    listOrderSummariesByUserId,
    OrderDetail,
    OrderSummary,
} from '../repositories/order.repository'
import { HttpError } from '../utils/http-error'

export const listMyOrders = async (userId: number): Promise<OrderSummary[]> => {
    return listOrderSummariesByUserId(userId)
}

export const getMyOrderDetail = async (userId: number, orderId: number): Promise<OrderDetail> => {
    const order = await findOrderDetailByIdForUser(orderId, userId)

    if (!order) {
        throw new HttpError(404, 'Order not found')
    }

    return order
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

    return order
}
