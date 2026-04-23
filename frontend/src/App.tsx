import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './context/ToastContext';
import Spinner from '@components/ui/Spinner';

// Layouts
import PageWrapper from '@components/layout/PageWrapper';

// Lazy Loaded Pages
const Home = lazy(() => import('@pages/Home'));
const Shop = lazy(() => import('@pages/Shop'));
const ProductDetail = lazy(() => import('@pages/ProductDetail'));
const Cart = lazy(() => import('@pages/Cart'));
const Checkout = lazy(() => import('@pages/Checkout'));
const OrderConfirmation = lazy(() => import('@pages/OrderConfirmation'));
const Profile = lazy(() => import('@pages/Profile'));
const Wishlist = lazy(() => import('@pages/Wishlist'));
const FitnessAI = lazy(() => import('@pages/FitnessAI'));
const ProgressTracker = lazy(() => import('@pages/ProgressTracker'));
const TrackOrderEntry = lazy(() => import('@pages/TrackOrderEntry'));
const OrderTracking = lazy(() => import('@pages/OrderTracking'));
const Login = lazy(() => import('@pages/auth/Login'));
const Register = lazy(() => import('@pages/auth/Register'));

// Admin Pages (Lazy)
const AdminLayout = lazy(() => import('@components/layout/AdminLayout'));
const AdminDashboard = lazy(() => import('@pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('@pages/admin/Products'));
const AdminOrders = lazy(() => import('@pages/admin/Orders'));
const AdminAnalytics = lazy(() => import('@pages/admin/Analytics'));
const OwnerLogin = lazy(() => import('@pages/OwnerLogin'));
const OwnerDashboard = lazy(() => import('@pages/OwnerDashboard'));

// Stores & Hooks
import { useAuthStore } from '@store/authStore';
import { useOwnerStore } from '@store/ownerStore';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

/**
 * Protected Route Component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * Owner/Admin Route Component
 */
const OwnerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useOwnerStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/owner/login" replace />;
};

/**
 * Basic Error Boundary to catch runtime crashes
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("APP CRASH DETECTED:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fef2f2', color: '#991b1b', border: '2px solid #ef4444', margin: '20px', borderRadius: '8px' }}>
          <h2 style={{ margin: '0 0 10px 0' }}>🚨 Critical App Crash</h2>
          <p><strong>Error:</strong> {this.state.error?.message || "Unknown Error"}</p>
          <pre style={{ fontSize: '12px', background: '#fee2e2', padding: '10px', overflow: 'auto' }}>
            {this.state.error?.stack}
          </pre>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <DataProvider>
              <Router>
                <ToastProvider>
                  <Suspense fallback={
                  <div className="h-screen w-full flex items-center justify-center bg-brand-background">
                    <Spinner size="lg" />
                  </div>
                }>
                  <PageWrapper>
                    <Routes>
                      <Route path="/" element={<Navigate to="/home" replace />} />
                      <Route path="/home" element={<Home />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/shop/:category" element={<Shop />} />
                      <Route path="/product/:slug" element={<ProductDetail />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Public Browsing Routes (localStorage-based, no login needed) */}
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/track-order" element={<TrackOrderEntry />} />
                      <Route path="/orders/:id/tracking" element={<OrderTracking />} />

                      {/* Protected User Routes (login required) */}
                      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/fitness" element={<ProtectedRoute><FitnessAI /></ProtectedRoute>} />
                      <Route path="/tracker" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
                      <Route path="/orders/confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />

                      {/* Owner & Admin Routes */}
                      <Route path="/owner/login" element={<OwnerLogin />} />
                      <Route path="/owner/dashboard" element={<OwnerRoute><OwnerDashboard /></OwnerRoute>} />
                      
                      <Route path="/admin" element={<OwnerRoute><AdminLayout /></OwnerRoute>}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="analytics" element={<AdminAnalytics />} />
                      </Route>

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </PageWrapper>
                </Suspense>
                </ToastProvider>
              </Router>
            </DataProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
