import {
    createAuthToken,
    createUser,
    deleteAuthToken,
    findPublicUserByEmail,
    findPublicUserByTokenHash,
    findUserWithPasswordById,
    findUserWithPasswordByEmail,
    updateUser,
} from '../repositories/auth.repository'
import { env } from '../config/env'
import { generateToken, hashPassword, hashToken, verifyPassword } from '../utils/auth'
import { HttpError } from '../utils/http-error'
import { normalizeStoredMediaPath, resolveMediaUrl } from '../utils/media'

type AuthPayload = {
    token: string
    user: {
        id: number
        name: string
        email: string
        role: string
        avatar: string
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

export const register = async (params: {
    name: string
    email: string
    password: string
    adminKey?: string | undefined
}): Promise<AuthPayload> => {
    const email = params.email.toLowerCase()
    const existingUser = await findUserWithPasswordByEmail(email)

    if (existingUser) {
        throw new HttpError(409, 'Email is already in use')
    }

    let role: 'admin' | 'customer' = 'customer'
    const providedAdminKey = params.adminKey?.trim()
    const configuredAdminKey = env.ADMIN_REGISTRATION_KEY.trim()

    if (providedAdminKey) {
        if (!configuredAdminKey) {
            throw new HttpError(403, 'Admin registration is disabled')
        }

        if (providedAdminKey !== configuredAdminKey) {
            throw new HttpError(403, 'Invalid admin key')
        }

        role = 'admin'
    }

    const passwordHash = hashPassword(params.password)

    const user = await createUser({
        name: params.name,
        email,
        passwordHash,
        role,
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
            avatar: resolveMediaUrl(user.avatar_url),
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

export const updateMe = async (
    token: string,
    params: {
        name?: string | undefined
        email?: string | undefined
        currentPassword?: string | undefined
        newPassword?: string | undefined
        avatarPath?: string | undefined
    },
): Promise<AuthPayload['user']> => {
    const tokenHash = hashToken(token)
    const currentUser = await findPublicUserByTokenHash(tokenHash)

    if (!currentUser) {
        throw new HttpError(401, 'Unauthorized')
    }

    const updates: {
        name?: string | undefined
        email?: string | undefined
        passwordHash?: string | undefined
        avatarPath?: string | undefined
    } = {}

    if (params.name !== undefined) {
        updates.name = params.name
    }

    if (params.email !== undefined) {
        const normalizedEmail = params.email.toLowerCase()

        const existingUser = await findPublicUserByEmail(normalizedEmail)
        if (existingUser && existingUser.id !== currentUser.id) {
            throw new HttpError(409, 'Email is already in use')
        }

        updates.email = normalizedEmail
    }

    if (params.newPassword !== undefined) {
        if (!params.currentPassword) {
            throw new HttpError(400, 'Current password is required to set a new password')
        }

        const userWithPassword = await findUserWithPasswordById(currentUser.id)

        if (!userWithPassword) {
            throw new HttpError(404, 'User not found')
        }

        const passwordMatches = verifyPassword(params.currentPassword, userWithPassword.password_hash)
        if (!passwordMatches) {
            throw new HttpError(401, 'Current password is incorrect')
        }

        updates.passwordHash = hashPassword(params.newPassword)
    }

    if (params.avatarPath !== undefined) {
        updates.avatarPath = normalizeStoredMediaPath(params.avatarPath)
    }

    const updatedUser = await updateUser(currentUser.id, updates)

    if (!updatedUser) {
        throw new HttpError(404, 'User not found')
    }

    return updatedUser
}

export const updateMyAvatar = async (token: string, avatarPath: string): Promise<AuthPayload['user']> => {
    const normalizedAvatarPath = normalizeStoredMediaPath(avatarPath)

    if (!normalizedAvatarPath.startsWith('/media/avatars/')) {
        throw new HttpError(400, 'Invalid avatar path')
    }

    return updateMe(token, { avatarPath: normalizedAvatarPath })
}
