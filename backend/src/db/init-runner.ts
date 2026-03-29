import { initializeDatabase } from './init'
import { pool } from './pool'

async function run(): Promise<void> {
    console.log('Initializing database schema...')

    try {
        await initializeDatabase()
        console.log('Database schema is ready')
    } catch (error) {
        console.error('Failed to initialize database schema', error)
        process.exitCode = 1
    } finally {
        await pool.end()
    }
}

void run()
