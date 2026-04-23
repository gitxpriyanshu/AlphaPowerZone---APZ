import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '@store/wishlistStore';
import { useCartStore } from '@store/cartStore';
import ProductCard from '@components/product/ProductCard';
import Button from '@components/ui/Button';
import toast from 'react-hot-toast';

const Wishlist: React.FC = () => {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const handleMoveToCart = (product: any) => {
    addToCart(product, 1);
    removeItem(product.id);
    toast.success('Moved to cart');
  };

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>My Wishlist | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-black font-display italic uppercase tracking-tighter mb-4">
              My <span className="text-brand-accent">Wishlist</span>
            </h1>
            <p className="text-brand-text-secondary">Your curated elite gear selection. Ready to perform when you are.</p>
          </div>
          
          {items.length > 0 && (
            <Button 
              variant="ghost" 
              onClick={clearWishlist}
              className="text-brand-error hover:bg-brand-error/5"
            >
              <Trash2 className="mr-2" size={18} />
              Clear All
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {items.map((product) => (
                <div key={product.id} className="space-y-4 group">
                  <ProductCard product={product} />
                  <Button 
                    variant="secondary" 
                    fullWidth 
                    onClick={() => handleMoveToCart(product)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    Move to Cart
                  </Button>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-32 text-center"
            >
              <div className="w-24 h-24 bg-brand-surface-alt rounded-full flex items-center justify-center mx-auto mb-8 text-brand-text-muted relative">
                <Heart size={48} className="relative z-10" />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-brand-accent rounded-full"
                />
              </div>
              <h3 className="text-3xl font-black font-display uppercase italic tracking-tighter mb-4">No gear here yet</h3>
              <p className="text-brand-text-secondary max-w-sm mx-auto mb-10 leading-relaxed">
                Start adding your favorite products to your wishlist to keep track of elite performance gear.
              </p>
              <Link to="/shop">
                <Button size="xl" className="px-12 group">
                  Explore Shop
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;
