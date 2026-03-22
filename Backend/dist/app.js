import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'node:path';
import { env } from './config/env.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import { routes } from './routes/index.js';
import { logger } from './utils/logger.js';
export function createApp() {
    const app = express();
    // Needed when running behind proxies (Render, Vercel, etc.)
    if (env.NODE_ENV === 'production') {
        app.set('trust proxy', 1);
    }
    // Avoid 304 responses for JSON APIs (304 has no body and breaks clients expecting JSON)
    app.set('etag', false);
    app.disable('x-powered-by');
    const allowedOrigins = env.CORS_ORIGIN.split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    const isOriginAllowed = (origin) => {
        // Exact match
        if (allowedOrigins.includes(origin))
            return true;
        // Wildcard: https://*.vercel.app
        for (const pattern of allowedOrigins) {
            if (!pattern.includes('*'))
                continue;
            const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
            const re = new RegExp(`^${escaped}$`);
            if (re.test(origin))
                return true;
        }
        return false;
    };
    const corsOptions = {
        origin: (origin, callback) => {
            // Allow non-browser tools (curl/postman) with no Origin header
            if (!origin)
                return callback(null, true);
            return callback(null, isOriginAllowed(origin));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        optionsSuccessStatus: 204,
    };
    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));
    app.use(helmet());
    app.use(mongoSanitize());
    app.use(hpp());
    app.use(compression());
    app.use(cookieParser());
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true }));
    app.use(rateLimit({
        windowMs: 60_000,
        limit: 120,
        standardHeaders: true,
        legacyHeaders: false,
    }));
    app.use(morgan('combined', {
        stream: { write: (msg) => logger.info(msg.trim()) },
    }));
    app.get('/health', (_req, res) => res.json({ success: true, message: 'OK' }));
    // Local uploads (if enabled)
    app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));
    app.use('/api', (_req, res, next) => {
        res.setHeader('cache-control', 'no-store');
        next();
    });
    app.use('/api', routes);
    app.use(globalErrorHandler);
    return app;
}
