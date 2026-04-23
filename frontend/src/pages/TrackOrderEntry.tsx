import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Package, ExternalLink } from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@config/axiosInstance';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import { motion } from 'framer-motion';

const TrackOrderEntry: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');

  const { data: myOrders, isLoading } = useQuery({
    queryKey: ['my-orders-active'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/orders/my-orders');
      return data.data;
    },
    enabled: isAuthenticated,
  });

  const handleGuestTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId && email) {
      navigate(`/orders/${orderId}/tracking?email=${encodeURIComponent(email)}`);
    }
  };

  const activeOrders = myOrders?.filter((o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') || [];

  return (
    <div className="min-h-screen bg-brand-background pt-32 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Track Order | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-black font-display italic uppercase tracking-tighter">
            Track Your <span className="text-brand-accent">Gear</span>
          </h1>
          <p className="text-sm text-brand-text-secondary uppercase tracking-widest max-w-xl mx-auto">
            Stay updated on your elite performance equipment.
          </p>
        </div>

        {isAuthenticated ? (
          <div className="space-y-6">
            <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-6">Active Orders</h3>
            {isLoading ? (
              <div className="text-center py-12 text-brand-text-muted font-bold uppercase tracking-widest text-sm animate-pulse">Loading orders...</div>
            ) : activeOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {activeOrders.map((order: any) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={order.id} 
                    className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-accent transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order.id}/tracking`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-surface-alt rounded-brand-md flex items-center justify-center text-brand-accent">
                        <Package size={24} />
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-brand-text-muted">Order #{order.id.slice(-8).toUpperCase()}</p>
                        <h4 className="font-bold text-sm uppercase">{new Date(order.createdAt).toLocaleDateString()}</h4>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="text-center md:text-right">
                        <p className="text-[10px] font-mono uppercase text-brand-text-muted">Total</p>
                        <p className="font-black font-mono">₹{order.total.toFixed(2)}</p>
                      </div>
                      <Badge variant="primary">{order.status}</Badge>
                      <Button size="sm" className="gap-2">Track <ExternalLink size={14}/></Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="premium-card py-20 text-center space-y-4">
                <Package size={48} className="mx-auto text-brand-text-muted opacity-20" />
                <p className="text-brand-text-secondary font-bold uppercase tracking-widest text-sm">No active orders right now.</p>
                <Button variant="outline" onClick={() => navigate('/profile?tab=orders')}>View Order History</Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleGuestTrack} className="premium-card p-10 max-w-xl mx-auto space-y-6">
            <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-2 text-center">Find Your Order</h3>
            <p className="text-xs text-brand-text-secondary text-center mb-8 uppercase tracking-widest">Enter your order ID and email to track your shipment.</p>
            
            <div className="space-y-4">
              <Input 
                label="Order ID" 
                placeholder="e.g. cm0abc123..." 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
              />
              <Input 
                label="Email Address" 
                type="email"
                placeholder="The email used at checkout" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" fullWidth className="mt-8 gap-2">
              <Search size={18} /> Locate Package
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default TrackOrderEntry;
