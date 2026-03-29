import { RequestHandler } from 'express'
import { z } from 'zod'

import {
    getOrderDetailAsAdmin,
    getMyOrderDetail,
    listMyOrders,
    listOrdersByUserAsAdmin,
    reorderMyOrder,
} from '../services/order.service'
import { HttpError } from '../utils/http-error'

const userIdParamsSchema = z.object({
    id: z.coerce.number().int().positive(),
})

const orderIdParamsSchema = z.object({
    orderId: z.coerce.number().int().positive(),
})

const getAuthUserId = (req: Parameters<RequestHandler>[0]): number => {
    const authUser = req.authUser

    if (!authUser) {
        throw new HttpError(401, 'Unauthorized')
    }

    return authUser.id
}

export const listMyOrdersController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const orders = await listMyOrders(userId)

        res.status(200).json({ orders })
    } catch (error) {
        next(error)
    }
}

export const getMyOrderDetailController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const params = orderIdParamsSchema.parse(req.params)
        const order = await getMyOrderDetail(userId, params.orderId)

        res.status(200).json({ order })
    } catch (error) {
        next(error)
    }
}

export const listUserOrdersAsAdminController: RequestHandler = async (req, res, next) => {
    try {
        const params = userIdParamsSchema.parse(req.params)
        const orders = await listOrdersByUserAsAdmin(params.id)

        res.status(200).json({ orders })
    } catch (error) {
        next(error)
    }
}

export const getOrderDetailAsAdminController: RequestHandler = async (req, res, next) => {
    try {
        const params = orderIdParamsSchema.parse(req.params)
        const order = await getOrderDetailAsAdmin(params.orderId)

        res.status(200).json({ order })
    } catch (error) {
        next(error)
    }
}

export const reorderMyOrderController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const params = orderIdParamsSchema.parse(req.params)
        const cart = await reorderMyOrder(userId, params.orderId)

        res.status(200).json(cart)
    } catch (error) {
        next(error)
    }
}
