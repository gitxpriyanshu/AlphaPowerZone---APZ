import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { paymentService } from '../services/paymentService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface PaymentOptions {
  cartItems: { productId: string; qty: number; variant?: string }[];
  addressId: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const useRazorpay = () => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const openRazorpay = async (options: PaymentOptions) => {
    if (!isScriptLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Create order on backend
      const orderData = await paymentService.createOrder(options);

      // 2. Configure Razorpay options
      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'AlphaPowerZone',
        description: 'Elite Performance Gear',
        order_id: orderData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            // 3. Verify payment on backend
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
            });

            toast.success('Payment Successful!');
            navigate(`/orders/confirmation`, { state: { orderId: orderData.orderId } });
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: '', 
        },
        theme: {
          color: '#C8A96E', 
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  const payExistingRazorpay = async (orderId: string, onSuccessCallback?: () => void) => {
    if (!isScriptLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = await paymentService.payExistingOrder(orderId);

      const rzpOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'AlphaPowerZone',
        description: 'Instant Order Payment',
        order_id: orderData.razorpayOrderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await paymentService.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: orderData.orderId,
            });

            toast.success('Payment Successful!');
            if (onSuccessCallback) {
              onSuccessCallback();
            } else {
              window.location.reload();
            }
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#C8A96E', 
        },
        modal: {
          ondismiss: () => setIsLoading(false),
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  return { openRazorpay, payExistingRazorpay, isLoading, isScriptLoaded };
};
