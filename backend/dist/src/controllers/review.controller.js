import { reviewService } from '../services/review.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const getProductReviews = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { page, limit } = req.query;
    const result = await reviewService.getProductReviews(productId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    return res.status(200).json(new ApiResponse(200, result, 'Reviews fetched successfully'));
});
export const createReview = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const review = await reviewService.createReview(req.user.id, productId, req.body);
    return res.status(201).json(new ApiResponse(201, review, 'Review created successfully'));
});
export const updateReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const review = await reviewService.updateReview(req.user.id, reviewId, req.body);
    return res.status(200).json(new ApiResponse(200, review, 'Review updated successfully'));
});
export const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const isOwner = !!req.owner;
    await reviewService.deleteReview(req.user?.id || '', reviewId, isOwner);
    return res.status(200).json(new ApiResponse(200, null, 'Review deleted successfully'));
});
