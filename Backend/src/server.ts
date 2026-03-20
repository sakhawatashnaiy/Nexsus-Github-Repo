import { createApp } from './app.ts'
import { env } from './config/env.ts'
import { connectDb } from './config/db.ts'
import { logger } from './utils/logger.ts'
import { initSignalingServer } from './realtime/signaling.ts'

await connectDb()

const app = createApp()

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on :${env.PORT}`)
})

initSignalingServer(server)
