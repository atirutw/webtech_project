import { config } from 'dotenv'
import { z } from 'zod'

config()

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    HOST: z.string().default('0.0.0.0'),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().optional(),
})

export const env = envSchema.parse(process.env)
