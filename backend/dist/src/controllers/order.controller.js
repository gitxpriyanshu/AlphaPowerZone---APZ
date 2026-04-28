import { orderService } from '../services/order.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
export const getMyOrders = asyncHandler(async (req, res) => {
    const result = await orderService.getUserOrders(req.user.id);
    return res.status(200).json(new ApiResponse(200, result, 'Orders fetched successfully'));
});
export const getOrderDetails = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const isOwner = !!req.owner;
    const result = await orderService.getOrderById(req.user?.id || '', id, isOwner);
    return res.status(200).json(new ApiResponse(200, result, 'Order details fetched'));
});
export const trackGuestOrder = asyncHandler(async (req, res) => {
    const { orderId, email } = req.body;
    if (!orderId || !email)
        throw new ApiError(400, 'Order ID and Email are required');
    const result = await orderService.trackGuestOrder(orderId, email);
    return res.status(200).json(new ApiResponse(200, result, 'Order tracked successfully'));
});
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, note } = req.body;
    const result = await orderService.updateStatus(id, status, note);
    return res.status(200).json(new ApiResponse(200, result, 'Order status updated successfully'));
});
export const cancelOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await orderService.cancelOrder(req.user.id, id);
    return res.status(200).json(new ApiResponse(200, result, 'Order cancelled successfully'));
});
