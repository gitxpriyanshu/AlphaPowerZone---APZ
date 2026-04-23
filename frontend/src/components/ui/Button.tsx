import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@utils/cn';
import Spinner from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  disabled,
  onClick,
  ...props
}) => {
  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');

    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    
    if (onClick) onClick(e);
  };

  const variants = {
    primary: 'bg-brand-accent text-white hover:bg-brand-accent-hover shadow-brand-md',
    secondary: 'bg-brand-surface-alt text-brand-text-primary hover:bg-brand-border',
    outline: 'bg-transparent border-2 border-brand-border text-brand-text-primary hover:border-brand-text-primary',
    ghost: 'bg-transparent text-brand-text-muted hover:text-brand-text-primary hover:bg-brand-surface-alt',
    error: 'bg-brand-error text-white hover:opacity-90',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
    xl: 'px-12 py-6 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={handleRipple}
      disabled={disabled || isLoading}
      className={cn(
        'ripple-button inline-flex items-center justify-center font-black uppercase tracking-widest rounded-brand-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : 'w-auto',
        className
      )}
      {...props}
    >
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex items-center gap-2"
        >
          <Spinner size="sm" color={variant === 'primary' ? 'white' : 'accent'} />
          <span>Processing...</span>
        </motion.div>
      ) : (
        children
      )}
    </motion.button>
  );
};

export default Button;
