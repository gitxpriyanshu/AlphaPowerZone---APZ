import { Router } from 'express';
import { register, login, refreshAccessToken, getProfile, updateProfile } from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { z } from 'zod';
const router = Router();
const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});
const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').optional(),
        email: z.string().email('Invalid email address').optional(),
        phone: z.string().min(10, 'Invalid phone number').optional(),
    }),
});
router.post('/register', validate(registerSchema), register);
router.post('/signup', validate(registerSchema), register); // Alias for frontend compatibility
router.post('/login', validate(loginSchema), login);
router.post('/signin', validate(loginSchema), login); // Alias for frontend compatibility
router.post('/refresh-token', refreshAccessToken);
router.get('/me', verifyJWT, getProfile);
router.patch('/update-profile', verifyJWT, validate(updateProfileSchema), updateProfile);
export default router;
