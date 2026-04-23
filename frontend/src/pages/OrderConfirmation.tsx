import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@components/ui/Button';

const OrderConfirmation: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-background pt-32 pb-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          className="w-24 h-24 bg-brand-success/10 text-brand-success rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle size={48} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black font-display italic uppercase tracking-tighter mb-4"
        >
          Order <span className="text-brand-accent">Confirmed</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-brand-text-secondary text-lg mb-12 max-w-lg mx-auto"
        >
          Your elite gear is being prepared for dispatch. We've sent a confirmation email with all the details.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-6 border-l-4 border-brand-accent"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-brand-md bg-brand-surface-alt flex items-center justify-center text-brand-accent">
                <Package size={20} />
              </div>
              <h3 className="font-bold uppercase tracking-tight text-sm">Next Steps</h3>
            </div>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              You'll receive a tracking number once your order leaves our warehouse. Average delivery time is 3-5 business days.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="premium-card p-6 border-l-4 border-brand-success"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-brand-md bg-brand-surface-alt flex items-center justify-center text-brand-success">
                <ShoppingBag size={20} />
              </div>
              <h3 className="font-bold uppercase tracking-tight text-sm">Join the Elite</h3>
            </div>
            <p className="text-xs text-brand-text-secondary leading-relaxed">
              Share your unboxing on social media and tag #AlphaPowerZone to be featured in our monthly community drops.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link to="/shop" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full">
              Continue Shopping
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
          <Link to="/profile" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full">
              View Order History
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
