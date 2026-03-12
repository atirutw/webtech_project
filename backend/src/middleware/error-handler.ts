import { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'

import { HttpError } from '../utils/http-error'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof ZodError) {
        const firstIssue = error.issues[0]
        const issuePath = firstIssue?.path?.join('.')
        const message = issuePath ? `${issuePath}: ${firstIssue?.message}` : firstIssue?.message ?? 'Validation failed'

        res.status(400).json({
            message,
        })

        return
    }

    const statusCode = error instanceof HttpError ? error.statusCode : 500
    const message = error instanceof Error ? error.message : 'Internal server error'

    res.status(statusCode).json({
        message,
    })
}
