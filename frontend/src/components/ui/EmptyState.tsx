import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, PackageSearch, SearchX, Inbox } from 'lucide-react';
import Button from './Button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  type: 'cart' | 'wishlist' | 'orders' | 'search' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  actionPath?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, title, description, actionLabel = 'Browse Shop', actionPath = '/shop' 
}) => {
  const configs = {
    cart: {
      icon: <ShoppingBag size={64} />,
      title: 'Your Cart is Empty',
      description: 'Your performance gear is waiting. Start building your arsenal today.'
    },
    wishlist: {
      icon: <Heart size={64} />,
      title: 'No Favorites Yet',
      description: 'Save the items you demand most and track them here.'
    },
    orders: {
      icon: <Inbox size={64} />,
      title: 'No Orders Yet',
      description: 'You haven\'t placed any orders. Your journey starts with the first step.'
    },
    search: {
      icon: <SearchX size={64} />,
      title: 'No Results Found',
      description: 'We couldn\'t find any performance gear matching your search.'
    },
    generic: {
      icon: <PackageSearch size={64} />,
      title: 'Nothing Found',
      description: 'We couldn\'t find what you were looking for.'
    }
  };

  const config = configs[type];

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-32 h-32 rounded-full bg-brand-surface-alt flex items-center justify-center text-brand-text-muted mb-8 relative"
      >
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute inset-0 rounded-full bg-brand-accent/10"
        />
        {config.icon}
      </motion.div>
      
      <div className="space-y-4 max-w-sm mb-10">
        <h3 className="text-2xl font-black font-display italic uppercase tracking-tighter">
          {title || config.title}
        </h3>
        <p className="text-sm text-brand-text-secondary leading-relaxed">
          {description || config.description}
        </p>
      </div>

      <Link to={actionPath}>
        <Button variant="outline" className="px-10">
          {actionLabel}
        </Button>
      </Link>
    </div>
  );
};

export default EmptyState;
