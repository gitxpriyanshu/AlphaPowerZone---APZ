import { Router } from 'express';
import * as pincodeController from '../controllers/pincode.controller.js';
import { publicRateLimiter } from '../middlewares/rateLimit.middleware.js';
const router = Router();
router.get('/:pincode', publicRateLimiter, pincodeController.lookupPincode);
export default router;
