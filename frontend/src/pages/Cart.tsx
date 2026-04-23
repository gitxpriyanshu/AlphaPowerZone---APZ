import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck, ChevronRight } from 'lucide-react';
import { useCartStore } from '@store/cartStore';
import { useUIStore } from '@store/uiStore';
import { useAuthStore } from '@store/authStore';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQty, clearCart, getTotal, getItemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { openModal } = useUIStore();

  const handleCheckout = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }
    if (!isAuthenticated) {
      openModal('login');
      return;
    }
    navigate('/checkout');
  };

  const subtotal = getTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Your Cart | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 text-brand-text-muted hover:text-brand-accent transition-colors text-xs font-black uppercase tracking-widest mb-4 group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              Continue Shopping
            </button>
            <h1 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">
              Your <span className="text-brand-accent">Cart</span>
            </h1>
            <p className="text-brand-text-muted text-sm mt-1">
              {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={() => { clearCart(); toast.success('Cart cleared'); }}
              className="text-xs font-black uppercase tracking-widest text-red-400 hover:text-red-500 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            /* Empty State */
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-28 h-28 bg-brand-surface-alt rounded-full flex items-center justify-center mx-auto mb-8">
                <ShoppingBag size={48} className="text-brand-text-muted" />
              </div>
              <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter mb-3">
                Mission Gear Empty
              </h2>
              <p className="text-brand-text-secondary mb-10 max-w-md mx-auto">
                Your tactical loadout is waiting. Explore the elite collection and add high-performance gear to your cart.
              </p>
              <Link to="/shop">
                <Button size="lg" className="px-12">
                  Browse Elite Gear
                  <ChevronRight size={18} className="ml-2" />
                </Button>
              </Link>
            </motion.div>
          ) : (
            /* Cart Content */
            <motion.div
              key="cart"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col lg:flex-row gap-10"
            >
              {/* Items List */}
              <div className="lg:w-2/3 space-y-4">
                <AnimatePresence>
                  {items.map((item, index) => (
                    <motion.div
                      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="premium-card flex items-center gap-6 p-6 group"
                    >
                      {/* Product Image */}
                      <div className="w-28 h-28 flex-shrink-0 rounded-brand-lg overflow-hidden bg-brand-surface-alt">
                        <img
                          src={item.product.images?.[0] || '/images/placeholder.jpg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-mono uppercase tracking-widest text-brand-text-muted mb-1">
                          {item.product.category?.name || 'Gear'}
                          {item.selectedSize && ` • Size: ${item.selectedSize}`}
                        </p>
                        <h3 className="text-lg font-bold font-display tracking-tight text-brand-text-primary truncate">
                          {item.product.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-black italic tracking-tighter text-brand-text-primary">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </span>
                          {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-brand-text-secondary line-through font-bold">
                                ₹{item.product.comparePrice.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">
                                {Math.round(((item.product.comparePrice - item.product.price) / item.product.comparePrice) * 100)}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1 bg-brand-surface-alt rounded-brand-md border border-brand-border">
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) {
                              removeItem(item.product.id, item.selectedSize, item.selectedColor);
                              toast.success('Item removed');
                            } else {
                              updateQty(item.product.id, item.quantity - 1, item.selectedSize, item.selectedColor);
                            }
                          }}
                          className="p-2 text-brand-text-muted hover:text-brand-accent transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQty(item.product.id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                          className="p-2 text-brand-text-muted hover:text-brand-accent transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      {/* Line Total */}
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-brand-text-muted uppercase tracking-widest mb-1">Total</p>
                        <p className="text-lg font-black italic tracking-tighter">
                          ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => {
                          removeItem(item.product.id, item.selectedSize, item.selectedColor);
                          toast.success('Item removed from cart');
                        }}
                        className="p-2 text-brand-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Order Summary */}
              <div className="lg:w-1/3">
                <div className="premium-card p-8 sticky top-28">
                  <h3 className="text-xl font-black font-display italic uppercase tracking-tighter mb-8">
                    Order Summary
                  </h3>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-text-secondary">Subtotal ({getItemCount()} items)</span>
                      <span className="font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-brand-text-secondary">Shipping</span>
                      {shipping === 0 ? (
                        <span className="font-bold text-emerald-500 text-xs uppercase tracking-widest">Free</span>
                      ) : (
                        <span className="font-bold">₹{shipping}</span>
                      )}
                    </div>
                    {shipping > 0 && (
                      <p className="text-[10px] text-brand-accent font-bold">
                        Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for free shipping!
                      </p>
                    )}
                  </div>

                  <div className="border-t border-brand-border pt-6 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <div className="text-right">
                        <span className="text-2xl font-black italic tracking-tighter">
                          ₹{total.toLocaleString('en-IN')}
                        </span>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-brand-text-muted mt-0.5">
                          Inclusive all Taxes
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button fullWidth size="lg" onClick={handleCheckout} className="mb-4">
                    {isAuthenticated ? 'Proceed to Checkout' : 'Login to Proceed'}
                  </Button>

                  <Link to="/shop">
                    <Button fullWidth variant="ghost" size="sm">
                      <ArrowLeft size={14} className="mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>

                  {/* Trust Signals */}
                  <div className="mt-8 pt-6 border-t border-brand-border space-y-3">
                    <div className="flex items-center gap-3 text-brand-text-muted">
                      <ShieldCheck size={14} className="text-brand-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Secure Checkout Guarantee</span>
                    </div>
                    <div className="flex items-center gap-3 text-brand-text-muted">
                      <Truck size={14} className="text-brand-accent" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Free Shipping Over ₹999</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Cart;
