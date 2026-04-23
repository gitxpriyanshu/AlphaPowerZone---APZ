import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import axiosInstance from "../config/axiosInstance";
import { useAuth } from "./AuthContext";

interface DataContextType {
  products: any[];
  categories: any[];
  cart: any[];
  orders: any[];
  loading: boolean;
  error: string | null;
  refreshGlobalData: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [hasInitialFetched, setHasInitialFetched] = useState(false);
  const isFetchingGlobal = useRef(false);

  const fetchGlobalData = useCallback(async (force = false) => {
    if (isFetchingGlobal.current || (hasInitialFetched && !force)) return;

    isFetchingGlobal.current = true;
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axiosInstance.get("/products?limit=100"),
        axiosInstance.get("/products/categories"),
      ]);
      
      const fetchedProducts = productsRes.data.data.products || [];
      setProducts(fetchedProducts);
      
      // Use real categories from the API, not derived from products
      setCategories(categoriesRes.data.data || []);
      
      setHasInitialFetched(true);
      setError(null);
    } catch (err) {
      console.error("Global Data fetch error:", err);
      setError("Failed to load initial data");
    } finally {
      setLoading(false);
      isFetchingGlobal.current = false;
    }
  }, [hasInitialFetched]);

  const refreshAll = useCallback(async () => {
    await fetchGlobalData(true);
  }, [fetchGlobalData]);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  const value = useMemo(() => ({
    products,
    categories,
    cart, // Deprecated: Use useCartStore instead
    orders, // Deprecated: Fetch locally in components instead
    loading,
    error,
    refreshGlobalData: () => fetchGlobalData(true),
    refreshAll
  }), [products, categories, cart, orders, loading, error, fetchGlobalData, refreshAll]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
