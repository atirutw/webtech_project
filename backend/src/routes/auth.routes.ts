import { Router } from 'express'

import {
    loginController,
    logoutController,
    meController,
    registerController,
    updateMeController,
} from '../controllers/auth.controller'

export const authRouter = Router()

authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.get('/me', meController)
authRouter.patch('/me', updateMeController)
authRouter.post('/logout', logoutController)
