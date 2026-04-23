import { wishlistService } from '../services/wishlist.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
export const getWishlist = asyncHandler(async (req, res) => {
    const result = await wishlistService.getWishlist(req.user.id);
    return res.status(200).json(new ApiResponse(200, result, 'Wishlist fetched successfully'));
});
export const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const result = await wishlistService.toggleWishlist(req.user.id, productId);
    const message = result.added ? 'Added to wishlist' : 'Removed from wishlist';
    return res.status(200).json(new ApiResponse(200, result, message));
});
export const removeFromWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    await wishlistService.removeItem(req.user.id, productId);
    return res.status(200).json(new ApiResponse(200, null, 'Item removed from wishlist'));
});
export const clearWishlist = asyncHandler(async (req, res) => {
    await wishlistService.clearWishlist(req.user.id);
    return res.status(200).json(new ApiResponse(200, null, 'Wishlist cleared successfully'));
});
