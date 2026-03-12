import cors from 'cors'
import express from 'express'

import { adminRouter } from './routes/admin.routes'
import { errorHandler } from './middleware/error-handler'
import { authRouter } from './routes/auth.routes'
import { healthRouter } from './routes/health.routes'
import { productRouter } from './routes/product.routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRouter)
app.use('/auth', authRouter)
app.use('/products', productRouter)
app.use('/admin', adminRouter)

app.use((_req, res) => {
    res.status(404).json({
        message: 'Not found',
    })
})

app.use(errorHandler)
