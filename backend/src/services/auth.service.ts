import {
    countUsers,
    createAuthToken,
    createUser,
    deleteAuthToken,
    findPublicUserByTokenHash,
    findUserWithPasswordByEmail,
} from '../repositories/auth.repository'
import { generateToken, hashPassword, hashToken, verifyPassword } from '../utils/auth'
import { HttpError } from '../utils/http-error'

type AuthPayload = {
    token: string
    user: {
        id: number
        name: string
        email: string
        role: string
        createdAt: string
    }
}

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7

const createSession = async (userId: number): Promise<{ token: string; expiresAt: Date }> => {
    const token = generateToken()
    const tokenHash = hashToken(token)
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

    await createAuthToken({
        userId,
        tokenHash,
        expiresAt,
    })

    return {
        token,
        expiresAt,
    }
}

export const registerFirstAdmin = async (params: {
    name: string
    email: string
    password: string
}): Promise<AuthPayload> => {
    const existingUsers = await countUsers()

    if (existingUsers > 0) {
        throw new HttpError(409, 'First admin has already been created')
    }

    const passwordHash = hashPassword(params.password)

    const user = await createUser({
        name: params.name,
        email: params.email.toLowerCase(),
        passwordHash,
        role: 'admin',
    })

    const session = await createSession(user.id)

    return {
        token: session.token,
        user,
    }
}

export const login = async (params: { email: string; password: string }): Promise<AuthPayload> => {
    const user = await findUserWithPasswordByEmail(params.email.toLowerCase())

    if (!user) {
        throw new HttpError(401, 'Invalid email or password')
    }

    const passwordMatches = verifyPassword(params.password, user.password_hash)

    if (!passwordMatches) {
        throw new HttpError(401, 'Invalid email or password')
    }

    const session = await createSession(user.id)

    return {
        token: session.token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.created_at.toISOString(),
        },
    }
}

export const getMe = async (token: string): Promise<AuthPayload['user']> => {
    const tokenHash = hashToken(token)
    const user = await findPublicUserByTokenHash(tokenHash)

    if (!user) {
        throw new HttpError(401, 'Unauthorized')
    }

    return user
}

export const logout = async (token: string): Promise<void> => {
    const tokenHash = hashToken(token)
    await deleteAuthToken(tokenHash)
}
