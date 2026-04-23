import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Search, X, SlidersHorizontal, LayoutGrid, List, Filter } from 'lucide-react';
import { useProducts } from '@hooks/useProducts';
import { useDebounce } from '@hooks/useDebounce';
import { useData } from '../context/DataContext';
import ProductCard from '@components/product/ProductCard';
import Skeleton from '@components/ui/Skeleton';
import Button from '@components/ui/Button';
import Badge from '@components/ui/Badge';
import { cn } from '@utils/cn';

const Shop: React.FC = () => {
  const { categories: dbCategories } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('featured');
  
  // Filters State
  const [filters, setFilters] = useState({
    categories: [] as string[],
    priceRange: [0, 5000],
    minRating: 0,
    inStock: false,
  });

  const apiFilters = React.useMemo(() => ({
    search: debouncedSearch,
    category: filters.categories.join(','),
    sortBy,
    limit: '100',
  }), [debouncedSearch, filters.categories, sortBy]);

  const { products, isLoading, refetch } = useProducts(apiFilters);

  const handleCategoryToggle = (cat: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat) 
        ? prev.categories.filter(c => c !== cat) 
        : [...prev.categories, cat]
    }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      priceRange: [0, 5000],
      minRating: 0,
      inStock: false,
    });
    setSearchTerm('');
  };

  const activeFilterCount = (filters.categories.length > 0 ? 1 : 0) + 
                             (filters.minRating > 0 ? 1 : 0) + 
                             (filters.inStock ? 1 : 0);

  return (
    <div className="min-h-screen bg-brand-background pt-28 pb-24 px-6 md:px-12 lg:px-24">
      <Helmet>
        <title>Shop Elite Collection | AlphaPowerZone</title>
      </Helmet>

      <div className="max-w-7xl mx-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div className="max-w-xl">
            <h1 className="text-5xl md:text-6xl font-black font-display italic uppercase tracking-tighter mb-4">
              Elite <span className="text-brand-accent">Gear</span>
            </h1>
            <p className="text-brand-text-secondary">Explore our curated collection of high-performance gear designed for those who never settle.</p>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted group-focus-within:text-brand-accent transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search equipment, apparel..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-brand-border rounded-brand-md pl-12 pr-4 py-4 outline-none focus:border-brand-accent transition-all shadow-brand-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-primary"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden lg:block w-72 space-y-10">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold font-display uppercase tracking-widest text-sm flex items-center gap-2">
                  <SlidersHorizontal size={16} />
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="text-[10px] uppercase tracking-widest font-black text-brand-accent hover:underline">
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <p className="font-bold text-xs uppercase tracking-widest text-brand-text-muted">Categories</p>
                <div className="space-y-3">
                  {dbCategories.map((cat: any) => (
                    <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-5 h-5 rounded border transition-all flex items-center justify-center",
                        filters.categories.includes(cat.slug) ? "bg-brand-accent border-brand-accent" : "border-brand-border group-hover:border-brand-accent"
                      )}>
                        {filters.categories.includes(cat.slug) && <X size={12} className="text-white" />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={filters.categories.includes(cat.slug)}
                        onChange={() => handleCategoryToggle(cat.slug)}
                      />
                      <span className={cn("text-sm transition-colors", filters.categories.includes(cat.slug) ? "text-brand-text-primary font-bold" : "text-brand-text-secondary group-hover:text-brand-text-primary")}>
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <hr className="my-10 border-brand-border" />

              {/* Price Range */}
              <div className="space-y-6">
                <p className="font-bold text-xs uppercase tracking-widest text-brand-text-muted">Price Range</p>
                <div className="space-y-4">
                  <input type="range" className="w-full accent-brand-accent" min="0" max="100000" />
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span>₹0</span>
                    <span>₹1,00,000+</span>
                  </div>
                </div>
              </div>

              <hr className="my-10 border-brand-border" />

              {/* Availability */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-brand-text-secondary">In Stock Only</span>
                <button 
                  onClick={() => setFilters(f => ({ ...f, inStock: !f.inStock }))}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    filters.inStock ? "bg-brand-accent" : "bg-brand-border"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                    filters.inStock ? "right-1" : "left-1"
                  )} />
                </button>
              </div>
            </div>

            <div className="bg-brand-text-primary text-white p-6 rounded-brand-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-accent/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
              <div className="relative z-10">
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] mb-2">Exclusive</p>
                <h4 className="text-lg font-black font-display italic leading-tight mb-4">JOIN THE ELITE SQUAD</h4>
                <p className="text-xs text-zinc-400 mb-6">Get 15% off your first elite order and early access drops.</p>
                <Button size="sm" variant="outline" className="text-white border-white w-full">Join Now</Button>
              </div>
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-grow">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4 border-b border-brand-border pb-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 bg-white border border-brand-border rounded-brand-md px-4 py-2 text-sm font-bold shadow-brand-sm"
                >
                  <Filter size={16} />
                  Filters
                  {activeFilterCount > 0 && <Badge variant="primary" className="ml-1">{activeFilterCount}</Badge>}
                </button>
                <p className="text-sm text-brand-text-muted">
                  Showing <span className="text-brand-text-primary font-bold">{isLoading ? '...' : products.length}</span> results
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center bg-brand-surface-alt p-1 rounded-brand-md border border-brand-border">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("p-1.5 rounded-sm transition-all", viewMode === 'grid' ? "bg-white text-brand-accent shadow-sm" : "text-brand-text-muted")}
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn("p-1.5 rounded-sm transition-all", viewMode === 'list' ? "bg-white text-brand-accent shadow-sm" : "text-brand-text-muted")}
                  >
                    <List size={18} />
                  </button>
                </div>

                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-brand-border rounded-brand-md px-4 py-2 text-sm font-bold outline-none focus:border-brand-accent"
                >
                  <option value="featured">Featured</option>
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low-High</option>
                  <option value="price-high">Price: High-Low</option>
                  <option value="rating">Best Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "grid gap-6",
                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  )}
                >
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} variant="card" />
                  ))}
                </motion.div>
              ) : products.length > 0 ? (
                <motion.div 
                  key="products"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    "grid gap-6",
                    viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"
                  )}
                >
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              ) : (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-24 text-center"
                >
                  <div className="w-20 h-20 bg-brand-surface-alt rounded-full flex items-center justify-center mx-auto mb-6 text-brand-text-muted">
                    <Search size={40} />
                  </div>
                  <h3 className="text-2xl font-black font-display uppercase italic tracking-tighter mb-2">No gear found</h3>
                  <p className="text-brand-text-secondary mb-8">Try adjusting your filters or search term to find what you're looking for.</p>
                  <Button variant="outline" onClick={clearFilters}>Clear All Filters</Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination Placeholder */}
            {!isLoading && products.length > 0 && (
              <div className="mt-16 flex justify-center gap-2">
                <Button variant="outline" size="sm" disabled>Prev</Button>
                <Button size="sm">1</Button>
                <Button variant="ghost" size="sm">2</Button>
                <Button variant="ghost" size="sm">3</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-[2001] p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-brand-surface-alt rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              {/* Mobile filter content (same as sidebar) */}
              <div className="space-y-10">
                <div className="space-y-6">
                  <p className="font-bold text-xs uppercase tracking-widest text-brand-text-muted">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {dbCategories.map((cat: any) => (
                      <button 
                        key={cat.id}
                        onClick={() => handleCategoryToggle(cat.slug)}
                        className={cn(
                          "px-4 py-2 rounded-full border text-xs font-bold transition-all",
                          filters.categories.includes(cat.slug) ? "bg-brand-accent border-brand-accent text-white" : "border-brand-border text-brand-text-secondary"
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Add other mobile filters here */}
                <Button fullWidth onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
                <Button variant="ghost" fullWidth onClick={clearFilters}>Clear All</Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
