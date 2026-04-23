import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import { Product } from '@typeDefs/product';
import { useWishlistStore } from '@store/wishlistStore';
import { useCartStore } from '@store/cartStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
    toast.success('Added to cart');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      className="premium-card group h-full flex flex-col overflow-hidden bg-white"
    >
      {/* Image Wrapper */}
      <div className="relative aspect-[4/5] overflow-hidden bg-brand-surface-alt">
        <img
          src={product.images[0] || '/images/placeholder.jpg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.stock === 0 && <Badge variant="error">Sold Out</Badge>}
          {product.isFeatured && <Badge variant="primary">Elite Pick</Badge>}
          {product.comparePrice && (
            <Badge variant="warning">
              {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all duration-300 z-10",
            inWishlist ? "bg-brand-accent text-white" : "bg-white/80 text-brand-text-secondary hover:bg-white hover:text-brand-accent"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={inWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5L12 21l7-7Z" />
          </svg>
        </button>

        {/* Quick Add Button */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full transition-transform duration-300 group-hover:translate-y-0 bg-gradient-to-t from-black/50 to-transparent">
          <Button
            onClick={handleAddToCart}
            fullWidth
            disabled={product.stock === 0}
            className="shadow-xl"
          >
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="text-[10px] font-mono uppercase tracking-widest text-brand-text-muted mb-1">
          {product.category.name}
        </p>
        <h3 className="text-lg font-semibold font-display tracking-tight text-brand-text-primary line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        {/* Ratings */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex text-brand-accent">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < Math.floor(product.avgRating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ))}
          </div>
          <span className="text-[10px] text-brand-text-muted">({product.reviewCount})</span>
        </div>

        {/* Price Display */}
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-xl font-black italic tracking-tighter text-brand-text-primary">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <>
              <span className="text-xs text-brand-text-secondary line-through font-bold">
                ₹{product.comparePrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-black text-emerald-500 italic">
                {product.discount || Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
              </span>
            </>
          )}
        </div>
        <p className="text-[8px] font-bold uppercase tracking-widest text-brand-text-muted mt-1 opacity-60">Inclusive all Taxes</p>
      </div>
    </motion.div>
  );
};

export default ProductCard;
