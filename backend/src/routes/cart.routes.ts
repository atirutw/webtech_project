import { Router } from 'express'

import {
    addCartItemController,
    checkoutController,
    clearCartController,
    getCartController,
    removeCartItemController,
    updateCartItemController,
} from '../controllers/cart.controller'
import { requireAuth } from '../middleware/auth-guard'

export const cartRouter = Router()

cartRouter.use(requireAuth)

cartRouter.get('/', getCartController)
cartRouter.post('/items', addCartItemController)
cartRouter.patch('/items/:cartItemId', updateCartItemController)
cartRouter.delete('/items/:cartItemId', removeCartItemController)
cartRouter.delete('/', clearCartController)
cartRouter.post('/checkout', checkoutController)
