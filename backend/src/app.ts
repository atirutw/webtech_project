import cors from 'cors'
import express from 'express'

import { adminRouter } from './routes/admin.routes'
import { cartRouter } from './routes/cart.routes'
import { docsRouter } from './routes/docs.routes'
import { errorHandler } from './middleware/error-handler'
import { authRouter } from './routes/auth.routes'
import { healthRouter } from './routes/health.routes'
import { orderRouter } from './routes/order.routes'
import { productRouter } from './routes/product.routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/docs', docsRouter)
app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/products', productRouter)
app.use('/admin', adminRouter)
app.use('/cart', cartRouter)
app.use('/orders', orderRouter)

app.use((_req, res) => {
    res.status(404).json({
        message: 'Not found',
    })
})

app.use(errorHandler)
