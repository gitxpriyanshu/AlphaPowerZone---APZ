import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { FiShoppingCart } from 'react-icons/fi';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [cartCount, setCartCount] = useState(0);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user?.role === 'user') {
            fetchCartCount();
        }
    }, [user]);

    // Speed Optimization: Truly instant render
    useEffect(() => {
        setLoading(false);
    }, [window.location.pathname]);

    const fetchCartCount = async () => {
        try {
            const res = await api.get('/cart');
            setCartCount(res.data.length);
        } catch (err) {
            console.error('Failed to fetch cart count', err);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">A</span>
                        </div>
                        <Link to={user ? "/home" : "/"} className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            APZ
                        </Link>
                    </div>
                    <div className="hidden md:flex space-x-8 items-center">
                        <Link to={user ? "/home" : "/"} className="text-gray-700 hover:text-primary font-medium transition-colors">Home</Link>

                        {!user ? (
                            <>
                                <Link to="/login" className="text-gray-700 hover:text-primary font-medium transition-colors">Login</Link>
                                <Link to="/register" className="bg-primary text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg transfrom hover:-translate-y-0.5">Register</Link>
                            </>
                        ) : (
                            <>
                                {user.role === 'user' && (
                                    <>
                                        <Link to="/user-dashboard" className="text-gray-700 hover:text-primary font-medium transition-colors">Dashboard</Link>
                                        <Link to="/orders" className="text-gray-700 hover:text-primary font-medium transition-colors">My Orders</Link>
                                        <Link to="/cart" className="text-gray-700 hover:text-primary font-medium transition-colors relative flex items-center gap-1">
                                            <FiShoppingCart className="w-5 h-5" />
                                            Cart
                                            {cartCount > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                                    {cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    </>
                                )}
                                {user.role === 'owner' && <Link to="/dashboard" className="text-gray-700 hover:text-primary font-medium transition-colors">Dashboard</Link>}
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-semibold text-gray-800">{user.name}</span>
                                    <button onClick={handleLogout} className="text-red-500 hover:text-red-700 font-medium text-sm border border-red-200 hover:border-red-400 px-3 py-1 rounded-full transition-all">
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    {/* Mobile menu button (Hamburger) - Simplified for now */}
                    <div className="md:hidden flex items-center">
                        {/* Placeholder for mobile menu toggle */}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
