import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import path from 'node:path'
import { env } from './config/env.ts'
import { globalErrorHandler } from './middlewares/error.middleware.ts'
import { routes } from './routes/index.ts'
import { logger } from './utils/logger.ts'

export function createApp() {
	const app = express()

	// Avoid 304 responses for JSON APIs (304 has no body and breaks clients expecting JSON)
	app.set('etag', false)

	app.disable('x-powered-by')

	app.use(
		cors({
			origin: env.CORS_ORIGIN.split(',').map((s) => s.trim()),
			credentials: true,
		}),
	)

	app.use(helmet())
	app.use(mongoSanitize())
	app.use(hpp())
	app.use(compression())
	app.use(cookieParser())
	app.use(express.json({ limit: '1mb' }))
	app.use(express.urlencoded({ extended: true }))

	app.use(
		rateLimit({
			windowMs: 60_000,
			limit: 120,
			standardHeaders: true,
			legacyHeaders: false,
		}),
	)

	app.use(
		morgan('combined', {
			stream: { write: (msg) => logger.info(msg.trim()) },
		}),
	)

	app.get('/health', (_req, res) => res.json({ success: true, message: 'OK' }))

	// Local uploads (if enabled)
	app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)))

	app.use('/api', (_req, res, next) => {
		res.setHeader('cache-control', 'no-store')
		next()
	})

	app.use('/api', routes)

	app.use(globalErrorHandler)
	return app
}
