import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const MyOrders = () => {
    const [orders, setOrders] = useState(() => {
        const cached = localStorage.getItem('user_orders');
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(orders.length === 0);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'user') {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [user, navigate]);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders');
            setOrders(res.data);
            localStorage.setItem('user_orders', JSON.stringify(res.data));
        } catch (err) {
            console.error("Failed to fetch orders", err);
        } finally {
            setLoading(false);
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
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
                    <p className="text-gray-600">Track and manage your order history</p>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                        <svg className="mx-auto h-20 w-20 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
                        <button onClick={() => navigate('/')} className="btn btn-primary">
                            Browse Products
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="mt-4 md:mt-0 flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="text-2xl font-bold text-primary">₹{order.total.toFixed(2)}</p>
                                            </div>
                                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                Cash on Delivery
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-6">
                                    <h4 className="font-semibold text-gray-900 mb-4">Order Items ({order.items.length})</h4>
                                    <div className="space-y-4">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                                    <img
                                                        src={item.product.Image}
                                                        alt={item.product.name}
                                                        className="h-full w-full object-cover object-center"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-semibold text-gray-900">{item.product.name}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">Quantity: {item.quantity}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-600">Price</p>
                                                    <p className="font-bold text-gray-900">₹{item.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Order Summary */}
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-sm font-medium">Order Status: Confirmed</span>
                                        </div>
                                        <button className="text-primary hover:text-indigo-700 font-medium text-sm transition-colors">
                                            Track Order →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default MyOrders;
