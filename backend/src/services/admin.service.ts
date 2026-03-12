import {
    AdminUser,
    countAdmins,
    deleteUserById,
    findUserById,
    listUsers,
    updateUserByAdmin,
} from '../repositories/admin.repository'
import { HttpError } from '../utils/http-error'

export const getUsersAsAdmin = async (): Promise<AdminUser[]> => {
    return listUsers()
}

export const updateUserAsAdmin = async (
    actingUserId: number,
    targetUserId: number,
    payload: {
        name?: string | undefined
        email?: string | undefined
        role?: 'admin' | 'customer' | undefined
    },
): Promise<AdminUser> => {
    const targetUser = await findUserById(targetUserId)

    if (!targetUser) {
        throw new HttpError(404, 'User not found')
    }

    if (payload.role === 'customer' && targetUser.role === 'admin') {
        const adminCount = await countAdmins()

        if (adminCount <= 1) {
            throw new HttpError(409, 'Cannot demote the last admin user')
        }
    }

    if (actingUserId === targetUserId && payload.role === 'customer') {
        throw new HttpError(409, 'You cannot remove your own admin role')
    }

    try {
        const user = await updateUserByAdmin(targetUserId, payload)

        if (!user) {
            throw new HttpError(404, 'User not found')
        }

        return user
    } catch (error) {
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
            throw new HttpError(409, 'Email is already in use')
        }

        throw error
    }
}

export const deleteUserAsAdmin = async (actingUserId: number, targetUserId: number): Promise<void> => {
    if (actingUserId === targetUserId) {
        throw new HttpError(409, 'You cannot delete your own account')
    }

    const targetUser = await findUserById(targetUserId)

    if (!targetUser) {
        throw new HttpError(404, 'User not found')
    }

    if (targetUser.role === 'admin') {
        const adminCount = await countAdmins()

        if (adminCount <= 1) {
            throw new HttpError(409, 'Cannot delete the last admin user')
        }
    }

    const deleted = await deleteUserById(targetUserId)

    if (!deleted) {
        throw new HttpError(404, 'User not found')
    }
}
