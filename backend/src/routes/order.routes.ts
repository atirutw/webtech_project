import { Router } from 'express'

import { getMyOrderDetailController, listMyOrdersController } from '../controllers/order.controller'
import { requireAuth } from '../middleware/auth-guard'

export const orderRouter = Router()

orderRouter.use(requireAuth)

orderRouter.get('/', listMyOrdersController)
orderRouter.get('/:orderId', getMyOrderDetailController)
