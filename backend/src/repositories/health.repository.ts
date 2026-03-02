import { pool } from '../db/pool'

export const getDatabaseNow = async (): Promise<Date | null> => {
    if (!pool) {
        return null
    }

    const result = await pool.query<{ now: Date }>('SELECT NOW() as now')
    return result.rows[0]?.now ?? null
}
