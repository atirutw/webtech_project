import type { PublicUser } from '../repositories/auth.repository'

declare global {
    namespace Express {
        interface Request {
            authUser?: PublicUser
        }
    }
}

export { }
