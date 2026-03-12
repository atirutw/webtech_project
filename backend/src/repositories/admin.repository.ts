import { pool } from '../db/pool'

type UserRow = {
    id: number
    name: string
    email: string
    role: 'admin' | 'customer'
    created_at: Date
}

export type AdminUser = {
    id: number
    name: string
    email: string
    role: 'admin' | 'customer'
    createdAt: string
}

const toAdminUser = (row: UserRow): AdminUser => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at.toISOString(),
})

export const listUsers = async (): Promise<AdminUser[]> => {
    const result = await pool.query<UserRow>(
        `
        SELECT id, name, email, role, created_at
        FROM users
        ORDER BY created_at DESC
        `,
    )

    return result.rows.map(toAdminUser)
}

export const findUserById = async (id: number): Promise<AdminUser | null> => {
    const result = await pool.query<UserRow>(
        `
        SELECT id, name, email, role, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [id],
    )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return toAdminUser(user)
}

export const countAdmins = async (): Promise<number> => {
    const result = await pool.query<{ count: string }>(
        `
        SELECT COUNT(*)::text AS count
        FROM users
        WHERE role = 'admin'
        `,
    )

    return Number(result.rows[0]?.count ?? 0)
}

export const updateUserByAdmin = async (
    id: number,
    params: {
        name?: string | undefined
        email?: string | undefined
        role?: 'admin' | 'customer' | undefined
    },
): Promise<AdminUser | null> => {
    const updates: string[] = []
    const values: Array<string | number> = []

    if (params.name !== undefined) {
        values.push(params.name)
        updates.push(`name = $${values.length}`)
    }

    if (params.email !== undefined) {
        values.push(params.email)
        updates.push(`email = $${values.length}`)
    }

    if (params.role !== undefined) {
        values.push(params.role)
        updates.push(`role = $${values.length}`)
    }

    if (updates.length === 0) {
        return findUserById(id)
    }

    values.push(id)

    const result = await pool.query<UserRow>(
        `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, name, email, role, created_at
        `,
        values,
    )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return toAdminUser(user)
}

export const deleteUserById = async (id: number): Promise<boolean> => {
    const result = await pool.query('DELETE FROM users WHERE id = $1', [id])
    return (result.rowCount ?? 0) > 0
}
