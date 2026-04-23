import React from 'react';
import { cn } from '@utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'card';
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'rectangular' }) => {
  if (variant === 'card') return <CardSkeleton />;
  
  return (
    <div 
      className={cn(
        "animate-pulse bg-brand-surface-alt",
        variant === 'circular' ? 'rounded-full' : 'rounded-brand-md',
        variant === 'text' ? 'h-4 w-full mb-2' : '',
        className
      )}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="space-y-4 w-full">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 p-4 border border-brand-border rounded-brand-md">
        <Skeleton className="w-12 h-12 flex-shrink-0" />
        <div className="flex-grow space-y-2">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-full h-3" />
        </div>
        <Skeleton className="w-20 h-8" />
      </div>
    ))}
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="premium-card p-4 space-y-4">
    <Skeleton className="aspect-square w-full" />
    <Skeleton className="w-2/3 h-4" />
    <div className="flex justify-between items-center">
      <Skeleton className="w-1/4 h-6" />
      <Skeleton className="w-1/3 h-10" />
    </div>
  </div>
);

export default Skeleton;
