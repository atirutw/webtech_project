import { RequestHandler } from 'express'
import { z } from 'zod'

import { addToCart, checkoutCart, clearCart, getCart, removeFromCart, setCartItemQuantity } from '../services/cart.service'
import { HttpError } from '../utils/http-error'

const addItemSchema = z.object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().positive().default(1),
})

const updateItemSchema = z.object({
    quantity: z.coerce.number().int().positive(),
})

const cartItemParamsSchema = z.object({
    cartItemId: z.coerce.number().int().positive(),
})

const getAuthUserId = (req: Parameters<RequestHandler>[0]): number => {
    const authUser = req.authUser

    if (!authUser) {
        throw new HttpError(401, 'Unauthorized')
    }

    return authUser.id
}

export const getCartController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const cart = await getCart(userId)

        res.status(200).json(cart)
    } catch (error) {
        next(error)
    }
}

export const addCartItemController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const payload = addItemSchema.parse(req.body)
        const cart = await addToCart({
            userId,
            productId: payload.productId,
            quantity: payload.quantity,
        })

        res.status(200).json(cart)
    } catch (error) {
        next(error)
    }
}

export const updateCartItemController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const params = cartItemParamsSchema.parse(req.params)
        const payload = updateItemSchema.parse(req.body)
        const cart = await setCartItemQuantity({
            userId,
            cartItemId: params.cartItemId,
            quantity: payload.quantity,
        })

        res.status(200).json(cart)
    } catch (error) {
        next(error)
    }
}

export const removeCartItemController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const params = cartItemParamsSchema.parse(req.params)
        const cart = await removeFromCart({
            userId,
            cartItemId: params.cartItemId,
        })

        res.status(200).json(cart)
    } catch (error) {
        next(error)
    }
}

export const checkoutController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)

        if (req.authUser?.role !== 'customer') {
            throw new HttpError(403, 'Only members can place orders')
        }

        const payload = await checkoutCart(userId)

        res.status(200).json(payload)
    } catch (error) {
        next(error)
    }
}

export const clearCartController: RequestHandler = async (req, res, next) => {
    try {
        const userId = getAuthUserId(req)
        const cart = await clearCart(userId)

        res.status(200).json(cart)
    } catch (error) {
        next(error)
    }
}
