import crypto from 'crypto';
import razorpay from '../config/razorpay.js';
import { env } from '../config/env.js';

export const paymentService = {
  /**
   * Create Razorpay order
   */
  createRazorpayOrder: async (amount: number, receipt: string, currency = 'INR') => {
    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency,
      receipt,
    };

    return await razorpay.orders.create(options);
  },

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature: (orderId: string, paymentId: string, signature: string): boolean => {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );
  },
};
