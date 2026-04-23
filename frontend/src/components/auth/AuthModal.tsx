import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '@store/uiStore';
import { useAuth } from '../../context/AuthContext';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AuthModal: React.FC = () => {
  const { activeModal, closeModal } = useUIStore();
  const { loginUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isOpen = activeModal === 'login';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await loginUser(email, password);
      if (res.success) {
        toast.success('Access granted. Welcome back.');
        closeModal();
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-brand-background/80 backdrop-blur-md z-[1000]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[1001] p-4"
          >
            <div className="premium-card p-10 relative bg-brand-surface border-brand-border">
              <button
                onClick={closeModal}
                className="absolute right-6 top-6 text-brand-text-muted hover:text-brand-accent transition-colors bg-brand-surface-alt p-2 rounded-full"
              >
                <X size={20} />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter mb-2">
                  <span className="text-brand-accent">Login</span> Required
                </h2>
                <p className="text-sm text-brand-text-secondary">
                  Access your elite gear and saved progress.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-brand-sm bg-brand-error/10 border border-brand-error/20 text-brand-error text-sm font-bold text-center">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-2 ml-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-brand-surface-alt border border-brand-border rounded-brand-md px-4 py-3 text-brand-text-primary focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-muted mb-2 ml-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-surface-alt border border-brand-border rounded-brand-md px-4 py-3 text-brand-text-primary focus:outline-none focus:border-brand-accent transition-colors"
                    placeholder="Enter your password"
                  />
                </div>

                <Button type="submit" fullWidth disabled={isLoading}>
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-brand-text-muted">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    onClick={closeModal}
                    className="text-brand-accent font-bold hover:underline"
                  >
                    Register here
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
