import { Router } from 'express'

import {
    loginController,
    logoutController,
    meController,
    registerController,
    updateAvatarController,
    updateMeController,
} from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth-guard'
import { userAvatarUpload } from '../middleware/media-upload'

export const authRouter = Router()

authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.get('/me', meController)
authRouter.patch('/me', updateMeController)
authRouter.post('/me/avatar', requireAuth, userAvatarUpload.single('file'), updateAvatarController)
authRouter.post('/logout', logoutController)
