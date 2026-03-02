import { app } from './app'
import { env } from './config/env'

app.listen(env.PORT, env.HOST, () => {
    console.log(`Backend running at http://${env.HOST}:${env.PORT}`)
})
