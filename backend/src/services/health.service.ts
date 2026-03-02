import { getDatabaseNow } from '../repositories/health.repository'

type HealthStatus = {
    status: 'ok'
    database: 'connected' | 'not_configured'
    timestamp: string
}

export const getHealthStatus = async (): Promise<HealthStatus> => {
    const databaseNow = await getDatabaseNow()

    return {
        status: 'ok',
        database: databaseNow ? 'connected' : 'not_configured',
        timestamp: new Date().toISOString(),
    }
}
