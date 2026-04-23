import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import PageTransition from './PageTransition';
import { Toaster } from 'react-hot-toast';
import AuthModal from '../auth/AuthModal';

interface PageWrapperProps {
  children?: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/owner');

  useEffect(() => {
    // Start progress bar on route change
    NProgress.start();
    const timeout = setTimeout(() => {
      NProgress.done();
    }, 200);

    return () => {
      clearTimeout(timeout);
      NProgress.done();
    };
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      {!isAdminRoute && <Navbar />}
      
      {/* Toast Configuration */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'premium-card !bg-white !text-brand-text-primary !rounded-brand-md !border-l-4 !border-brand-accent !font-bold !text-sm !shadow-brand-md !py-4 !px-6',
          duration: 3000,
          style: {
            fontFamily: '"Syne", sans-serif',
          }
        }}
      />

      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            {children || <Outlet />}
          </PageTransition>
        </AnimatePresence>
      </main>

      <AuthModal />
      {!isAdminRoute && <Footer />}
    </div>
  );
};

export default PageWrapper;
