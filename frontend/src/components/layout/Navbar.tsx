import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Heart, User, Menu, X, 
  Search, ChevronDown, Zap, Globe
} from 'lucide-react';
import { FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import { useUIStore } from '@store/uiStore';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { openModal } = useUIStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items } = useCartStore();
  const location = useLocation();

  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Shop All', path: '/shop' },
    { label: 'Performance Gear', path: '/shop/strength' },
    { label: 'Nutrition', path: '/shop/supplements' },
    { label: 'Elite AI', path: '/fitness' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 w-full z-[1000] transition-all duration-500",
        isScrolled ? "bg-white/80 backdrop-blur-xl border-b border-brand-border py-4" : "bg-transparent py-8"
      )}>
        {/* Announcement Bar */}
        {!isScrolled && (
          <div className="absolute top-0 left-0 w-full bg-brand-text-primary text-white py-2 text-[8px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4">
            <span className="flex items-center gap-2"><Zap size={10} className="text-brand-accent fill-brand-accent" /> Free shipping on orders over ₹999</span>
            <span className="opacity-30">|</span>
            <span className="flex items-center gap-2"><Globe size={10} className="text-brand-accent" /> Serving elite athletes across India</span>
          </div>
        )}

        <div className="w-full px-6 md:px-12 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="text-lg xl:text-xl font-black font-display italic uppercase tracking-tighter group flex items-center gap-3 shrink-0">
            <img src="/images/apz_logo.png" alt="AlphaPowerZone Wolf Logo" className="h-8 md:h-10 w-auto object-contain" />
            <div className="hidden lg:block">
              Alpha<span className="text-brand-accent group-hover:text-brand-text-primary transition-colors duration-500">Power</span>Zone
            </div>
            <div className="hidden sm:block lg:hidden text-2xl">
              A<span className="text-brand-accent group-hover:text-brand-text-primary transition-colors duration-500">P</span>Z
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-4 xl:gap-8 flex-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end
                className={({ isActive }) => cn(
                  "relative text-xs font-black uppercase tracking-widest transition-colors duration-300 py-2",
                  isActive ? "text-brand-accent" : "text-brand-text-primary hover:text-brand-accent"
                )}
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    {isActive && (
                      <motion.div 
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-accent"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-3 md:gap-5 shrink-0">
            <button onClick={() => navigate('/shop')} className="text-brand-text-primary hover:text-brand-accent transition-colors">
              <Search size={20} />
            </button>
            <Link to="/wishlist" className="relative text-brand-text-primary hover:text-brand-accent transition-colors hidden sm:block">
              <Heart size={20} />
            </Link>
            <button onClick={() => navigate('/cart')} className="relative text-brand-text-primary hover:text-brand-accent transition-colors">
              <ShoppingBag size={20} />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    key={cartCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute -top-2 -right-2 w-4 h-4 bg-brand-accent text-white text-[8px] font-black flex items-center justify-center rounded-full"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            {isAuthenticated ? (
              <Link to="/profile">
                <div className="flex items-center gap-3 pl-4 border-l border-brand-border group">
                  <div className="w-8 h-8 rounded-full bg-brand-surface-alt flex items-center justify-center text-brand-text-muted group-hover:bg-brand-accent group-hover:text-white transition-all">
                    <User size={16} />
                  </div>
                  <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-brand-text-muted group-hover:text-brand-text-primary transition-colors">
                    {user?.name?.split(' ')[0] || 'User'}
                  </span>
                </div>
              </Link>
            ) : (
              <button onClick={() => openModal('login')} className="flex items-center gap-3 pl-4 border-l border-brand-border group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-brand-surface-alt flex items-center justify-center text-brand-text-muted group-hover:bg-brand-accent group-hover:text-white transition-all">
                  <User size={16} />
                </div>
                <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-brand-text-muted group-hover:text-brand-text-primary transition-colors">
                  Sign In
                </span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="lg:hidden p-2 bg-brand-surface-alt rounded-brand-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-xs bg-white z-[1002] shadow-2xl p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="text-xl font-black font-display italic uppercase">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-brand-surface-alt rounded-full">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link 
                      to={link.path} 
                      className="text-2xl font-black font-display italic uppercase tracking-tighter hover:text-brand-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-auto space-y-6">
                <Link to="/profile">
                  <Button variant="outline" fullWidth>My Account</Button>
                </Link>
                <div className="flex justify-center gap-6 text-brand-text-muted">
                  <FiInstagram size={20} />
                  <FiTwitter size={20} />
                  <FiYoutube size={20} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
