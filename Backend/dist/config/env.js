import dotenv from 'dotenv';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(moduleDir, '../../.env');
dotenv.config({ path: envPath });
const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3000),
    MONGODB_URI: z.string().trim().min(1),
    JWT_ACCESS_SECRET: z.string().trim().min(16),
    JWT_REFRESH_SECRET: z.string().trim().min(16),
    JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
    // Comma-separated allowlist. Supports wildcard patterns like "https://*.vercel.app".
    // NOTE: On Render, if you forget to set CORS_ORIGIN, this default keeps typical Vercel deployments working.
    CORS_ORIGIN: z
        .string()
        .default('http://localhost:5173,http://localhost:5174,https://*.vercel.app'),
    COOKIE_SECURE: z.coerce.boolean().default(false),
    UPLOAD_PROVIDER: z.enum(['local', 'cloudinary']).default('local'),
    UPLOAD_DIR: z.string().default('uploads'),
    PAYMENT_PROVIDER: z.enum(['mock', 'stripe', 'paypal']).default('mock'),
    STRIPE_SECRET_KEY: z.string().trim().optional(),
    PAYPAL_CLIENT_ID: z.string().trim().optional(),
    PAYPAL_CLIENT_SECRET: z.string().trim().optional(),
});
export const env = schema.parse(process.env);
