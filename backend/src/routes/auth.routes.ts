import { Router } from 'express'

import {
    loginController,
    logoutController,
    meController,
    registerFirstAdminController,
} from '../controllers/auth.controller'

export const authRouter = Router()

authRouter.post('/register-first-admin', registerFirstAdminController)
authRouter.post('/login', loginController)
authRouter.get('/me', meController)
authRouter.post('/logout', logoutController)
