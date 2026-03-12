import { pool } from '../db/pool'

type UserRow = {
    id: number
    name: string
    email: string
    password_hash: string
    role: string
    created_at: Date
}

export type PublicUser = {
    id: number
    name: string
    email: string
    role: string
    createdAt: string
}

const toPublicUser = (row: UserRow): PublicUser => ({
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    createdAt: row.created_at.toISOString(),
})

export const createUser = async (params: {
    name: string
    email: string
    passwordHash: string
    role: 'admin' | 'customer'
}): Promise<PublicUser> => {
    const result = await pool.query<UserRow>(
        `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, password_hash, role, created_at
        `,
        [params.name, params.email, params.passwordHash, params.role],
    )

    const user = result.rows[0]

    if (!user) {
        throw new Error('Failed to create user')
    }

    return toPublicUser(user)
}

export const findUserWithPasswordByEmail = async (email: string): Promise<UserRow | null> => {
    const result = await pool.query<UserRow>(
        `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE email = $1
        LIMIT 1
        `,
        [email],
    )

    return result.rows[0] ?? null
}

export const findUserWithPasswordById = async (id: number): Promise<UserRow | null> => {
    const result = await pool.query<UserRow>(
        `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [id],
    )

    return result.rows[0] ?? null
}

export const findPublicUserByEmail = async (email: string): Promise<PublicUser | null> => {
    const result = await pool.query<UserRow>(
        `
        SELECT id, name, email, password_hash, role, created_at
        FROM users
        WHERE email = $1
        LIMIT 1
        `,
        [email],
    )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return toPublicUser(user)
}

export const findPublicUserByTokenHash = async (tokenHash: string): Promise<PublicUser | null> => {
    const result = await pool.query<UserRow>(
        `
        SELECT u.id, u.name, u.email, u.password_hash, u.role, u.created_at
        FROM auth_tokens t
        JOIN users u ON u.id = t.user_id
        WHERE t.token_hash = $1
          AND t.expires_at > NOW()
        LIMIT 1
        `,
        [tokenHash],
    )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return toPublicUser(user)
}

export const updateUser = async (
    id: number,
    params: {
        name?: string | undefined
        email?: string | undefined
        passwordHash?: string | undefined
    },
): Promise<PublicUser | null> => {
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

    if (params.passwordHash !== undefined) {
        values.push(params.passwordHash)
        updates.push(`password_hash = $${values.length}`)
    }

    if (updates.length === 0) {
        const existing = await findUserWithPasswordById(id)
        return existing ? toPublicUser(existing) : null
    }

    values.push(id)

    const result = await pool.query<UserRow>(
        `
        UPDATE users
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, name, email, password_hash, role, created_at
        `,
        values,
    )

    const user = result.rows[0]

    if (!user) {
        return null
    }

    return toPublicUser(user)
}

export const createAuthToken = async (params: {
    userId: number
    tokenHash: string
    expiresAt: Date
}): Promise<void> => {
    await pool.query(
        `
        INSERT INTO auth_tokens (user_id, token_hash, expires_at)
        VALUES ($1, $2, $3)
        `,
        [params.userId, params.tokenHash, params.expiresAt.toISOString()],
    )
}

export const deleteAuthToken = async (tokenHash: string): Promise<void> => {
    await pool.query('DELETE FROM auth_tokens WHERE token_hash = $1', [tokenHash])
}
