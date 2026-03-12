import { Router } from 'express'

import {
    categoryCountsController,
    createProductController,
    deleteProductController,
    getProductController,
    listProductsController,
    updateProductController,
} from '../controllers/product.controller'
import { requireAdmin, requireAuth } from '../middleware/auth-guard'

export const productRouter = Router()

productRouter.get('/', listProductsController)
productRouter.get('/categories', categoryCountsController)
productRouter.get('/:id', getProductController)

productRouter.post('/', requireAuth, requireAdmin, createProductController)
productRouter.patch('/:id', requireAuth, requireAdmin, updateProductController)
productRouter.delete('/:id', requireAuth, requireAdmin, deleteProductController)
