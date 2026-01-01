import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiArrowRight, FiCheckCircle, FiShield, FiTruck, FiShoppingBag, FiStar } from 'react-icons/fi';

const Landing = () => {
    // Optimization: Initialize from localStorage for instant feel
    const [products, setProducts] = useState(() => {
        const cached = localStorage.getItem('cached_products');
        return cached ? JSON.parse(cached) : [];
    });
    const [categories, setCategories] = useState(() => {
        const cached = localStorage.getItem('cached_categories');
        return cached ? JSON.parse(cached) : [];
    });
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(products.length === 0);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && user) {
            navigate('/home');
        }
    }, [user, authLoading, navigate]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data);
            // Save to cache
            localStorage.setItem('cached_products', JSON.stringify(productsRes.data));

            const filteredCategories = categoriesRes.data
                .filter(cat => !cat.name.toLowerCase().includes('default'))
                .slice(0, 3);
            setCategories(filteredCategories);
            localStorage.setItem('cached_categories', JSON.stringify(filteredCategories));
        } catch (err) {
            console.error("Failed to fetch data", err);
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
            alert("Added to cart!");
        } catch (err) {
            alert("Failed to add to cart");
        }
    };

    const buyNow = async (productId) => {
        if (!user || user.role !== 'user') {
            alert("Please login as User to purchase");
            window.location.href = '/login';
            return;
        }
        try {
            await api.post('/cart/add', { productId });
            window.location.href = '/cart';
        } catch (err) {
            alert("Failed to proceed to checkout");
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans overflow-x-hidden">
            <Navbar />

            {/* Cinematic Hero Section */}
            <div className="relative h-[90vh] min-h-[600px] w-full flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/images/hero_banner.png"
                        alt="Hero Banner"
                        className="w-full h-full object-cover scale-105 animate-slow-zoom"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#fafafa] via-transparent to-transparent opacity-60"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium mb-6 animate-fade-in-up">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            New Collection 2026 is Live
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-none animate-fade-in-up delay-100">
                            DRIVEN BY <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">EXCELLENCE.</span>
                        </h1>
                        <p className="text-xl text-gray-300 mb-10 max-w-lg leading-relaxed animate-fade-in-up delay-200">
                            Experience the pinnacle of fitness performance with APZ's exclusive gear. Engineered for those who never settle.
                        </p>
                        <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
                            <button onClick={() => navigate('/home')} className="group bg-primary hover:bg-indigo-700 text-white px-10 py-4 rounded-full font-bold shadow-2xl transition-all transform hover:-translate-y-1 flex items-center gap-2">
                                Enter Store
                                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => navigate('/home')} className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20 px-10 py-4 rounded-full font-bold transition-all transform hover:-translate-y-1">
                                View Collections
                            </button>
                        </div>
                    </div>
                </div>

                {/* Vertical Text Scroll Indicator */}
                <div className="absolute right-10 bottom-10 flex flex-col items-center gap-4 animate-bounce opacity-50">
                    <span className="text-white text-xs font-bold tracking-widest uppercase [writing-mode:vertical-rl]">Scroll</span>
                    <div className="w-px h-12 bg-white/50"></div>
                </div>
            </div>

            {/* Features Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                    <div className="p-10 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <FiTruck className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Fast Delivery</h3>
                            <p className="text-sm text-gray-500">Free shipping on orders above ₹999</p>
                        </div>
                    </div>
                    <div className="p-10 flex items-center gap-6 hover:bg-gray-50 transition-colors border-x border-gray-100">
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <FiShield className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Secure Payment</h3>
                            <p className="text-sm text-gray-500">100% secure payment processing</p>
                        </div>
                    </div>
                    <div className="p-10 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                            <FiCheckCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg">Premium Quality</h3>
                            <p className="text-sm text-gray-500">Only the best brands for you</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex-1">
                {/* Categories Section */}
                <div id="categories" className="mb-24">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="max-w-xl">
                            <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                                BROWSE OUR <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">COLLECTIONS</span>
                            </h2>
                            <p className="text-gray-500 text-lg">Hand-picked categories to elevate your workout experience.</p>
                        </div>
                        <button onClick={() => navigate('/home')} className="group flex items-center gap-2 font-bold text-gray-900 hover:text-primary transition-colors">
                            View All Categories
                            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {loading && categories.length === 0 ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="h-[500px] rounded-[2.5rem] bg-gray-200 animate-pulse"></div>
                            ))
                        ) : (
                            categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    onClick={() => navigate(`/category/${category.id}`)}
                                    className={`group cursor-pointer relative h-[500px] rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-2 ${index === 1 ? 'md:-translate-y-6' : ''}`}
                                >
                                    <img
                                        src={category.Image}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>

                                    <div className="absolute bottom-0 left-0 right-0 p-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-4xl font-black text-white mb-2 tracking-tight uppercase">{category.name}</h3>
                                        <div className="flex items-center justify-between mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30 text-white text-xs font-bold tracking-widest uppercase">
                                                Shop Now
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Trending Products */}
                <div id="products" className="mb-24">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-tight mb-2">TRENDING NOW</h2>
                            <div className="w-24 h-2 bg-primary rounded-full"></div>
                        </div>
                    </div>

                    {loading && products.length === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="bg-gray-200 aspect-[3/4] rounded-3xl mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                            {products.map(product => (
                                <div key={product.id} className="group flex flex-col">
                                    <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gray-100 mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-500">
                                        <img
                                            src={product.Image}
                                            alt={product.name}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />

                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase text-gray-900 shadow-sm">
                                            Premium
                                        </div>
                                    </div>

                                    <div className="px-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 truncate pr-4 uppercase">{product.name}</h3>
                                            <div className="flex items-center gap-1 text-primary">
                                                <FiStar className="fill-current w-4 h-4" />
                                                <span className="text-sm font-black">4.9</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-black text-gray-900 tracking-tighter">₹{product.price}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Newsletter / CTA */}
            <div className="bg-gray-900 py-24 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/10 -skew-x-12 transform translate-x-1/2"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tight">Join the Alpha Zone</h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Get exclusive updates on new drops and membership-only offers.</p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                        <input
                            type="email"
                            placeholder="your@email.com"
                            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                        <button className="bg-primary hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl transition-all uppercase tracking-widest text-sm">
                            Subscribe
                        </button>
                    </div>
                </div>
            </div>

            <Footer />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slow-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.1); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 20s linear infinite alternate;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
            ` }} />
        </div>
    );
};

export default Landing;

