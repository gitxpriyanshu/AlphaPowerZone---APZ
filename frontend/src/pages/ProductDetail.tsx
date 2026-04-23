import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { 
  Star, Share2, Heart, ShoppingCart, ShieldCheck, 
  Truck, RefreshCw, ChevronRight, Plus, Minus, Check 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@config/axiosInstance';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import Skeleton from '@components/ui/Skeleton';
import ProductCard from '@components/product/ProductCard';
import { useCartStore } from '@store/cartStore';
import { useWishlistStore } from '@store/wishlistStore';
import toast from 'react-hot-toast';

const ProductDetail: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addItem: addToCart } = useCartStore();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/products/${slug}`);
      return data.data;
    },
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.categoryId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/products?category=${product.category.slug}&limit=4`);
      return data.data.products.filter((p: any) => p.id !== product.id);
    },
    enabled: !!product,
  });

  if (isLoading) return <div className="pt-32 px-6 lg:px-24"><Skeleton variant="rectangular" className="h-[600px]" /></div>;
  if (error || !product) return <div className="pt-32 text-center">Product not found</div>;

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = () => {
    if (product.sizes?.length && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart(product, quantity, selectedSize || undefined);
    toast.success('Added to cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist');
    }
  };

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>{product.name} | AlphaPowerZone</title>
      </Helmet>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-brand-text-muted mb-8">
        <Link to="/" className="hover:text-brand-accent transition-colors">Home</Link>
        <ChevronRight size={10} />
        <Link to={`/shop/${product.category.slug}`} className="hover:text-brand-accent transition-colors">{product.category.name}</Link>
        <ChevronRight size={10} />
        <span className="text-brand-text-primary font-bold">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] bg-brand-surface-alt rounded-brand-xl overflow-hidden group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={product.images[activeImage]}
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full object-cover"
              />
            </AnimatePresence>
            
            {/* Zoom Hint */}
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus size={12} /> Click to enlarge
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {product.images.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "w-24 h-24 rounded-brand-md overflow-hidden border-2 transition-all flex-shrink-0",
                  activeImage === i ? "border-brand-accent scale-105" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <img src={img} alt={`${product.name} ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <Badge variant="primary" className="mb-4">{product.category.name}</Badge>
            <h1 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-brand-accent">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill={i < Math.floor(product.avgRating) ? "currentColor" : "none"} />
                ))}
              </div>
              <a href="#reviews" className="text-xs font-bold text-brand-text-secondary hover:text-brand-accent underline underline-offset-4 uppercase tracking-widest">
                {product.reviewCount} Reviews
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <span className="text-5xl font-black font-display italic tracking-tighter text-brand-text-primary">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <div className="flex flex-col">
                  <span className="text-lg text-brand-text-secondary line-through font-bold">
                    ₹{product.comparePrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-black text-emerald-500 italic">
                    {product.discount || Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                  </span>
                </div>
              )}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted opacity-60">Inclusive of all taxes</p>
          </div>

          <div className="space-y-6 pt-6 border-t border-brand-border">
            {/* Stock Indicator */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                product.stock > 10 ? "bg-brand-success" : product.stock > 0 ? "bg-brand-warning animate-pulse" : "bg-brand-error"
              )} />
              <span className="text-xs font-bold uppercase tracking-widest">
                {product.stock > 10 ? "In Stock - Ready to Ship" : product.stock > 0 ? `Only ${product.stock} Left in Stock` : "Currently Out of Stock"}
              </span>
            </div>

            {/* Size Selector */}
            {product.sizes?.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Select Size</span>
                  <button className="text-[10px] uppercase tracking-widest font-black text-brand-accent underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "w-12 h-12 flex items-center justify-center rounded-brand-md border-2 font-mono text-sm font-bold transition-all",
                        selectedSize === size 
                          ? "border-brand-accent bg-brand-accent text-white shadow-brand-md" 
                          : "border-brand-border text-brand-text-secondary hover:border-brand-text-primary"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">Quantity</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-brand-border rounded-brand-md">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="p-3 hover:bg-brand-surface-alt transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-bold font-mono">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="p-3 hover:bg-brand-surface-alt transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <button 
                  onClick={toggleWishlist}
                  className={cn(
                    "p-3 rounded-brand-md border-2 transition-all",
                    inWishlist ? "bg-brand-accent border-brand-accent text-white" : "border-brand-border text-brand-text-secondary hover:text-brand-accent"
                  )}
                >
                  <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
                </button>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Button 
                onClick={handleAddToCart}
                size="xl" 
                fullWidth 
                className="group"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="mr-2 w-5 h-5" />
                Add to Cart
              </Button>
              <Button 
                onClick={handleBuyNow}
                variant="secondary" 
                size="xl" 
                fullWidth
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-brand-surface-alt p-6 rounded-brand-xl space-y-4">
            <div className="flex items-center gap-3 text-sm font-bold">
              <ShieldCheck className="text-brand-accent" size={20} />
              <span>2 Year Warranty on Performance Gear</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold">
              <Truck className="text-brand-accent" size={20} />
              <span>Free Express Delivery over ₹999</span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold">
              <RefreshCw className="text-brand-accent" size={20} />
              <span>30-Day Hassle-Free Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mt-24">
        <div className="flex items-center justify-center gap-8 md:gap-16 border-b border-brand-border mb-12">
          {['description', 'specifications', 'reviews'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-4 text-xs font-black uppercase tracking-widest transition-all relative",
                activeTab === tab ? "text-brand-accent" : "text-brand-text-muted hover:text-brand-text-primary"
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTab" 
                  className="absolute bottom-0 left-0 w-full h-1 bg-brand-accent" 
                />
              )}
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          {activeTab === 'description' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-zinc max-w-none"
            >
              <p className="text-lg text-brand-text-secondary leading-relaxed">
                {product.description}
              </p>
            </motion.div>
          )}

          {activeTab === 'specifications' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6"
            >
              {Object.entries(product.specs || {}).map(([key, val]: any) => (
                <div key={key} className="flex justify-between items-center py-3 border-b border-brand-border">
                  <span className="text-xs font-bold uppercase tracking-widest text-brand-text-muted">{key}</span>
                  <span className="text-sm font-bold">{val}</span>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div 
              id="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-brand-surface-alt p-8 rounded-brand-xl">
                <div className="text-center md:text-left">
                  <p className="text-5xl font-black font-display italic tracking-tighter mb-2">{product.avgRating.toFixed(1)}</p>
                  <div className="flex text-brand-accent mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={20} fill={i < Math.floor(product.avgRating) ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p className="text-xs text-brand-text-muted uppercase tracking-widest font-bold">Based on {product.reviewCount} reviews</p>
                </div>
                <Button size="lg">Write a Review</Button>
              </div>
              
              {/* Review list would go here */}
              <p className="text-center text-brand-text-muted italic py-12">No reviews yet. Be the first to share your experience.</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <section className="mt-24">
          <div className="flex items-end justify-between mb-12">
            <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">You Might Also Like</h2>
            <Link to={`/shop/${product.category.slug}`} className="text-xs font-black uppercase tracking-widest text-brand-accent hover:underline">View More</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;
