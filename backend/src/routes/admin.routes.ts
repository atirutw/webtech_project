import { Router } from 'express'

import { deleteUserController, listUsersController, updateUserController } from '../controllers/admin.controller'
import { getOrderDetailAsAdminController, listUserOrdersAsAdminController } from '../controllers/order.controller'
import { requireAdmin, requireAuth } from '../middleware/auth-guard'

export const adminRouter = Router()

adminRouter.use(requireAuth, requireAdmin)

adminRouter.get('/users', listUsersController)
adminRouter.patch('/users/:id', updateUserController)
adminRouter.delete('/users/:id', deleteUserController)
adminRouter.get('/users/:id/orders', listUserOrdersAsAdminController)
adminRouter.get('/orders/:orderId', getOrderDetailAsAdminController)
