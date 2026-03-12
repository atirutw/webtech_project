import { app } from './app'
import { env } from './config/env'
import { initializeDatabase } from './db/init'

const startServer = async (): Promise<void> => {
    await initializeDatabase()

    app.listen(env.PORT, env.HOST, () => {
        console.log(`Backend running at http://${env.HOST}:${env.PORT}`)
    })
}

startServer().catch((error: unknown) => {
    console.error('Failed to start backend', error)
    process.exit(1)
})
