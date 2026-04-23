import { Router } from 'express';
import { signin, logout } from '../controllers/owner.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { z } from 'zod';

const router = Router();

const signinSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
    secretKey: z.string().min(1, 'Secret Key is required'),
  }),
});

router.post('/signin', validate(signinSchema), signin);
router.post('/logout', logout);

export default router;
