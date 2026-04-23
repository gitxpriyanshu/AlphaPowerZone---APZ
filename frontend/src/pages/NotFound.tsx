import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ShoppingBag } from 'lucide-react';
import Button from '@components/ui/Button';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-background flex items-center justify-center px-6 overflow-hidden relative">
      {/* Background Accent */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 90, 180, 270, 360],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[800px] h-[800px] border-[100px] border-brand-accent/20 rounded-full blur-3xl pointer-events-none"
      />

      <div className="text-center space-y-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 10 }}
          className="relative inline-block"
        >
          <span className="text-[180px] md:text-[250px] font-black font-display italic uppercase tracking-tighter leading-none opacity-5">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertTriangle className="text-brand-accent" size={80} />
          </div>
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter">
            System <span className="text-brand-accent">Interrupted</span>
          </h1>
          <p className="text-brand-text-secondary text-sm md:text-base max-w-md mx-auto">
            The coordinates you requested are outside the performance zone. The page may have been moved or archived.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <Button size="lg" className="px-8">
              <Home className="mr-2" size={18} /> Return Home
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" size="lg" className="px-8">
              <ShoppingBag className="mr-2" size={18} /> Browse Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
