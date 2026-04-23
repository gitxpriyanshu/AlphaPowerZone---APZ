import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { verifyOwnerJWT } from '../middlewares/ownerAuth.middleware.js';
import { authRateLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

// User routes
router.get('/my-orders', verifyJWT, orderController.getMyOrders);
router.post('/track-guest', orderController.trackGuestOrder);
router.get('/:id/tracking', verifyJWT, authRateLimiter, orderController.getOrderDetails);
router.post('/:id/cancel', verifyJWT, authRateLimiter, orderController.cancelOrder);

// Owner routes
router.patch('/:id/status', verifyOwnerJWT, orderController.updateOrderStatus);

export default router;
