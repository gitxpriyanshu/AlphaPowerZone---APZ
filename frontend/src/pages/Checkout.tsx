import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, CreditCard, CheckCircle2, ChevronRight, 
  Plus, ShieldCheck, ArrowRight, Truck, Info, Phone, User
} from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useAuthStore } from '@store/authStore';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axiosInstance from '@config/axiosInstance';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import toast from 'react-hot-toast';

import { useRazorpay } from '@hooks/useRazorpay';
import { paymentService } from '@services/paymentService';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const { openRazorpay, isLoading: isRzpLoading } = useRazorpay();
  
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [orderConfirmedData, setOrderConfirmedData] = useState<any>(null);
  const [isCodLoading, setIsCodLoading] = useState(false);
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', line1: '', line2: '', pincode: '', city: '', state: '', isDefault: false });

  const subtotal = getTotal();
  const shipping = subtotal > 999 ? 0 : 50;
  const total = subtotal + shipping;
  const totalDiscount = items.reduce((acc, item) => {
    if (item.product.comparePrice && item.product.comparePrice > item.product.price) {
      return acc + (item.product.comparePrice - item.product.price) * item.quantity;
    }
    return acc;
  }, 0);

  // Fetch Addresses
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/addresses');
      return data.data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);

  const addAddressMutation = useMutation({
    mutationFn: async (addr: any) => {
      const { data } = await axiosInstance.post('/addresses', addr);
      return data.data;
    },
    onSuccess: (newAddr) => {
      refetchAddresses();
      setSelectedAddressId(newAddr.id);
      setIsAddingAddress(false);
      setNewAddress({ name: '', phone: '', line1: '', line2: '', pincode: '', city: '', state: '', isDefault: false });
      toast.success('Address saved successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  });

  const handleSaveAddress = () => {
    if (!newAddress.name || !newAddress.phone || !newAddress.line1 || !newAddress.pincode || !newAddress.city || !newAddress.state) {
      toast.error('Please fill all required fields');
      return;
    }
    addAddressMutation.mutate(newAddress);
  };

  // Mutations
  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      if (paymentMethod === 'cod') {
        return await paymentService.createCODOrder(orderData);
      } else {
        // For Razorpay, openRazorpay handles it, but we might want a mutation for state
        return null;
      }
    },
    onSuccess: (data) => {
      if (paymentMethod === 'cod' && data) {
        setOrderConfirmedData({ 
          id: data.orderId, 
          total, 
          items: items.map(i => ({ ...i, qty: i.quantity, price: i.product.price })) 
        });
        setStep(3);
        clearCart();
        toast.success('Order placed successfully!');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to place order');
    }
  });

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    const orderData = {
      cartItems: items.map(i => ({
        productId: i.product.id,
        qty: i.quantity,
        size: i.selectedSize
      })),
      addressId: selectedAddressId
    };

    if (paymentMethod === 'razorpay') {
      await openRazorpay(orderData);
    } else {
      orderMutation.mutate(orderData);
    }
  };

  const handlePincodeAutofill = async (pincode: string) => {
    setNewAddress(prev => ({ ...prev, pincode }));
    if (pincode.length === 6) {
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setNewAddress(prev => ({
            ...prev,
            city: postOffice.District,
            state: postOffice.State
          }));
          toast.success(`Found ${postOffice.District}, ${postOffice.State}`);
        } else {
          toast.error('Invalid PIN code');
        }
      } catch (error) {
        console.error('Pincode lookup failed');
        toast.error('Failed to lookup PIN code');
      }
    }
  };

  if (items.length === 0 && step !== 3) {
    navigate('/shop');
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Checkout | AlphaPowerZone</title>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </Helmet>

      <div className="max-w-6xl mx-auto">
        {/* Progress Stepper */}
        <div className="flex items-center justify-center mb-16 gap-4">
          {[
            { id: 1, label: 'Address', icon: <MapPin size={18} /> },
            { id: 2, label: 'Payment', icon: <CreditCard size={18} /> },
            { id: 3, label: 'Confirm', icon: <CheckCircle2 size={18} /> },
          ].map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                  step >= s.id ? "bg-brand-accent text-white shadow-brand-md" : "bg-brand-surface-alt text-brand-text-muted"
                )}>
                  {s.icon}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  step >= s.id ? "text-brand-text-primary" : "text-brand-text-muted"
                )}>{s.label}</span>
              </div>
              {i < 2 && (
                <div className={cn(
                  "h-[2px] w-12 sm:w-24 mb-6 rounded-full transition-all duration-1000",
                  step > s.id ? "bg-brand-accent" : "bg-brand-border"
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <div className="flex items-end justify-between">
                    <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">Delivery Address</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsAddingAddress(!isAddingAddress)}
                      className="text-brand-accent"
                    >
                      <Plus className="mr-2" size={16} />
                      {isAddingAddress ? 'Show Saved' : 'Add New'}
                    </Button>
                  </div>

                  {!isAddingAddress ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {addresses?.map((addr: any) => (
                        <div 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={cn(
                            "premium-card p-6 cursor-pointer border-2 transition-all relative",
                            selectedAddressId === addr.id ? "border-brand-accent bg-brand-accent/5" : "border-brand-border"
                          )}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="absolute top-4 right-4 text-brand-accent">
                              <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                            </div>
                          )}
                          <p className="font-bold font-display uppercase tracking-tight mb-2">{addr.name}</p>
                          <p className="text-sm text-brand-text-secondary leading-relaxed mb-4">
                            {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="text-xs font-mono font-bold flex items-center gap-2">
                            <Phone size={12} className="text-brand-accent" /> {addr.phone}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="premium-card p-8 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Input label="Full Name" value={newAddress.name} onChange={(e) => setNewAddress({...newAddress, name: e.target.value})} leftIcon={<User size={18} />} placeholder="Enter name" required />
                        <Input label="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})} leftIcon={<Phone size={18} />} placeholder="10-digit number" required />
                      </div>
                      <Input label="Address Line 1" value={newAddress.line1} onChange={(e) => setNewAddress({...newAddress, line1: e.target.value})} leftIcon={<MapPin size={18} />} placeholder="House No, Street" required />
                      <Input label="Address Line 2 (Optional)" value={newAddress.line2} onChange={(e) => setNewAddress({...newAddress, line2: e.target.value})} leftIcon={<MapPin size={18} />} placeholder="Landmark, Area" />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Input 
                          label="PIN Code" 
                          placeholder="6-digit PIN" 
                          value={newAddress.pincode}
                          onChange={(e) => handlePincodeAutofill(e.target.value)}
                          maxLength={6}
                          required
                        />
                        <Input label="City" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} placeholder="Auto-filled" required />
                        <Input label="State" value={newAddress.state} onChange={(e) => setNewAddress({...newAddress, state: e.target.value})} placeholder="Auto-filled" required />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="default-addr" checked={newAddress.isDefault} onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} className="accent-brand-accent" />
                        <label htmlFor="default-addr" className="text-xs font-bold uppercase tracking-widest cursor-pointer">Set as default address</label>
                      </div>
                      <Button fullWidth onClick={handleSaveAddress} isLoading={addAddressMutation.isPending}>Save Address & Use</Button>
                    </div>
                  )}

                  <div className="pt-8 border-t border-brand-border flex justify-end">
                    <Button size="lg" onClick={() => setStep(2)} disabled={!selectedAddressId} className="px-12 group">
                      Continue To Payment
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-8"
                >
                  <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">Payment Method</h2>

                  <div className="space-y-4">
                    {[
                      { id: 'razorpay', label: 'Online Payment', sub: 'Pay securely via Cards, UPI, or NetBanking', icon: <CreditCard /> },
                      { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when your elite gear arrives', icon: <Truck /> },
                    ].map((method) => (
                      <div 
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={cn(
                          "premium-card p-6 cursor-pointer border-2 transition-all flex items-center gap-6",
                          paymentMethod === method.id ? "border-brand-accent bg-brand-accent/5" : "border-brand-border"
                        )}
                      >
                        <div className={cn(
                          "w-12 h-12 rounded-brand-md flex items-center justify-center transition-colors",
                          paymentMethod === method.id ? "bg-brand-accent text-white" : "bg-brand-surface-alt text-brand-text-muted"
                        )}>
                          {React.cloneElement(method.icon as any, { size: 24 })}
                        </div>
                        <div className="flex-grow">
                          <p className="font-bold font-display uppercase tracking-tight">{method.label}</p>
                          <p className="text-xs text-brand-text-secondary">{method.sub}</p>
                        </div>
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                          paymentMethod === method.id ? "border-brand-accent" : "border-brand-border"
                        )}>
                          {paymentMethod === method.id && <div className="w-3 h-3 bg-brand-accent rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-brand-accent-light p-6 rounded-brand-xl flex gap-4">
                    <Info className="text-brand-accent flex-shrink-0" size={20} />
                    <p className="text-xs text-brand-text-secondary leading-relaxed">
                      By placing this order, you agree to AlphaPowerZone's <span className="text-brand-accent font-bold cursor-pointer">Terms of Service</span> and <span className="text-brand-accent font-bold cursor-pointer">Privacy Policy</span>. Your payment is secured via SSL encryption.
                    </p>
                  </div>

                  <div className="pt-8 border-t border-brand-border flex justify-between items-center">
                    <button onClick={() => setStep(1)} className="text-xs font-black uppercase tracking-widest text-brand-text-muted hover:text-brand-text-primary">
                      Go Back
                    </button>
                    <Button 
                      size="lg" 
                      onClick={handlePlaceOrder} 
                      isLoading={orderMutation.isPending}
                      className="px-12 group"
                    >
                      Place Order
                      <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {step === 3 && orderConfirmedData && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-8"
                >
                  <div className="w-24 h-24 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center mx-auto">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 100 }}
                    >
                      <CheckCircle2 size={60} />
                    </motion.div>
                  </div>
                  
                  <div>
                    <h2 className="text-4xl font-black font-display italic uppercase tracking-tighter mb-4">Elite Order Confirmed</h2>
                    <p className="text-brand-text-secondary max-w-md mx-auto">
                      Thank you for your purchase, {user?.name}. Your order <span className="text-brand-accent font-bold font-mono">#{orderConfirmedData.id.slice(-8).toUpperCase()}</span> has been placed successfully.
                    </p>
                  </div>

                  <div className="premium-card p-8 max-w-lg mx-auto bg-brand-surface-alt">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-brand-border">
                      <div className="text-left">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Status</p>
                        <p className="font-bold text-brand-success uppercase italic">Confirmed</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted">Est. Delivery</p>
                        <p className="font-bold italic uppercase">Oct 24 - Oct 28</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {orderConfirmedData.items?.map((item: any, index: number) => (
                        <div key={item.product?.id || index} className="flex justify-between text-sm">
                          <span className="text-brand-text-secondary">{item.product.name} x {item.qty}</span>
                          <span className="font-mono font-bold">₹{(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Button variant="secondary" onClick={() => navigate(`/orders/${orderConfirmedData.id}/tracking`)}>
                      Track Order
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/shop')}>
                      Continue Shopping
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          {step !== 3 && (
            <div className="lg:col-span-4">
              <div className="premium-card p-6 sticky top-32">
                <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto no-scrollbar">
                  {items.map((item) => (
                    <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4">
                      <img src={item.product.images[0]} className="w-12 h-12 rounded-brand-md object-cover" />
                      <div className="flex-grow">
                        <p className="text-xs font-bold uppercase tracking-tight line-clamp-1">{item.product.name}</p>
                        <p className="text-[10px] font-mono text-brand-text-muted">Qty: {item.quantity} | {item.selectedSize}</p>
                      </div>
                      <span className="text-xs font-bold font-mono">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-brand-border">
                  <div className="flex justify-between text-sm text-brand-text-secondary">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-500 font-bold">
                      <span>Discount Saved</span>
                      <span className="font-mono">-₹{totalDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-brand-text-secondary">
                    <span>Shipping</span>
                    <span className={cn("font-mono font-bold", shipping === 0 ? "text-emerald-500" : "")}>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-xl font-black font-display italic uppercase tracking-tighter pt-4 border-t border-brand-border">
                    <span>Total</span>
                    <span className="font-mono not-italic">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-brand-border">
                  <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-text-muted">
                    <ShieldCheck className="text-brand-accent" size={16} />
                    Secure Checkout
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
