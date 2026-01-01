import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CategoryPage = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const [category, setCategory] = useState(() => {
        const cached = localStorage.getItem(`cached_cat_${categoryId}`);
        return cached ? JSON.parse(cached) : null;
    });
    const [products, setProducts] = useState(() => {
        const cached = localStorage.getItem(`cached_cat_prods_${categoryId}`);
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(!category || products.length === 0);
    const { user } = useAuth();

    useEffect(() => {
        fetchCategoryData();
    }, [categoryId]);

    const fetchCategoryData = async () => {
        try {
            const [categoryRes, productsRes] = await Promise.all([
                api.get(`/categories/${categoryId}`),
                api.get(`/products`)
            ]);

            setCategory(categoryRes.data);
            const catProds = productsRes.data.filter(p => p.categoryId === parseInt(categoryId));
            setProducts(catProds);

            // Cache results
            localStorage.setItem(`cached_cat_${categoryId}`, JSON.stringify(categoryRes.data));
            localStorage.setItem(`cached_cat_prods_${categoryId}`, JSON.stringify(catProds));
        } catch (err) {
            console.error("Failed to fetch category data", err);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId) => {
        if (!user || user.role !== 'user') {
            alert("Please login as User to add items to cart");
            return;
        }
        try {
            await api.post('/cart/add', { productId });
            // Successfully added (non-blocking)
        } catch (err) {
            alert("Failed to add to cart");
        }
    };

    const buyNow = async (productId) => {
        if (!user || user.role !== 'user') {
            alert("Please login as User to purchase");
            navigate('/login');
            return;
        }
        try {
            await api.post('/cart/add', { productId });
            navigate('/cart');
        } catch (err) {
            alert("Failed to proceed to checkout");
        }
    };

    const Skeletons = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-white rounded-3xl p-4 h-[400px]">
                    <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1">
                {/* Category Hero Section */}
                <div className="relative h-80 bg-gradient-to-br from-primary via-purple-600 to-pink-500 overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={category?.Image}
                            alt={category?.name}
                            className="w-full h-full object-cover opacity-20"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-12">
                        <button
                            onClick={() => navigate('/')}
                            className="text-white/90 hover:text-white font-medium flex items-center gap-2 mb-6 transition-colors group"
                        >
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </button>
                        <div>
                            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-2xl">{category?.name}</h1>
                            <div className="flex items-center gap-4 text-white/90">
                                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    {products.length} {products.length === 1 ? 'Product' : 'Products'}
                                </span>
                                <span className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Premium Quality
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {loading && products.length === 0 ? (
                        <Skeletons />
                    ) : products.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
                            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Available</h3>
                            <p className="text-gray-500 mb-8">Check back soon for new arrivals in this category</p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn btn-primary px-8"
                            >
                                Browse All Products
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-bold text-gray-900">All Products</h2>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500">{products.length} items</span>
                                    <select className="text-sm border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <option>Sort by: Featured</option>
                                        <option>Price: Low to High</option>
                                        <option>Price: High to Low</option>
                                        <option>Newest First</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {products.map(product => (
                                    <div key={product.id} className="group bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100">
                                        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50">
                                            <img
                                                src={product.Image}
                                                alt={product.name}
                                                className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                                            />

                                            {/* Actions Overlay */}
                                            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent pt-12">
                                                {user?.role !== 'owner' && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); addToCart(product.id); }}
                                                            className="flex-1 bg-white hover:bg-gray-100 text-gray-900 py-3 rounded-xl font-bold text-sm shadow-lg transition-colors active:scale-95"
                                                        >
                                                            Add to Cart
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); buyNow(product.id); }}
                                                            className="bg-primary hover:bg-indigo-700 text-white p-3 rounded-xl shadow-lg transition-colors active:scale-95"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-bold text-gray-900 truncate flex-1 pr-2">{product.name}</h3>
                                                <p className="text-lg font-bold text-primary">₹{product.price}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{product.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default CategoryPage;
