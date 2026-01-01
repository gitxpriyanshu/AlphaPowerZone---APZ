import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Checkout = () => {
    const { showToast } = useToast();
    const [cartItems, setCartItems] = useState(() => {
        const cached = localStorage.getItem('cached_cart');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(cartItems.length === 0);
    const [fullName, setFullName] = useState('');
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [phone, setPhone] = useState('');
    const [processing, setProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchCart = useCallback(async () => {
        try {
            const res = await api.get('/cart');
            if (res.data.length === 0 && !localStorage.getItem('cached_cart')) {
                showToast('Your cart is empty!', 'info');
                navigate('/cart');
                return;
            }
            setCartItems(res.data);
            localStorage.setItem('cached_cart', JSON.stringify(res.data));
        } catch (err) {
            console.error("Failed to fetch cart", err);
        } finally {
            setLoading(false);
        }
    }, [navigate, showToast]);

    useEffect(() => {
        if (!user || user.role !== 'user') {
            navigate('/login');
            return;
        }
        setFullName(user.name || '');
        fetchCart();
    }, [user, navigate, fetchCart]);

    const calculateTotal = useMemo(() => {
        return cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    }, [cartItems]);

    const handleConfirmOrder = async () => {
        if (!fullName.trim()) {
            showToast('Please enter your full name', 'error');
            return;
        }
        if (!addressLine1.trim() || !city.trim() || !state.trim() || !pincode.trim()) {
            showToast('Please fill all address fields', 'error');
            return;
        }
        if (!phone.trim()) {
            showToast('Please enter phone number', 'error');
            return;
        }
        if (pincode.length !== 6) {
            showToast('Pincode must be 6 digits', 'error');
            return;
        }

        const fullAddress = `${addressLine1}, ${addressLine2 ? addressLine2 + ', ' : ''}${city}, ${state} - ${pincode}`;

        setProcessing(true);
        try {
            await api.post('/orders', {
                deliveryAddress: fullAddress,
                phone
            });
            showToast('Order placed successfully!', 'success');
            setShowSuccessModal(true);
        } catch (err) {
            showToast('Failed to place order', 'error');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div>
                <Navbar />
                <div className="flex justify-center items-center h-screen bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
                    <p className="text-gray-600">Review your order and confirm delivery details</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Order Items */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items ({cartItems.length})</h2>
                            <div className="space-y-4">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <img
                                            src={item.product.Image}
                                            alt={item.product.name}
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">₹{item.product.price}</p>
                                            <p className="text-sm text-gray-600">Total: ₹{(item.product.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Details Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Enter your full name"
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Enter 10 digit phone number"
                                        className="input-field"
                                        maxLength="10"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Line 1 * (House No, Building, Street)
                                    </label>
                                    <input
                                        type="text"
                                        value={addressLine1}
                                        onChange={(e) => setAddressLine1(e.target.value)}
                                        placeholder="e.g., 123, ABC Apartment, MG Road"
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address Line 2 (Landmark)
                                    </label>
                                    <input
                                        type="text"
                                        value={addressLine2}
                                        onChange={(e) => setAddressLine2(e.target.value)}
                                        placeholder="e.g., Near City Mall (Optional)"
                                        className="input-field"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            City *
                                        </label>
                                        <input
                                            type="text"
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="e.g., Mumbai"
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            State *
                                        </label>
                                        <input
                                            type="text"
                                            value={state}
                                            onChange={(e) => setState(e.target.value)}
                                            placeholder="e.g., Maharashtra"
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pincode *
                                    </label>
                                    <input
                                        type="text"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        placeholder="6 digit pincode"
                                        className="input-field"
                                        maxLength="6"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal ({cartItems.length} items)</span>
                                    <span>₹{calculateTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Charges</span>
                                    <span className="text-green-600 font-medium">FREE</span>
                                </div>
                                <div className="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span className="text-primary">₹{calculateTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center gap-2 text-green-700">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-semibold text-sm">Cash on Delivery</span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">Pay when you receive your order</p>
                            </div>

                            <button
                                onClick={handleConfirmOrder}
                                disabled={processing}
                                className="w-full btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Processing...' : 'Confirm Order'}
                            </button>

                            <button
                                onClick={() => navigate('/cart')}
                                className="w-full mt-3 btn bg-gray-100 text-gray-700 hover:bg-gray-200 py-2"
                            >
                                Back to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center transform transition-all animate-bounce-in">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h3>
                        <p className="text-gray-600 mb-6">
                            Your order has been placed successfully. You will receive your items soon.
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-green-800 font-semibold">Cash on Delivery</p>
                            <p className="text-xs text-green-600 mt-1">Pay ₹{calculateTotal.toFixed(2)} when you receive your order</p>
                        </div>
                        <button
                            onClick={() => navigate('/orders')}
                            className="w-full btn btn-primary py-3 text-lg mb-3"
                        >
                            Go to My Orders
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full btn bg-gray-100 text-gray-700 hover:bg-gray-200 py-2"
                        >
                            Continue Shopping
                        </button>
                    </div>
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Checkout;
