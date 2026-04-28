import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config();
const envSchema = z.object({
    PORT: z.string().default('3007'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().url('Invalid database URL'),
    JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
    CORS_ORIGIN: z.string().min(1, 'CORS origin is required'),
    CLOUDINARY_CLOUD_NAME: z.string().optional(),
    CLOUDINARY_API_KEY: z.string().optional(),
    CLOUDINARY_API_SECRET: z.string().optional(),
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),
    RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
});
const _env = envSchema.safeParse(process.env);
if (!_env.success) {
    console.error('❌ Invalid environment variables:', _env.error.format());
    process.exit(1);
}
export const env = _env.data;
