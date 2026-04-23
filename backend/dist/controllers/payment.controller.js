import { paymentService } from '../services/payment.service.js';
import prisma from '../config/database.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import crypto from 'crypto';
export const createOrder = asyncHandler(async (req, res) => {
    const { cartItems, addressId } = req.body;
    const userId = req.user.id;
    // 1. Calculate total from DB (Don't trust client)
    let subtotal = 0;
    const itemsToCreate = [];
    for (const item of cartItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product)
            throw new ApiError(404, `Product not found: ${item.productId}`);
        if (product.stock < item.qty)
            throw new ApiError(400, `Insufficient stock for ${product.name}`);
        subtotal += product.price * item.qty;
        itemsToCreate.push({
            productId: product.id,
            qty: item.qty,
            price: product.price,
            size: item.size,
        });
    }
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + shipping;
    // 2. Create Razorpay order
    const receipt = `rcpt_${Date.now()}`;
    const rzpOrder = await paymentService.createRazorpayOrder(total, receipt);
    // 3. Create Order in DB
    const order = await prisma.order.create({
        data: {
            userId,
            addressId,
            subtotal,
            total,
            paymentMethod: 'ONLINE',
            paymentStatus: 'PENDING',
            status: 'PENDING',
            razorpayOrderId: rzpOrder.id,
            items: {
                create: itemsToCreate,
            },
        },
    });
    return res.status(201).json(new ApiResponse(201, {
        razorpayOrderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        orderId: order.id,
        keyId: env.RAZORPAY_KEY_ID,
    }, 'Payment order created'));
});
export const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
    const isValid = paymentService.verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
        throw new ApiError(400, 'Invalid payment signature');
    }
    const existingOrder = await prisma.order.findUnique({ where: { id: orderId } });
    // Update Order in DB
    const order = await prisma.order.update({
        where: { id: orderId },
        data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paymentMethod: 'ONLINE', // Update method if they switched from COD
            razorpayPaymentId,
            razorpaySignature,
        },
        include: { items: true }
    });
    // Only update stock and clear cart if it wasn't a COD order (COD already decrements at creation)
    if (existingOrder?.paymentMethod !== 'COD') {
        // Update stock
        for (const item of order.items) {
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.qty } }
            });
        }
        // Clear cart (if logic exists in DB)
        await prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
    }
    return res.status(200).json(new ApiResponse(200, { orderId: order.id }, 'Payment verified successfully'));
});
export const createCODOrder = asyncHandler(async (req, res) => {
    const { cartItems, addressId } = req.body;
    const userId = req.user.id;
    let subtotal = 0;
    const itemsToCreate = [];
    for (const item of cartItems) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product)
            throw new ApiError(404, `Product not found: ${item.productId}`);
        subtotal += product.price * item.qty;
        itemsToCreate.push({
            productId: product.id,
            qty: item.qty,
            price: product.price,
            size: item.size,
        });
    }
    const shipping = subtotal > 999 ? 0 : 50;
    const total = subtotal + shipping;
    const order = await prisma.order.create({
        data: {
            userId,
            addressId,
            subtotal,
            total,
            paymentMethod: 'COD',
            paymentStatus: 'PENDING',
            status: 'CONFIRMED',
            items: {
                create: itemsToCreate,
            },
        },
    });
    // Update stock
    for (const item of itemsToCreate) {
        await prisma.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.qty } }
        });
    }
    await prisma.cartItem.deleteMany({ where: { userId } });
    return res.status(201).json(new ApiResponse(201, { orderId: order.id }, 'COD Order placed successfully'));
});
export const payExistingOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.body;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== req.user.id) {
        throw new ApiError(404, 'Order not found or unauthorized');
    }
    if (order.paymentStatus === 'PAID') {
        throw new ApiError(400, 'Order is already paid');
    }
    const razorpayOrder = await paymentService.createRazorpayOrder(order.total, `order_${order.id.slice(0, 8)}`);
    // Update order with new razorpayOrderId
    await prisma.order.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id }
    });
    return res.status(200).json(new ApiResponse(200, {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        keyId: env.RAZORPAY_KEY_ID,
        orderId: order.id
    }, 'Razorpay order created for existing order'));
});
export const webhook = asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(req.body))
        .digest('hex');
    if (signature !== expectedSignature) {
        throw new ApiError(400, 'Invalid webhook signature');
    }
    const { event, payload } = req.body;
    if (event === 'payment.captured') {
        const payment = payload.payment.entity;
        await prisma.order.updateMany({
            where: { razorpayOrderId: payment.order_id },
            data: { paymentStatus: 'PAID', status: 'CONFIRMED' }
        });
    }
    return res.status(200).json({ status: 'ok' });
});
