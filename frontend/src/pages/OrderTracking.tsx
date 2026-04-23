import React from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Package, Truck, CheckCircle2, Box, 
  MapPin, Clock, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@config/axiosInstance';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Skeleton from '@components/ui/Skeleton';
import { useRazorpay } from '@hooks/useRazorpay';
import { useAuthStore } from '@store/authStore';

const OrderTracking: React.FC = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const { isAuthenticated } = useAuthStore();
  const { payExistingRazorpay, isLoading: isPaymentLoading } = useRazorpay();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id, email],
    queryFn: async () => {
      if (email) {
        const { data } = await axiosInstance.post(`/orders/track-guest`, { orderId: id, email });
        return data.data;
      }
      const { data } = await axiosInstance.get(`/orders/${id}/tracking`);
      return data.data;
    },
  });

  if (isLoading) return <div className="pt-32 px-24"><Skeleton variant="rectangular" className="h-[500px]" /></div>;
  if (!order) return <div className="pt-32 text-center">Order not found</div>;

  const statuses = [
    { key: 'PENDING', label: 'Order Placed', icon: <Package size={20} />, note: 'We have received your elite order.' },
    { key: 'CONFIRMED', label: 'Confirmed', icon: <CheckCircle2 size={20} />, note: 'Order has been verified and confirmed.' },
    { key: 'PROCESSING', label: 'Processing', icon: <RefreshCw size={20} />, note: 'Our team is picking and packing your gear.' },
    { key: 'SHIPPED', label: 'Shipped', icon: <Truck size={20} />, note: 'Your package is on its way to you.' },
    { key: 'DELIVERED', label: 'Delivered', icon: <Box size={20} />, note: 'Gear has been delivered. Time to perform!' },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.key === order.status);

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Track Order #{id?.slice(-8).toUpperCase() || '...'} | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-5xl mx-auto">
        <Link to="/profile" className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-text-muted hover:text-brand-accent transition-colors mb-8">
          <ArrowLeft size={16} /> Back to My Account
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter mb-2">
              Track <span className="text-brand-accent">Order</span>
            </h1>
            <p className="text-brand-text-secondary font-mono text-sm uppercase">Order ID: #{id?.toUpperCase()}</p>
          </div>
          <div className="bg-brand-surface border border-brand-border px-6 py-3 rounded-brand-md flex items-center gap-4 shadow-brand-sm">
            <Clock className="text-brand-accent" size={20} />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Est. Delivery</p>
              <p className="font-bold uppercase italic">Oct 26, 2026</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Tracking Timeline */}
          <div className="lg:col-span-8 premium-card p-10">
            <div className="space-y-12">
              {statuses.map((s, i) => {
                const isCompleted = i <= currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                const isLast = i === statuses.length - 1;

                return (
                  <div key={s.key} className="flex gap-6 relative">
                    {/* Line Connector */}
                    {!isLast && (
                      <div className={cn(
                        "absolute left-[19px] top-10 w-[2px] h-12 transition-colors duration-1000",
                        i < currentStatusIndex ? "bg-brand-accent" : "bg-brand-border"
                      )} />
                    )}

                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500",
                      isCompleted ? "bg-brand-accent text-white shadow-brand-md" : "bg-brand-surface-alt text-brand-text-muted"
                    )}>
                      {isCompleted ? <CheckCircle2 size={18} /> : s.icon}
                    </div>

                    <div className={cn("transition-opacity", isCompleted ? "opacity-100" : "opacity-40")}>
                      <h4 className={cn(
                        "text-lg font-black font-display italic uppercase tracking-tighter mb-1",
                        isCurrent ? "text-brand-accent" : "text-brand-text-primary"
                      )}>
                        {s.label}
                        {isCurrent && <span className="ml-3 text-[10px] not-italic font-mono bg-brand-accent/20 px-2 py-0.5 rounded-full">Active</span>}
                      </h4>
                      <p className="text-sm text-brand-text-secondary">{s.note}</p>
                      {isCompleted && (
                        <p className="text-[10px] font-mono text-brand-text-muted mt-2 uppercase tracking-widest">
                          {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : 'Processing...'}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Info Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="premium-card p-8">
              <h3 className="font-black font-display italic uppercase tracking-tighter mb-6 pb-6 border-b border-brand-border">Order Details</h3>
              <div className="space-y-6">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <img src={item.product.images[0]} className="w-16 h-16 rounded-brand-md object-cover flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold uppercase tracking-tight">{item.product.name}</p>
                      <p className="text-[10px] font-mono text-brand-text-muted uppercase tracking-widest">Qty: {item.qty}</p>
                      <p className="text-sm font-bold font-mono mt-1">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-8 border-t border-brand-border space-y-3">
                <div className="flex justify-between items-center text-lg mt-6 pt-6 border-t border-brand-border">
                  <span className="font-black italic uppercase">Total</span>
                  <span className="font-mono font-bold">₹{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-brand-text-muted uppercase tracking-widest text-[10px] font-bold">Method</span>
                  <div className="flex items-center gap-3">
                    <span className="uppercase font-bold text-[10px]">{order.paymentMethod}</span>
                    {isAuthenticated && order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID' && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <Button 
                        size="sm" 
                        variant="primary" 
                        className="h-6 text-[10px] px-3"
                        isLoading={isPaymentLoading}
                        onClick={() => payExistingRazorpay(order.id, () => window.location.reload())}
                      >
                        Pay Now
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card p-8">
              <h3 className="font-black font-display italic uppercase tracking-tighter mb-4 flex items-center gap-3">
                <MapPin className="text-brand-accent" size={20} />
                Shipping To
              </h3>
              <p className="font-bold text-sm mb-2">{order.address.name}</p>
              <p className="text-xs text-brand-text-secondary leading-relaxed uppercase tracking-wide">
                {order.address.line1}, {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
