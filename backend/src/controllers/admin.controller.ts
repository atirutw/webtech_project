import { RequestHandler } from 'express'
import { z } from 'zod'

import { deleteUserAsAdmin, getAdminDashboard, getUsersAsAdmin, updateUserAsAdmin } from '../services/admin.service'
import { HttpError } from '../utils/http-error'

const userIdSchema = z.object({
    id: z.coerce.number().int().positive(),
})

const updateUserSchema = z
    .object({
        name: z.string().trim().min(2).optional(),
        email: z.string().email().optional(),
        role: z.enum(['admin', 'customer']).optional(),
    })
    .refine((payload) => Object.keys(payload).length > 0, {
        message: 'At least one field is required',
    })

const dashboardQuerySchema = z.object({
    days: z.coerce.number().int().min(3).max(30).optional(),
})

export const listUsersController: RequestHandler = async (_req, res, next) => {
    try {
        const users = await getUsersAsAdmin()

        res.status(200).json({ users })
    } catch (error) {
        next(error)
    }
}

export const updateUserController: RequestHandler = async (req, res, next) => {
    try {
        const actingUser = req.authUser
        if (!actingUser) {
            throw new HttpError(401, 'Unauthorized')
        }

        const params = userIdSchema.parse(req.params)
        const payload = updateUserSchema.parse(req.body)
        const user = await updateUserAsAdmin(actingUser.id, params.id, payload)

        res.status(200).json({ user })
    } catch (error) {
        next(error)
    }
}

export const deleteUserController: RequestHandler = async (req, res, next) => {
    try {
        const actingUser = req.authUser
        if (!actingUser) {
            throw new HttpError(401, 'Unauthorized')
        }

        const params = userIdSchema.parse(req.params)
        await deleteUserAsAdmin(actingUser.id, params.id)

        res.status(204).send()
    } catch (error) {
        next(error)
    }
}

export const getDashboardController: RequestHandler = async (req, res, next) => {
    try {
        const query = dashboardQuerySchema.parse(req.query)
        const dashboard = await getAdminDashboard(query.days ?? 7)

        res.status(200).json({ dashboard })
    } catch (error) {
        next(error)
    }
}
