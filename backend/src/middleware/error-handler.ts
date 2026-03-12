import { ErrorRequestHandler } from 'express'

import { HttpError } from '../utils/http-error'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    const statusCode = error instanceof HttpError ? error.statusCode : 500
    const message = error instanceof Error ? error.message : 'Internal server error'

    res.status(statusCode).json({
        message,
    })
}
