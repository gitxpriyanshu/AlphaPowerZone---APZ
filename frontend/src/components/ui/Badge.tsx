import React from 'react';
import { cn } from '@utils/cn';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'primary' | 'outline';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'primary', children, className }) => {
  const variants = {
    primary: 'bg-orange-600/10 text-orange-500 border-orange-600/20',
    success: 'bg-green-600/10 text-green-500 border-green-600/20',
    warning: 'bg-yellow-600/10 text-yellow-500 border-yellow-600/20',
    error: 'bg-red-600/10 text-red-500 border-red-600/20',
    info: 'bg-blue-600/10 text-blue-500 border-blue-600/20',
    outline: 'bg-transparent text-gray-500 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
