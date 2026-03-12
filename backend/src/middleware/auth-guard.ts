import { RequestHandler } from 'express'

import { findPublicUserByTokenHash } from '../repositories/auth.repository'
import { hashToken } from '../utils/auth'
import { HttpError } from '../utils/http-error'

const getBearerToken = (authorizationHeader?: string): string => {
    if (!authorizationHeader?.startsWith('Bearer ')) {
        throw new HttpError(401, 'Unauthorized')
    }

    const token = authorizationHeader.slice(7).trim()

    if (!token) {
        throw new HttpError(401, 'Unauthorized')
    }

    return token
}

export const requireAuth: RequestHandler = async (req, _res, next) => {
    try {
        const token = getBearerToken(req.header('authorization'))
        const tokenHash = hashToken(token)
        const user = await findPublicUserByTokenHash(tokenHash)

        if (!user) {
            throw new HttpError(401, 'Unauthorized')
        }

        req.authUser = user
        next()
    } catch (error) {
        next(error)
    }
}

export const requireAdmin: RequestHandler = (req, _res, next) => {
    if (!req.authUser) {
        next(new HttpError(401, 'Unauthorized'))
        return
    }

    if (req.authUser.role !== 'admin') {
        next(new HttpError(403, 'Admin access required'))
        return
    }

    next()
}
