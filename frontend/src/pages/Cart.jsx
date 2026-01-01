import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { useToast } from '../context/ToastContext';

const Cart = () => {
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        try {
            const res = await api.get('/cart');
            setCartItems(res.data);
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
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity: newQuantity } : item
        ));

        try {
            await api.put(`/cart/${id}`, { quantity: newQuantity });
            // Sync with server silently
            const res = await api.get('/cart');
            setCartItems(res.data);
        } catch (err) {
            setCartItems(previousItems);
            showToast('Failed to update quantity', 'error');
        }
    }, [cartItems, showToast]);

    const handleRemove = useCallback(async (id) => {
        const previousItems = [...cartItems];
        setCartItems(prev => prev.filter(item => item.id !== id));

        try {
            await api.delete(`/cart/remove/${id}`);
            showToast('Item removed from cart', 'success');
        } catch (err) {
            setCartItems(previousItems);
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

    if (loading) return (
        <div>
            <Navbar />
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h2>
                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 text-lg">Your cart is currently empty.</p>
                        <a href="/" className="mt-6 inline-block btn btn-primary">Start Shopping</a>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items List */}
                        <div className="lg:w-2/3">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <ul className="divide-y divide-gray-200">
                                    {cartItems.map(item => (
                                        <li key={item.id} className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                <img
                                                    src={item.product.Image}
                                                    alt={item.product.name}
                                                    className="h-full w-full object-cover object-center"
                                                />
                                            </div>
                                            <div className="ml-6 flex-1 flex flex-col">
                                                <div className="flex justify-between text-base font-medium text-gray-900">
                                                    <h3>{item.product.name}</h3>
                                                    <p className="ml-4">₹{item.product.price}</p>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-500 line-clamp-1">{item.product.description}</p>
                                                <div className="flex flex-1 items-end justify-between text-sm mt-3">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-2 py-1">
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                            className="text-gray-600 hover:text-primary transition-colors p-1"
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <FiMinus className="w-4 h-4" />
                                                        </button>
                                                        <span className="font-semibold text-gray-900 min-w-[30px] text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                            className="text-gray-600 hover:text-primary transition-colors p-1"
                                                        >
                                                            <FiPlus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(item.id)}
                                                        className="flex items-center gap-1 font-medium text-red-600 hover:text-red-500 transition-colors"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                        Remove
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
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
                                <div className="flow-root">
                                    <dl className="-my-4 divide-y divide-gray-200">
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base text-gray-600">Subtotal</dt>
                                            <dd className="text-base font-medium text-gray-900">
                                                ₹{calculateTotal.toFixed(2)}
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base text-gray-600">Shipping</dt>
                                            <dd className="text-base font-medium text-gray-900">Free</dd>
                                        </div>
                                        <div className="flex items-center justify-between py-4">
                                            <dt className="text-base font-bold text-gray-900">Total</dt>
                                            <dd className="text-base font-bold text-primary">
                                                ₹{calculateTotal.toFixed(2)}
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={handleCheckout}
                                        className="w-full btn btn-primary flex justify-center items-center py-3 text-base"
                                    >
                                        Checkout
                                    </button>
                                </div>
                                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                                    <p>
                                        or{' '}
                                        <a href="/" className="font-medium text-primary hover:text-indigo-500">
                                            Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
