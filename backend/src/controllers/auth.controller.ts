import { RequestHandler } from 'express'
import { z } from 'zod'

import { getMe, login, logout, registerFirstAdmin } from '../services/auth.service'
import { HttpError } from '../utils/http-error'

const registerSchema = z.object({
    name: z.string().trim().min(2),
    email: z.string().email(),
    password: z.string().min(8),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

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

export const registerFirstAdminController: RequestHandler = async (req, res, next) => {
    try {
        const payload = registerSchema.parse(req.body)
        const response = await registerFirstAdmin(payload)

        res.status(201).json(response)
    } catch (error) {
        next(error)
    }
}

export const loginController: RequestHandler = async (req, res, next) => {
    try {
        const payload = loginSchema.parse(req.body)
        const response = await login(payload)

        res.status(200).json(response)
    } catch (error) {
        next(error)
    }
}

export const meController: RequestHandler = async (req, res, next) => {
    try {
        const token = getBearerToken(req.header('authorization'))
        const response = await getMe(token)

        res.status(200).json({ user: response })
    } catch (error) {
        next(error)
    }
}

export const logoutController: RequestHandler = async (req, res, next) => {
    try {
        const token = getBearerToken(req.header('authorization'))
        await logout(token)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}
