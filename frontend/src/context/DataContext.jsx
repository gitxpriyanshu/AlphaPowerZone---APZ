import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [hasInitialFetched, setHasInitialFetched] = useState(false);
  const isFetchingGlobal = useRef(false);
  const isFetchingCart = useRef(false);
  const isFetchingOrders = useRef(false);

  const fetchGlobalData = useCallback(async (force = false) => {
    if (isFetchingGlobal.current || (hasInitialFetched && !force)) return;

    isFetchingGlobal.current = true;
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      
      setProducts(productsRes.data);
      const filteredCategories = categoriesRes.data.filter(
        (cat) => !cat.name.toLowerCase().includes("default")
      );
      setCategories(filteredCategories);
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

  const fetchCart = useCallback(async () => {
    if (!user || user.role !== "user" || isFetchingCart.current) {
      if (!user) setCart([]);
      return;
    }

    isFetchingCart.current = true;
    try {
      const res = await api.get("/cart");
      setCart(res.data);
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      isFetchingCart.current = false;
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    if (!user || user.role !== "user" || isFetchingOrders.current) {
      if (!user) setOrders([]);
      return;
    }

    isFetchingOrders.current = true;
    try {
      const res = await api.get("/orders");
      setOrders(res.data);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      isFetchingOrders.current = false;
    }
  }, [user]);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchGlobalData(true), fetchCart(), fetchOrders()]);
  }, [fetchGlobalData, fetchCart, fetchOrders]);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  useEffect(() => {
    if (user && user.role === "user") {
      fetchCart();
      fetchOrders();
    } else {
      setCart([]);
      setOrders([]);
    }
  }, [user, fetchCart, fetchOrders]);

  const addToCart = useCallback(async (productId, showToast) => {
    if (!user || user.role !== "user") {
      if (showToast) showToast("Please login to add items", "error");
      return;
    }

    // 1. SAVE PREVIOUS STATE (For Rollback)
    const previousCart = [...cart];
    
    // 2. OPTIMISTIC UPDATE
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prevCart => {
      const existing = prevCart.find(item => item.productId === productId);
      if (existing) {
        return prevCart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { 
          id: Date.now(), // Temporary ID
          productId, 
          quantity: 1, 
          product 
        }];
      }
    });

    if (showToast) showToast("Added to cart!", "success");

    // 3. BACKGROUND SYNC
    try {
      await api.post("/cart/add", { productId });
      // On success, we fetch the real cart to replace our temporary IDs
      fetchCart();
    } catch (err) {
      // 4. ROLLBACK ON FAILURE
      setCart(previousCart);
      if (showToast) showToast("Failed to sync cart with server", "error");
    }
  }, [user, cart, products, fetchCart]);

  const value = useMemo(() => ({
    products,
    categories,
    cart,
    orders,
    loading,
    error,
    addToCart,
    refreshCart: fetchCart,
    refreshOrders: fetchOrders,
    refreshGlobalData: () => fetchGlobalData(true),
    refreshAll
  }), [products, categories, cart, orders, loading, error, addToCart, fetchCart, fetchOrders, fetchGlobalData, refreshAll]);

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
