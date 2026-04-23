import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@utils/cn';

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
  placeholder?: string;
}

const Image: React.FC<ImageProps> = ({ 
  src, 
  alt, 
  className, 
  fallback = 'https://via.placeholder.com/400x400?text=Image+Not+Found',
  placeholder = 'https://via.placeholder.com/20x20?text=...',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-brand-surface-alt", className)}>
      {/* Placeholder/Blurred state */}
      {!isLoaded && !error && (
        <img 
          src={placeholder} 
          alt="Loading..." 
          className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
        />
      )}

      {/* Main Image */}
      {isVisible && (
        <img
          ref={imgRef}
          src={error ? fallback : src}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-700",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          loading="lazy"
          {...props}
        />
      )}
    </div>
  );
};

export default Image;
