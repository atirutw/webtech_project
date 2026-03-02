import { RequestHandler } from 'express'

import { getHealthStatus } from '../services/health.service'

export const getHealthController: RequestHandler = async (_req, res, next) => {
    try {
        const payload = await getHealthStatus()
        res.status(200).json(payload)
    } catch (error) {
        next(error)
    }
}
