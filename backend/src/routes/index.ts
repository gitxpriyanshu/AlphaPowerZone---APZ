import { Router } from 'express';
import productRoutes from './product.route.js';
import wishlistRoutes from './wishlist.route.js';
import reviewRoutes from './review.route.js';
import pincodeRoutes from './pincode.route.js';
import analyticsRoutes from './analytics.route.js';
import addressRoutes from './address.route.js';
import orderRoutes from './order.route.js';
import paymentRoutes from './payment.route.js';
import trackerRoutes from './tracker.route.js';
import authRoutes from './auth.route.js';
import ownerRoutes from './owner.route.js';
import fitnessRoutes from './fitness.route.js';
import { getSitemap } from '../controllers/sitemap.controller.js';

const router = Router();

router.use('/users', authRoutes);
router.use('/auth', authRoutes); // Alias for frontend compatibility
router.use('/owners', ownerRoutes);
router.use('/products', productRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/reviews', reviewRoutes);
router.use('/pincode', pincodeRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/addresses', addressRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/tracker', trackerRoutes);
router.use('/fitness', fitnessRoutes);

router.get('/sitemap.xml', getSitemap);

export default router;
