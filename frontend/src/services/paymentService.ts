import axiosInstance from '../config/axiosInstance';

export const paymentService = {
  /**
   * Create Razorpay order on backend
   */
  createOrder: async (data: { cartItems: any[]; addressId: string }) => {
    const response = await axiosInstance.post('/payments/create-order', data);
    return response.data.data;
  },

  /**
   * Verify Razorpay payment
   */
  verifyPayment: async (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    orderId: string;
  }) => {
    const response = await axiosInstance.post('/payments/verify', data);
    return response.data.data;
  },

  /**
   * Create COD order
   */
  createCODOrder: async (data: { cartItems: any[]; addressId: string }) => {
    const response = await axiosInstance.post('/payments/cod-order', data);
    return response.data.data;
  },

  /**
   * Pay existing order (Convert COD to Online)
   */
  payExistingOrder: async (orderId: string) => {
    const response = await axiosInstance.post('/payments/pay-existing', { orderId });
    return response.data.data;
  },
};
