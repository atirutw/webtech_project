import cors from 'cors'
import express from 'express'

import { errorHandler } from './middleware/error-handler'
import { healthRouter } from './routes/health.routes'

export const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRouter)

app.use((_req, res) => {
    res.status(404).json({
        message: 'Not found',
    })
})

app.use(errorHandler)
