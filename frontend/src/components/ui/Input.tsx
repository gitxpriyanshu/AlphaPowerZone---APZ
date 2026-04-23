import React, { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, showPasswordToggle, type, required, onFocus, onBlur, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalValue, setInternalValue] = useState(props.defaultValue || '');
    
    // Sync with defaultValue changes (e.g. after async fetch)
    useEffect(() => {
      if (props.defaultValue !== undefined && props.defaultValue !== null) {
        setInternalValue(props.defaultValue);
      }
    }, [props.defaultValue]);
    
    // Support both controlled and uncontrolled
    const currentValue = value !== undefined ? value : internalValue;
    const hasValue = currentValue !== undefined && currentValue !== null && currentValue !== '';

    return (
      <div className="w-full space-y-1 group">
        {label && (
          <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-muted ml-1 mb-1.5">
            {label} {required && <span className="text-brand-error">*</span>}
          </label>
        )}
        <div className="relative">
          {/* Icon Wrappers */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted group-focus-within:text-brand-accent transition-colors z-10">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full bg-brand-surface border border-brand-border text-brand-text-primary rounded-brand-md px-4 py-3 outline-none transition-all focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-brand-error focus:border-brand-error focus:ring-brand-error/20',
              className
            )}
            onChange={(e) => {
              setInternalValue(e.target.value);
              props.onChange?.(e);
            }}
            onFocus={(e) => {
              setIsFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            value={value}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted z-10">
              {rightIcon}
            </div>
          )}
        </div>

        <AnimatePresence>
          {error ? (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs font-medium text-brand-error flex items-center gap-1 mt-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </motion.p>
          ) : hint ? (
            <p className="text-xs text-brand-text-muted ml-1 mt-1.5">{hint}</p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
