import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  User, ShoppingBag, MapPin, Activity, 
  ShieldCheck, LogOut, ChevronRight, Edit3, 
  Plus, Trash2, CheckCircle2, Package, Calendar
} from 'lucide-react';
import { useAuthStore } from '@store/authStore';
import { useUIStore } from '@store/uiStore';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@config/axiosInstance';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import { useSearchParams } from 'react-router-dom';
const Profile: React.FC = () => {
  const { user, setUser, logout } = useAuthStore();
  const { addToast } = useUIStore();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Update formData when user data arrives
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.patch('/auth/update-profile', formData);
      
      // Determine what was updated for the message
      const updatedFields = [];
      if (formData.name !== user?.name) updatedFields.push('name');
      if (formData.email !== user?.email) updatedFields.push('email');
      if (formData.phone !== (user?.phone || '')) updatedFields.push('phone number');
      
      const message = updatedFields.length > 0 
        ? `Successfully updated your ${updatedFields.join(', ')}!`
        : 'Profile updated successfully!';

      setUser(data.data);
      setIsEditing(false);
      setShowConfirm(false);
      addToast(message, 'success');
    } catch (error: any) {
      console.error('Update profile error:', error);
      addToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Orders
  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/orders/my-orders');
      return data.data;
    },
  });

  // Fetch Addresses
  const { data: addresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/addresses');
      return data.data;
    },
  });

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: <User size={18} /> },
    { id: 'orders', label: 'Order History', icon: <ShoppingBag size={18} /> },
    { id: 'addresses', label: 'Addresses', icon: <MapPin size={18} /> },
    { id: 'fitness', label: 'Fitness Profile', icon: <Activity size={18} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Dashboard | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-8">
          <div className="premium-card p-8 flex flex-col items-center text-center">
            <div className="relative group mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-brand-border group-hover:border-brand-accent transition-colors">
                <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=E63946&color=fff&bold=true`} alt={user?.name} className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-brand-accent text-white rounded-full flex items-center justify-center shadow-brand-md border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={16} />
              </button>
            </div>
            <h2 className="text-xl font-black font-display italic uppercase tracking-tighter">{user?.name}</h2>
            <p className="text-xs text-brand-text-muted font-mono uppercase mt-1">{user?.email}</p>
            <p className="text-[10px] text-brand-text-muted uppercase tracking-widest mt-4">Member Since: {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
          </div>

          <nav className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-brand-md transition-all text-sm font-black uppercase tracking-widest",
                  activeTab === tab.id 
                    ? "bg-brand-text-primary text-white shadow-brand-md" 
                    : "text-brand-text-secondary hover:bg-brand-surface-alt"
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
            <button 
              onClick={logout}
              className="flex items-center gap-4 px-6 py-4 rounded-brand-md text-brand-error hover:bg-brand-error/5 transition-all text-sm font-black uppercase tracking-widest mt-4"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-9">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black font-display italic uppercase tracking-tighter">My Profile</h3>
                  {!isEditing && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={16} className="mr-2" /> Edit Profile
                    </Button>
                  )}
                </div>

                <div className="premium-card p-10 relative overflow-hidden">
                  <AnimatePresence mode="wait">
                    {!isEditing ? (
                      <motion.div 
                        key="view"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-12"
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">Full Name</p>
                          <p className="text-xl font-bold text-brand-text-primary">{user?.name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">Email Address</p>
                          <p className="text-xl font-bold text-brand-text-primary">{user?.email}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted">Phone Number</p>
                          <p className="text-xl font-bold text-brand-text-primary">{user?.phone || 'Not provided'}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="edit"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <Input 
                            label="Full Name" 
                            value={formData.name} 
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your name" 
                          />
                          <Input 
                            label="Email Address" 
                            value={formData.email} 
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com" 
                          />
                          <Input 
                            label="Phone Number" 
                            value={formData.phone} 
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="10-digit number" 
                          />
                        </div>
                        <div className="pt-6 border-t border-brand-border flex justify-end gap-4">
                          <Button 
                            variant="ghost" 
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                name: user?.name || '',
                                email: user?.email || '',
                                phone: user?.phone || '',
                              });
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="px-12" 
                            onClick={() => setShowConfirm(true)}
                          >
                            Update Profile
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirmation Modal Overlay */}
                  <AnimatePresence>
                    {showConfirm && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-brand-background/90 backdrop-blur-sm z-20 flex items-center justify-center p-8"
                      >
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="max-w-md text-center space-y-6"
                        >
                          <div className="w-16 h-16 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck size={32} />
                          </div>
                          <h4 className="text-2xl font-black font-display italic uppercase">Confirm Changes?</h4>
                          <p className="text-sm text-brand-text-secondary">Are you sure you want to update your profile details? This action will synchronize across all your devices.</p>
                          <div className="flex gap-4">
                            <Button variant="outline" fullWidth onClick={() => setShowConfirm(false)}>Go Back</Button>
                            <Button fullWidth onClick={handleUpdateProfile} isLoading={isLoading}>Confirm & Save</Button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {activeTab === 'orders' && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <h3 className="text-4xl font-black font-display italic uppercase tracking-tighter">Order History</h3>
                <div className="space-y-4">
                  {orders?.length > 0 ? (
                    orders.map((order: any) => (
                      <div key={order.id} className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-accent transition-colors">
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
                          <Badge variant={order.status === 'DELIVERED' ? 'success' : 'primary'}>
                            {order.status}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/orders/${order.id}/tracking`}
                          >
                            Track Order
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4">
                      <ShoppingBag size={48} className="mx-auto text-brand-text-muted opacity-20" />
                      <p className="text-brand-text-secondary font-bold">No orders found yet. Time to gear up!</p>
                      <Button variant="outline" size="sm">Go Shopping</Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'addresses' && (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="flex items-end justify-between">
                  <h3 className="text-4xl font-black font-display italic uppercase tracking-tighter">My Addresses</h3>
                  <Button variant="outline" size="sm"><Plus size={16} className="mr-2" /> Add New</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses?.map((addr: any) => (
                    <div key={addr.id} className={cn(
                      "premium-card p-8 border-2 transition-all group relative",
                      addr.isDefault ? "border-brand-accent bg-brand-accent/5" : "border-brand-border"
                    )}>
                      {addr.isDefault && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-brand-accent">
                          <CheckCircle2 size={12} /> Default
                        </div>
                      )}
                      <h4 className="text-lg font-black font-display italic uppercase tracking-tighter mb-2">{addr.name}</h4>
                      <p className="text-xs text-brand-text-secondary leading-relaxed mb-6">
                        {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <div className="flex gap-4">
                        <button className="text-[10px] font-black uppercase tracking-widest text-brand-text-primary hover:text-brand-accent flex items-center gap-2">
                          <Edit3 size={12} /> Edit
                        </button>
                        <button className="text-[10px] font-black uppercase tracking-widest text-brand-error hover:opacity-70 flex items-center gap-2">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profile;
