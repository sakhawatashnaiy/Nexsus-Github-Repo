import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDb } from './config/db.js';
import { logger } from './utils/logger.js';
import { initSignalingServer } from './realtime/signaling.js';
await connectDb();
const app = createApp();
const server = app.listen(env.PORT, () => {
    logger.info(`API listening on :${env.PORT}`);
});
initSignalingServer(server);
