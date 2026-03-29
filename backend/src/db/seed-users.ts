import { env } from '../config/env'
import { hashPassword } from '../utils/auth'
import { initializeDatabase } from './init'
import { pool } from './pool'

type SeedUser = {
    name: string
    email: string
    password: string
    role: 'admin' | 'customer'
}

const seedUsers: SeedUser[] = [
    {
        name: env.SEED_ADMIN_NAME,
        email: env.SEED_ADMIN_EMAIL.toLowerCase(),
        password: env.SEED_ADMIN_PASSWORD,
        role: 'admin',
    },
    {
        name: env.SEED_CUSTOMER_NAME,
        email: env.SEED_CUSTOMER_EMAIL.toLowerCase(),
        password: env.SEED_CUSTOMER_PASSWORD,
        role: 'customer',
    },
]

async function seed(): Promise<void> {
    console.log('Seeding users...')

    await initializeDatabase()

    const client = await pool.connect()

    try {
        await client.query('BEGIN')

        for (const user of seedUsers) {
            const passwordHash = hashPassword(user.password)

            await client.query(
                `
                INSERT INTO users (name, email, password_hash, role)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email)
                DO UPDATE SET
                    name = EXCLUDED.name,
                    password_hash = EXCLUDED.password_hash,
                    role = EXCLUDED.role
                `,
                [user.name, user.email, passwordHash, user.role],
            )

            console.log(`Upserted ${user.role} user: ${user.email}`)
        }

        await client.query('COMMIT')
        console.log('User seed completed successfully')
    } catch (error) {
        await client.query('ROLLBACK')
        console.error('User seed failed', error)
        process.exitCode = 1
    } finally {
        client.release()
        await pool.end()
    }
}

void seed()
