import { RequestHandler } from 'express'
import { z } from 'zod'

import { getMe, login, logout, register, updateMe, updateMyAvatar } from '../services/auth.service'
import { resolveMediaUrl } from '../utils/media'
import { HttpError } from '../utils/http-error'

const registerSchema = z.object({
    name: z.string().trim().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    adminKey: z.string().trim().min(1).optional(),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
})

const updateMeSchema = z
    .object({
        name: z.string().trim().min(2).optional(),
        email: z.string().email().optional(),
        currentPassword: z.string().min(1).optional(),
        newPassword: z.string().min(8).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, {
        message: 'At least one field is required',
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

export const registerController: RequestHandler = async (req, res, next) => {
    try {
        const payload = registerSchema.parse(req.body)
        const response = await register(payload)

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

export const updateMeController: RequestHandler = async (req, res, next) => {
    try {
        const token = getBearerToken(req.header('authorization'))
        const payload = updateMeSchema.parse(req.body)
        const response = await updateMe(token, payload)

        res.status(200).json({ user: response })
    } catch (error) {
        next(error)
    }
}

export const updateAvatarController: RequestHandler = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new HttpError(400, 'Avatar image is required')
        }

        const token = getBearerToken(req.header('authorization'))
        const avatarPath = `/media/avatars/${req.file.filename}`
        const response = await updateMyAvatar(token, avatarPath)

        res.status(200).json({
            user: response,
            avatar: {
                path: avatarPath,
                url: resolveMediaUrl(avatarPath),
                mimeType: req.file.mimetype,
                size: req.file.size,
            },
        })
    } catch (error) {
        next(error)
    }
}
