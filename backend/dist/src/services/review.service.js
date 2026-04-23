import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
export const reviewService = {
    /**
     * Recalculate product rating stats
     */
    updateProductRating: async (productId) => {
        const stats = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true },
        });
        await prisma.product.update({
            where: { id: productId },
            data: {
                avgRating: stats._avg.rating || 0,
                reviewCount: stats._count.rating || 0,
            },
        });
    },
    /**
     * Get reviews for a product
     */
    getProductReviews: async (productId, page = 1, limit = 10) => {
        const skip = (page - 1) * limit;
        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: { productId },
                include: {
                    user: {
                        select: { name: true, avatar: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.review.count({ where: { productId } }),
        ]);
        return { reviews, total, page, totalPages: Math.ceil(total / limit) };
    },
    /**
     * Create review
     */
    createReview: async (userId, productId, data) => {
        // Check if user purchased the product
        const order = await prisma.order.findFirst({
            where: {
                userId,
                status: 'DELIVERED',
                items: {
                    some: { productId },
                },
            },
        });
        if (!order) {
            throw new ApiError(403, 'You can only review products you have purchased and received');
        }
        const existing = await prisma.review.findUnique({
            where: { userId_productId: { userId, productId } },
        });
        if (existing)
            throw new ApiError(400, 'You have already reviewed this product');
        const review = await prisma.$transaction(async (tx) => {
            const newReview = await tx.review.create({
                data: {
                    userId,
                    productId,
                    ...data,
                },
            });
            // Stats update will be triggered outside or in tx
            return newReview;
        });
        await reviewService.updateProductRating(productId);
        return review;
    },
    /**
     * Update review
     */
    updateReview: async (userId, reviewId, data) => {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review)
            throw new ApiError(404, 'Review not found');
        if (review.userId !== userId)
            throw new ApiError(403, 'You can only update your own review');
        const updated = await prisma.review.update({
            where: { id: reviewId },
            data,
        });
        await reviewService.updateProductRating(review.productId);
        return updated;
    },
    /**
     * Delete review
     */
    deleteReview: async (userId, reviewId, isOwner = false) => {
        const review = await prisma.review.findUnique({ where: { id: reviewId } });
        if (!review)
            throw new ApiError(404, 'Review not found');
        if (!isOwner && review.userId !== userId) {
            throw new ApiError(403, 'Unauthorized');
        }
        await prisma.review.delete({ where: { id: reviewId } });
        await reviewService.updateProductRating(review.productId);
    },
};
