import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().int().positive().default(4000),
    PUBLIC_BASE_URL: z.string().url().default('http://localhost:4000'),
    DATABASE_URL: z
        .string()
        .default('postgresql://api:api@localhost:5432/musicstore'),
    ADMIN_REGISTRATION_KEY: z.string().default(''),
    SEED_ADMIN_NAME: z.string().default('System Admin'),
    SEED_ADMIN_EMAIL: z.string().email().default('admin@musicstore.local'),
    SEED_ADMIN_PASSWORD: z.string().min(8).default('AdminPass123!'),
    SEED_CUSTOMER_NAME: z.string().default('Demo Customer'),
    SEED_CUSTOMER_EMAIL: z.string().email().default('customer@musicstore.local'),
    SEED_CUSTOMER_PASSWORD: z.string().min(8).default('CustomerPass123!'),
})

export const env = envSchema.parse(process.env)
