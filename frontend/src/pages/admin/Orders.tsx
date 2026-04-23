import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Eye, Download, 
  ChevronLeft, ChevronRight, X, Phone, Mail, MapPin, 
  CreditCard, Package, Clock, CheckCircle2 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminAxios from '@config/adminAxios';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import toast from 'react-hot-toast';

const Orders: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', search],
    queryFn: async () => {
      const { data } = await adminAxios.get(`/orders?search=${search}`);
      return data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await adminAxios.patch(`/orders/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
      setSelectedOrder(null);
    },
  });

  const orders = ordersData || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-display italic uppercase tracking-tighter">Orders</h1>
          <p className="text-sm text-brand-text-muted mt-1">Fulfill orders and manage customer relations</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="px-6">Export CSV</Button>
          <Button className="px-6">Print Packing Slips</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-brand-xl border border-brand-border shadow-brand-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by Order ID, customer email..."
            className="w-full pl-12 pr-4 py-3 bg-brand-surface-alt rounded-brand-md border-2 border-transparent focus:border-brand-accent transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select className="bg-brand-surface-alt rounded-brand-md border-2 border-transparent px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all">
            <option>All Statuses</option>
            <option>Pending</option>
            <option>Confirmed</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-brand-xl border border-brand-border shadow-brand-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-surface-alt border-b border-brand-border">
              <tr className="text-left">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Order ID</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Payment</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-8 py-6 h-16 animate-pulse" /></tr>
                ))
              ) : orders.map((order: any) => (
                <tr 
                  key={order.id} 
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-brand-surface-alt/30 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-6 text-xs font-bold font-mono">#{order.id.slice(-6).toUpperCase()}</td>
                  <td className="px-8 py-6 text-xs font-bold">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6">
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">{order.user.name}</p>
                      <p className="text-[10px] text-brand-text-muted">{order.user.email}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={order.paymentStatus === 'PAID' ? 'success' : 'outline'} className="text-[8px]">
                      {order.paymentStatus}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={order.status === 'DELIVERED' ? 'success' : 'primary'} className="text-[8px]">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right text-sm font-black font-mono">₹{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Side Panel */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-y-0 right-0 w-full max-w-2xl bg-[#F9FAFB] z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-8 bg-white border-b border-brand-border flex items-center justify-between sticky top-0 z-10">
                <div>
                  <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter">Order #{selectedOrder.id.slice(-6).toUpperCase()}</h2>
                  <p className="text-xs text-brand-text-muted font-bold mt-1 uppercase tracking-widest">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-brand-surface-alt rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                {/* Status Management */}
                <div className="premium-card p-8 bg-white space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2">
                    <Clock size={16} /> Manage Fulfillment
                  </h3>
                  <div className="flex gap-4">
                    <select 
                      className="flex-grow bg-brand-surface-alt border-2 border-brand-border rounded-brand-md px-4 py-3 text-xs font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all"
                      defaultValue={selectedOrder.status}
                      onChange={(e) => updateStatusMutation.mutate({ id: selectedOrder.id, status: e.target.value })}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <Button variant="outline"><Download size={18} /></Button>
                  </div>
                </div>

                {/* Items */}
                <div className="premium-card p-8 bg-white space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2">
                    <Package size={16} /> Order Items
                  </h3>
                  <div className="divide-y divide-brand-border">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="py-4 flex items-center gap-4">
                        <img src={item.product.images[0]} className="w-12 h-12 rounded-brand-md object-cover" />
                        <div className="flex-grow">
                          <p className="text-xs font-black uppercase tracking-tight">{item.product.name}</p>
                          <p className="text-[10px] font-mono text-brand-text-muted">₹{item.price} × {item.qty}</p>
                        </div>
                        <p className="text-xs font-black font-mono">₹{item.price * item.qty}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-6 border-t border-brand-border space-y-2">
                    <div className="flex justify-between text-xs text-brand-text-secondary">
                      <span>Subtotal</span>
                      <span className="font-mono font-bold">₹{selectedOrder.total}</span>
                    </div>
                    <div className="flex justify-between text-sm font-black font-display uppercase italic tracking-tighter pt-2 border-t border-brand-border">
                      <span>Total Paid</span>
                      <span className="font-mono not-italic">₹{selectedOrder.total}</span>
                    </div>
                  </div>
                </div>

                {/* Customer */}
                <div className="grid grid-cols-2 gap-8">
                  <div className="premium-card p-8 bg-white space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Customer</h3>
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase">{selectedOrder.user.name}</p>
                      <div className="flex items-center gap-2 text-[10px] text-brand-text-secondary">
                        <Mail size={12} /> {selectedOrder.user.email}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-brand-text-secondary">
                        <Phone size={12} /> {selectedOrder.address.phone}
                      </div>
                    </div>
                  </div>
                  <div className="premium-card p-8 bg-white space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Shipping</h3>
                    <div className="space-y-3">
                      <p className="text-xs font-bold uppercase">{selectedOrder.address.name}</p>
                      <p className="text-[10px] text-brand-text-secondary leading-relaxed">
                        {selectedOrder.address.line1}, {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
