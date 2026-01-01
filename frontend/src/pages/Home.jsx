import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

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
            // Filter out "Default Category" and only show first 3
            const filteredCategories = categoriesRes.data
                .filter(cat => !cat.name.toLowerCase().includes('default'))
                .slice(0, 3);
            setCategories(filteredCategories);
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="bg-white border-b border-gray-100 py-16 mb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 mb-6 tracking-tight">
                        Welcome to APZ
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 font-light">
                        Discover the premium collection of exclusive products. Shop with confidence and style.
                    </p>
                    <a href="#products" className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:bg-black transition-all transform hover:-translate-y-1">
                        Start Shopping
                    </a>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
                {/* Categories Section */}
                <div className="mb-12">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent mb-3">
                            Shop by Category
                        </h2>
                        <p className="text-lg text-gray-600">Browse our exclusive collections</p>
                    </div>

                    <div className="flex justify-center items-center gap-8 mb-8">
                        {/* All Categories Icon Only */}
                        <button
                            onClick={() => window.scrollTo({ top: document.getElementById('products').offsetTop - 100, behavior: 'smooth' })}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transform group-hover:scale-110 transition-all duration-300">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">All</span>
                        </button>
                    </div>

                    {/* Category Cards - Only 3 */}
                    {/* Category Cards - Premium Design */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
                        {categories.map(category => (
                            <div
                                key={category.id}
                                onClick={() => navigate(`/category/${category.id}`)}
                                className="group cursor-pointer relative h-96 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                            >
                                <img
                                    src={category.Image}
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

                                <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                    <h3 className="text-4xl font-bold text-white mb-2 drop-shadow-md tracking-tight">{category.name}</h3>
                                    <div className="flex items-center justify-between mt-4 border-t border-white/20 pt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                        <span className="text-white/90 font-medium tracking-wide text-sm uppercase">Explore Collection</span>
                                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                            <svg className="w-5 h-5 text-white transform -rotate-45 group-hover:rotate-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Products Section - Clean Apple-style Grid */}
                    <div id="products" className="mb-12">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Trending Now</h2>
                            <span className="text-sm text-gray-500 bg-white border border-gray-200 shadow-sm px-5 py-2 rounded-full font-medium">
                                {products.length} Items Available
                            </span>
                        </div>

                        {loading ? (
                            <div className="text-center py-32">
                                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
                                <p className="text-gray-500 text-lg font-medium">Curating your collection...</p>
                            </div>
                        ) : (
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
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Home;
