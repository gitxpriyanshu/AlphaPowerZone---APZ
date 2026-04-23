import prisma from '../config/database.js';
import { ApiError } from '../utils/ApiError.js';
export const orderService = {
    /**
     * Get all orders for a user
     */
    getUserOrders: async (userId) => {
        return prisma.order.findMany({
            where: { userId },
            include: {
                items: { include: { product: true } },
                address: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    },
    /**
     * Get order with details and tracking
     */
    getOrderById: async (userId, orderId, isOwner = false) => {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                address: true,
                user: { select: { name: true, email: true } },
            },
        });
        if (!order)
            throw new ApiError(404, 'Order not found');
        if (!isOwner && order.userId !== userId)
            throw new ApiError(403, 'Unauthorized');
        return order;
    },
    /**
     * Track order as guest (Requires Order ID and Email)
     */
    trackGuestOrder: async (orderId, email) => {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { product: true } },
                address: true,
                user: { select: { email: true, name: true } },
            },
        });
        if (!order)
            throw new ApiError(404, 'Order not found');
        if (order.user.email !== email)
            throw new ApiError(403, 'Unauthorized access to this order');
        return order;
    },
    /**
     * Update order status (Owner only)
     */
    updateStatus: async (orderId, status, note) => {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order)
            throw new ApiError(404, 'Order not found');
        return prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                notes: note ? `${order.notes || ''}\n[${new Date().toISOString()}] ${status}: ${note}` : order.notes,
            },
        });
    },
    /**
     * Cancel order (User only, if PENDING)
     */
    cancelOrder: async (userId, orderId) => {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || order.userId !== userId)
            throw new ApiError(404, 'Order not found');
        if (order.status !== 'PENDING') {
            throw new ApiError(400, `Cannot cancel order in ${order.status} state`);
        }
        return prisma.order.update({
            where: { id: orderId },
            data: { status: 'CANCELLED' },
        });
    },
};
