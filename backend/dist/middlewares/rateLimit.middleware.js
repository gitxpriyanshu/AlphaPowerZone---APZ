import rateLimit from 'express-rate-limit';
import { ApiError } from '../utils/ApiError.js';
/**
 * Public route rate limiter
 * 100 requests per 15 minutes
 */
export const publicRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: () => {
        throw new ApiError(429, 'Too many requests from this IP, please try again after 15 minutes');
    },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Auth route rate limiter (Login, Register, Profile updates)
 * 30 requests per 15 minutes
 */
export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: () => {
        throw new ApiError(429, 'Too many attempts, please try again after 15 minutes');
    },
    standardHeaders: true,
    legacyHeaders: false,
});
