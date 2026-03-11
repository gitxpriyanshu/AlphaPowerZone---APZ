import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FiArrowRight,
  FiSearch,
  FiShoppingBag,
  FiStar,
  FiTrendingUp,
  FiPackage,
  FiGrid,
} from "react-icons/fi";
import { useToast } from "../context/ToastContext";

const Home = () => {
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState(() => {
    const cached = localStorage.getItem("cached_products");
    return cached ? JSON.parse(cached) : [];
  });
  const [categories, setCategories] = useState(() => {
    const cached = localStorage.getItem("cached_categories");
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(products.length === 0);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data);
      localStorage.setItem("cached_products", JSON.stringify(productsRes.data));

      const filteredCategories = categoriesRes.data.filter(
        (cat) => !cat.name.toLowerCase().includes("default")
      );
      setCategories(filteredCategories);
      localStorage.setItem(
        "cached_categories",
        JSON.stringify(filteredCategories)
      );
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const prefetchCategory = useCallback(async (catId) => {
    const cacheKey = `cached_cat_${catId}`;
    if (localStorage.getItem(cacheKey)) return;

    try {
      const [categoryRes, productsRes] = await Promise.all([
        api.get(`/categories/${catId}`),
        api.get(`/products`),
      ]);
      const catProds = productsRes.data.filter(
        (p) => p.categoryId === parseInt(catId)
      );
      localStorage.setItem(
        `cached_cat_${catId}`,
        JSON.stringify(categoryRes.data)
      );
      localStorage.setItem(
        `cached_cat_prods_${catId}`,
        JSON.stringify(catProds)
      );
    } catch (err) {
      // Silently fail prefetch
    }
  }, []);

  const addToCart = useCallback(
    async (productId) => {
      if (!user || user.role !== "user") {
        showToast("Please login as User to add items to cart", "error");
        return;
      }

      try {
        await api.post("/cart/add", { productId });
        showToast("Product added to cart!", "success");
      } catch (err) {
        showToast("Failed to add to cart", "error");
      }
    },
    [user, showToast]
  );

  // useMemo for heavy filter operations
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFDFF] selection:bg-primary/30 font-sans">
      <Navbar />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-8">
        {/* Immersive Storefront Header */}
        <div className="relative rounded-[3rem] overflow-hidden bg-gray-900 mb-12 group">
          <div className="absolute inset-0">
            <img
              src="/images/home_hero.png"
              alt="Store Hero"
              className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[3s]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          </div>

          <div className="relative z-10 p-12 lg:p-24 flex flex-col justify-end min-h-[500px]">
            <div className="max-w-3xl">
              {user?.name && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in-up">
                  <FiTrendingUp className="text-primary" /> Welcome back,{" "}
                  {user.name}
                </div>
              )}
              <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-none tracking-tight">
                DISCOVER YOUR <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-primary">
                  NEXT LEVEL.
                </span>
              </h1>

              {/* Pro Search Bar */}
              <div className="relative max-w-xl group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                  <FiSearch className="text-white/50 group-focus-within:text-primary transition-colors w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search premium gear, apparel, supplements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-16 pr-6 py-5 text-white placeholder-white/40 focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all text-lg"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar Filters & Account */}
          <aside className="lg:col-span-1 space-y-10">
            <div className="p-8 rounded-3xl bg-white shadow-xl border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <FiGrid className="text-primary" /> CATEGORIES
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setSearchQuery("")}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${
                    !searchQuery
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  All Products
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => navigate(`/category/${cat.id}`)}
                    onMouseEnter={() => prefetchCategory(cat.id)}
                    className="w-full text-left px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-all font-bold"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-black text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full -mr-12 -mt-12 blur-2xl"></div>
              <FiPackage className="w-12 h-12 mb-6 text-primary" />
              <h4 className="text-2xl font-black mb-2 leading-tight">
                LIMITED DROP <br />
                ARRIVING SOON
              </h4>
              <p className="text-gray-400 text-sm mb-6">
                Gain early access and member-only rewards by joining our VIP
                list.
              </p>
              <button className="w-full py-3 bg-white text-black rounded-xl font-bold hover:bg-primary hover:text-white transition-all uppercase tracking-widest text-xs">
                Join Now
              </button>
            </div>
          </aside>

          {/* Product Master Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                Featured Arrivals
              </h2>
              <div className="flex gap-4">
                <span className="text-sm font-bold text-gray-400 flex items-center gap-2">
                  <FiShoppingBag /> {filteredProducts.length} Items Found
                </span>
              </div>
            </div>

            {loading && products.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square rounded-[2rem] mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative flex flex-col bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100/50"
                  >
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-6">
                      <img
                        src={product.Image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-gray-900 shadow-sm">
                        NEW
                      </div>

                      {/* Action Hover */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                        <button
                          onClick={() => addToCart(product.id)}
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                        >
                          <FiShoppingBag className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            navigate(`/category/${product.categoryId}`)
                          }
                          className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black hover:bg-primary hover:text-white transition-all transform hover:scale-110"
                        >
                          <FiArrowRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="px-2 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-black text-gray-900 uppercase truncate pr-4">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-primary">
                          <FiStar className="fill-current w-3 h-3" />
                          <span className="text-xs font-black">4.9</span>
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                            Price
                          </p>
                          <p className="text-2xl font-black text-gray-900 tracking-tighter leading-none">
                            ₹{product.price}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                          {product.category?.name || "Item"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
                <FiSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-400">
                  No products found for "{searchQuery}"
                </h3>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style
        dangerouslySetInnerHTML={{
          __html: `
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `,
        }}
      />
    </div>
  );
};

export default Home;
