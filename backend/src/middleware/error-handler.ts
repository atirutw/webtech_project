import { ErrorRequestHandler } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'

import { HttpError } from '../utils/http-error'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
        const message =
            error.code === 'LIMIT_FILE_SIZE'
                ? 'Image size must be 5MB or less'
                : error.code === 'LIMIT_UNEXPECTED_FILE'
                    ? 'Unsupported file type. Please upload an image file.'
                    : error.message

        res.status(400).json({
            message,
        })

        return
    }

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
