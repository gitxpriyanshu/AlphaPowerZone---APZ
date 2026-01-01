import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

const Cart = () => {
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState(() => {
        const cached = localStorage.getItem('cached_cart');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(cartItems.length === 0);
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        try {
            const res = await api.get('/cart');
            setCartItems(res.data);
            localStorage.setItem('cached_cart', JSON.stringify(res.data));
        } catch (err) {
            console.error("Failed to fetch cart", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const updateQuantity = useCallback(async (id, newQuantity) => {
        if (newQuantity < 1) return;

        // Optimistic update
        const previousItems = [...cartItems];
        const updatedItems = cartItems.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
        localStorage.setItem('cached_cart', JSON.stringify(updatedItems));

        try {
            await api.put(`/cart/${id}`, { quantity: newQuantity });
            // Sync with server silently
            const res = await api.get('/cart');
            setCartItems(res.data);
            localStorage.setItem('cached_cart', JSON.stringify(res.data));
        } catch (err) {
            setCartItems(previousItems);
            localStorage.setItem('cached_cart', JSON.stringify(previousItems));
            showToast('Failed to update quantity', 'error');
        }
    }, [cartItems, showToast]);

    const handleRemove = useCallback(async (id) => {
        const previousItems = [...cartItems];
        const updatedItems = cartItems.filter(item => item.id !== id);
        setCartItems(updatedItems);
        localStorage.setItem('cached_cart', JSON.stringify(updatedItems));

        try {
            await api.delete(`/cart/remove/${id}`);
            showToast('Item removed from cart', 'success');
        } catch (err) {
            setCartItems(previousItems);
            localStorage.setItem('cached_cart', JSON.stringify(previousItems));
            showToast('Failed to remove item', 'error');
        }
    }, [cartItems, showToast]);

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty!', 'info');
            return;
        }
        navigate('/checkout');
    };

    const calculateTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }, [cartItems]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
                <h2 className="text-4xl font-extrabold text-gray-900 mb-10 tracking-tight">Shopping Cart</h2>

                {loading && cartItems.length === 0 ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
                    </div>
                ) : cartItems.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl shadow-xl border border-gray-100 max-w-2xl mx-auto px-6">
                        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                            <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Your cart is empty</h3>
                        <p className="text-gray-500 text-lg mb-10 max-w-md mx-auto">
                            Looks like you haven't added anything to your cart yet. Explore our premium collections and find something you'll love!
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="btn btn-primary px-10 py-4 text-lg font-bold shadow-lg shadow-primary/30 transform hover:scale-105 transition-all cursor-pointer"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Cart Items List */}
                        <div className="lg:w-2/3">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                                <ul className="divide-y divide-gray-100">
                                    {cartItems.map(item => (
                                        <li key={item.id} className="p-8 flex items-center hover:bg-gray-50/50 transition-all group">
                                            <div className="h-32 w-32 flex-shrink-0 overflow-hidden rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-md transition-shadow">
                                                <img
                                                    src={item.product.Image}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                            <div className="ml-8 flex-1 flex flex-col">
                                                <div className="flex justify-between text-xl font-bold text-gray-900 mb-1">
                                                    <h3 className="hover:text-primary cursor-pointer transition-colors leading-tight">{item.product.name}</h3>
                                                    <p className="ml-4 font-black">₹{item.product.price}</p>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">{item.product.description}</p>
                                                <div className="flex flex-1 items-end justify-between text-sm mt-auto">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-2 border border-gray-100">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="text-gray-400 hover:text-primary transition-all p-1 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-90"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <FiMinus className="w-5 h-5" />
                                                        </button>
                                                        <span className="font-bold text-gray-900 min-w-[30px] text-center text-lg">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="text-gray-400 hover:text-primary transition-all p-1 cursor-pointer transform active:scale-90"
                                                        >
                                                            <FiPlus className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(item.id)}
                                                        className="flex items-center gap-2 font-bold text-red-500 hover:text-red-600 transition-all cursor-pointer group/remove"
                                                    >
                                                        <div className="p-2 bg-red-50 rounded-full group-hover/remove:bg-red-100 transition-colors">
                                                            <FiTrash2 className="w-5 h-5" />
                                                        </div>
                                                        <span className="hidden sm:inline">Remove</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-24">
                                <h3 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Order Summary</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between text-lg text-gray-600">
                                        <span>Subtotal ({cartItems.length} items)</span>
                                        <span className="font-semibold text-gray-900">₹{calculateTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-lg text-gray-600">
                                        <span>Delivery Charges</span>
                                        <span className="font-bold text-green-600 uppercase tracking-wider text-sm bg-green-50 px-3 py-1 rounded-full">Free</span>
                                    </div>
                                    <div className="pt-6 border-t border-gray-100">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="text-xl font-bold text-gray-900">Total Amount</span>
                                            <span className="text-3xl font-black text-primary tracking-tighter">
                                                ₹{calculateTotal.toFixed(2)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            className="w-full btn btn-primary flex justify-center items-center py-5 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 transform hover:-translate-y-1 transition-all cursor-pointer"
                                        >
                                            Checkout Now
                                        </button>
                                        <div className="mt-8 flex flex-col items-center gap-4">
                                            <button
                                                onClick={() => navigate('/')}
                                                className="text-gray-500 hover:text-primary font-bold transition-all flex items-center gap-2 group cursor-pointer"
                                            >
                                                <span className="transform group-hover:-translate-x-1 transition-transform">←</span>
                                                Continue Shopping
                                            </button>
                                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Secure Checkout Guarantee
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
                }
            </div>
        </div>
    );
};

export default Cart;
