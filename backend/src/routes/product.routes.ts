import { Router } from 'express'

import {
    categoryCountsController,
    createProductController,
    deleteProductController,
    getProductController,
    listProductsController,
    productRecommendationsController,
    trendingProductsController,
    uploadProductMediaController,
    updateProductController,
} from '../controllers/product.controller'
import { requireAdmin, requireAuth } from '../middleware/auth-guard'
import { productImageUpload } from '../middleware/media-upload'

export const productRouter = Router()

productRouter.get('/', listProductsController)
productRouter.get('/categories', categoryCountsController)
productRouter.get('/trending', trendingProductsController)
productRouter.get('/:id/recommendations', productRecommendationsController)
productRouter.get('/:id', getProductController)

productRouter.post('/', requireAuth, requireAdmin, createProductController)
productRouter.post('/media', requireAuth, requireAdmin, productImageUpload.single('file'), uploadProductMediaController)
productRouter.patch('/:id', requireAuth, requireAdmin, updateProductController)
productRouter.delete('/:id', requireAuth, requireAdmin, deleteProductController)
