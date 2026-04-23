import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@store/cartStore';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, removeItem, updateQty, getTotal, getItemCount } = useCartStore();
  
  const subtotal = getTotal();
  const itemCount = getItemCount();
  const freeShippingThreshold = 999;
  const shippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-[2001] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black font-display uppercase italic tracking-tighter">Your Cart</h2>
                <p className="text-xs text-brand-text-muted font-mono uppercase tracking-widest">{itemCount} Items</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-brand-surface-alt rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={`${item.product.id}-${item.selectedSize}`} className="flex gap-4 group">
                    <div className="w-24 h-28 bg-brand-surface-alt rounded-brand-md overflow-hidden flex-shrink-0">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-sm font-bold font-display uppercase tracking-tight line-clamp-1">
                          {item.product.name}
                        </h3>
                        <button 
                          onClick={() => removeItem(item.product.id, item.selectedSize)}
                          className="text-brand-text-muted hover:text-brand-error transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] font-mono uppercase text-brand-text-muted mb-2">
                        {item.product.category} {item.selectedSize && `| Size: ${item.selectedSize}`}
                      </p>
                      
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-brand-border rounded-brand-sm">
                          <button 
                            onClick={() => updateQty(item.product.id, Math.max(1, item.quantity - 1), item.selectedSize)}
                            className="p-1 hover:bg-brand-surface-alt transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-mono">{item.quantity}</span>
                          <button 
                            onClick={() => updateQty(item.product.id, item.quantity + 1, item.selectedSize)}
                            className="p-1 hover:bg-brand-surface-alt transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <p className="font-bold font-mono text-sm">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                  <div className="w-20 h-20 bg-brand-surface-alt rounded-full flex items-center justify-center text-brand-text-muted">
                    <ShoppingBag size={40} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold font-display uppercase tracking-tight italic">Your cart is empty</h3>
                    <p className="text-sm text-brand-text-muted max-w-[200px] mx-auto mt-2">Looks like you haven't added any gear to your cart yet.</p>
                  </div>
                  <Button onClick={onClose} variant="outline" size="sm">Start Shopping</Button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-brand-border bg-brand-background">
              {/* Shipping Progress */}
              <div className="mb-6">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest mb-2">
                  <span>{subtotal >= freeShippingThreshold ? 'Free shipping unlocked!' : `₹${(freeShippingThreshold - subtotal).toFixed(2)} away from free shipping`}</span>
                  <span>{Math.round(shippingProgress)}%</span>
                </div>
                <div className="h-1 bg-brand-border rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${shippingProgress}%` }}
                    className="h-full bg-brand-accent"
                  />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-brand-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-brand-text-secondary">
                  <span>Shipping</span>
                  <span className="font-mono uppercase text-[10px] tracking-widest">
                    {subtotal >= freeShippingThreshold ? 'Calculated at checkout' : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-black font-display italic uppercase tracking-tighter pt-3 border-t border-brand-border">
                  <span>Total</span>
                  <span className="font-mono not-italic">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <Link to="/checkout" onClick={onClose}>
                <Button fullWidth size="xl" disabled={items.length === 0} className="group">
                  Checkout Now
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
