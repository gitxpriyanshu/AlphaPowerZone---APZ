import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBox, 
  FiLayers, 
  FiTrendingUp, 
  FiPlus, 
  FiSearch, 
  FiFilter,
  FiLogOut,
  FiMenu,
  FiX,
  FiGrid,
  FiSettings,
  FiShoppingBag,
  FiUsers,
  FiArrowRight,
  FiActivity,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiMapPin,
  FiAward,
  FiImage,
  FiType,
  FiTag,
  FiInfo,
  FiBookOpen,
  FiUpload,
  FiLink,
  FiPercent,
  FiShoppingCart,
  FiRefreshCw,
  FiPackage
} from 'react-icons/fi';
import { FaIndianRupeeSign } from "react-icons/fa6";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../config/axiosInstance';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { cn } from '../utils/cn';

const OwnerDashboard = () => {
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const { logout } = useAuth();
  const { refreshGlobalData } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [orderNotifications, setOrderNotifications] = useState(true);
  const [orderSort, setOrderSort] = useState('newest');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [imageMethod, setImageMethod] = useState<'url' | 'upload'>('url');
  const fileInputRef = useRef<HTMLInputElement>(null);

  interface NewProductState {
    name: string;
    description: string;
    mrp: string;
    discount: string;
    sellingPrice: string;
    wholesalePrice: string;
    stock: string;
    categoryId: string;
    sku: string;
    imageUrl: string;
  }

  const [newProduct, setNewProduct] = useState<NewProductState>({
    name: '',
    description: '',
    mrp: '',
    discount: '',
    sellingPrice: '',
    wholesalePrice: '',
    stock: '',
    categoryId: '',
    sku: '',
    imageUrl: ''
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'customers') fetchCustomers();
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'categories') fetchCategories();
  }, [activeTab]);

  useEffect(() => {
    if (categories.length > 0 && !newProduct.categoryId) {
      setNewProduct(prev => ({ ...prev, categoryId: categories[0].id }));
    }
  }, [categories]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [overviewRes, productsRes, categoriesRes, revenueRes] = await Promise.all([
        axiosInstance.get('/analytics/overview'),
        axiosInstance.get('/products?limit=10'),
        axiosInstance.get('/products/categories'),
        axiosInstance.get('/analytics/revenue?period=7d')
      ]);
      
      const m = overviewRes.data.data;
      setMetrics(m);
      setProducts(productsRes.data.data.products || []);
      setCategories(categoriesRes.data.data);
      
      // Map revenue data for chart
      const chartPoints = revenueRes.data.data.map((point: any) => ({
        name: new Date(point.date).toLocaleDateString('en-IN', { weekday: 'short' }).toUpperCase(),
        value: point.revenue,
        fullDate: point.date
      }));
      setRevenueData(chartPoints);
    } catch (err) {
      toast.error('Tactical Data Retrieval Failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axiosInstance.get('/products?limit=50');
      setProducts(res.data.data.products || []);
    } catch (err) {
      console.error("Products fetch error:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/products/categories');
      setCategories(res.data.data);
      if (res.data.data.length > 0 && !newProduct.categoryId) {
        setNewProduct(prev => ({ ...prev, categoryId: res.data.data[0].id }));
      }
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await axiosInstance.get('/analytics/customers');
      setCustomers(res.data.data);
    } catch (err) {
      console.error("Customer fetch error:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/analytics/all-orders');
      setOrders(res.data.data);
      // If an order is selected, update it in the selectedOrder state too
      if (selectedOrder) {
        const updated = res.data.data.find((o: any) => o.id === selectedOrder.id);
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error("Order fetch error:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    const loadId = toast.loading('Updating Operational Status...');
    try {
      await axiosInstance.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success('Status Synchronized', { id: loadId });
      fetchOrders();
    } catch (err) {
      toast.error('Protocol Error: Status Update Failed', { id: loadId });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'category') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') setNewProduct({ ...newProduct, imageUrl: reader.result as string });
        else setNewCategory({ ...newCategory, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePriceLogic = (field: string, value: string) => {
    const mrp = field === 'mrp' ? parseFloat(value) : parseFloat(newProduct.mrp);
    const disc = field === 'discount' ? parseFloat(value) : parseFloat(newProduct.discount);
    const sell = field === 'sellingPrice' ? parseFloat(value) : parseFloat(newProduct.sellingPrice);

    let updated = { ...newProduct, [field]: value };

    if (!isNaN(mrp)) {
      if (field === 'mrp' || field === 'discount') {
        if (!isNaN(disc)) {
          const calculatedSell = mrp - (mrp * (disc / 100));
          updated.sellingPrice = calculatedSell.toFixed(0);
        }
      } else if (field === 'sellingPrice') {
        if (!isNaN(sell) && mrp > 0) {
          const calculatedDisc = ((mrp - sell) / mrp) * 100;
          updated.discount = calculatedDisc.toFixed(1);
        }
      }
    }
    setNewProduct(updated);
  };

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const handleEditClick = (product: any) => {
    setNewProduct({
      name: product.name,
      description: product.description,
      mrp: product.comparePrice.toString(),
      discount: product.discount?.toString() || '0',
      sellingPrice: product.price.toString(),
      wholesalePrice: product.wholesalePrice?.toString() || '0',
      stock: product.stock.toString(),
      categoryId: product.categoryId,
      sku: product.sku || '',
      imageUrl: product.images[0] || ''
    });
    setEditId(product.id);
    setIsEditing(true);
    setIsAddProductModalOpen(true);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadId = toast.loading(isEditing ? 'Updating Inventory Record...' : 'Synchronizing Product Data...');
    try {
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.sellingPrice),
        images: [newProduct.imageUrl || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000']
      };

      if (isEditing && editId) {
        await axiosInstance.put(`/products/${editId}`, payload);
        toast.success('Inventory Updated Successfully', { id: loadId });
      } else {
        await axiosInstance.post('/products', payload);
        toast.success('Product Deployed to Inventory', { id: loadId });
      }

      setIsAddProductModalOpen(false);
      setIsEditing(false);
      setEditId(null);
      fetchProducts();
      fetchInitialData();
      setNewProduct({ 
        name: '', 
        description: '', 
        mrp: '', 
        discount: '', 
        sellingPrice: '', 
        wholesalePrice: '',
        stock: '', 
        categoryId: categories[0]?.id || '', 
        sku: '', 
        imageUrl: '' 
      });
    } catch (err) {
      toast.error(isEditing ? 'Update Failed: Verify System Logs' : 'Deployment Failed: Verify System Logs', { id: loadId });
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadId = toast.loading('Registering Category Node...');
    try {
      await axiosInstance.post('/products/categories', newCategory);
      toast.success('Category Operational', { id: loadId });
      setIsAddCategoryModalOpen(false);
      fetchCategories();
      setNewCategory({ name: '', description: '', image: '' });
    } catch (err) {
      toast.error('Protocol Error: Category Registration Failed', { id: loadId });
    }
  };

  const handleLogout = async () => { await logout(); navigate('/owner/login'); };

  if (loading && !metrics) return (<div className="h-screen w-full flex items-center justify-center bg-brand-background"><Spinner size="lg" /></div>);

  const stats = [
    { id: 1, label: 'Total Products', value: metrics?.totalProducts || '0', icon: FiBox, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 2, label: 'Active Users', value: metrics?.totalUsers || '0', icon: FiUsers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { id: 3, label: 'Taxonomy Nodes', value: categories.length.toString(), icon: FiLayers, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
    { id: 4, label: 'Fulfillment Queue', value: orders.filter(o => o.status === 'PENDING').length.toString(), icon: FiClock, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { id: 5, label: 'Successful Missions', value: orders.filter(o => o.status === 'DELIVERED').length.toString(), icon: FiCheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 6, label: 'Total Revenue', value: `₹${(metrics?.totalRevenue || 0).toLocaleString()}`, icon: FaIndianRupeeSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 8, label: 'Total Profit', value: `₹${(metrics?.totalProfit || 0).toLocaleString()}`, icon: FiActivity, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { id: 7, label: 'Total Orders', value: metrics?.totalOrders || '0', icon: FiShoppingBag, color: 'text-brand-accent', bg: 'bg-brand-accent/10' },
  ];

  return (
    <div className="min-h-screen bg-brand-background text-brand-text-primary flex font-sans selection:bg-brand-accent selection:text-brand-background">
      <motion.aside initial={false} animate={{ width: isSidebarOpen ? '280px' : '80px' }} className="fixed left-0 top-0 h-full bg-brand-surface-alt/50 backdrop-blur-2xl border-r border-brand-border z-50 overflow-hidden hidden md:block">
        <div className="flex flex-col h-full py-8">
          <div className="px-6 mb-12 flex items-center gap-4"><div className="w-10 h-10 bg-brand-accent rounded-brand-lg flex items-center justify-center shadow-brand-lg shadow-brand-accent/20"><span className="font-black italic text-brand-background text-xl">APZ</span></div>{isSidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-black italic uppercase tracking-tighter text-xl">Owner Portal</motion.span>}</div>
          <nav className="flex-1 px-4 space-y-2">{[{ id: 'overview', label: 'Overview', icon: FiGrid }, { id: 'products', label: 'Products', icon: FiBox }, { id: 'categories', label: 'Categories', icon: FiLayers }, { id: 'orders', label: 'Orders', icon: FiShoppingBag }, { id: 'customers', label: 'Customers', icon: FiUsers }, { id: 'settings', label: 'Settings', icon: FiSettings }].map((item) => (<button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-brand-xl transition-all duration-300 ${activeTab === item.id ? 'bg-brand-accent text-brand-background font-black shadow-brand-lg shadow-brand-accent/10' : 'text-brand-text-muted hover:bg-brand-surface-alt hover:text-brand-text-primary'}`}><item.icon className="w-5 h-5 flex-shrink-0" />{isSidebarOpen && <span className="text-xs uppercase tracking-widest font-black">{item.label}</span>}</button>))} </nav>
          <div className="px-4 pt-4 border-t border-brand-border"><button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3.5 rounded-brand-xl text-brand-error hover:bg-brand-error/10 transition-all duration-300"><FiLogOut className="w-5 h-5" />{isSidebarOpen && <span className="text-xs uppercase tracking-widest font-black">Log Out</span>}</button></div>
        </div>
      </motion.aside>

      <main className="flex-1 transition-all duration-300 min-h-screen pb-20" style={{ marginLeft: isSidebarOpen ? '280px' : '80px' }}>
        <header className="sticky top-0 z-40 w-full h-20 bg-brand-background/80 backdrop-blur-xl border-b border-brand-border px-8 flex items-center justify-between">
          <div><h2 className="text-2xl font-black italic uppercase tracking-tighter">{activeTab === 'overview' ? 'Command Center' : activeTab.toUpperCase()}</h2><p className="text-[10px] uppercase tracking-[0.3em] text-brand-text-muted font-black">System Administrator Access • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p></div>
          <div className="flex items-center gap-6">
            <div className="relative hidden sm:block">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted w-4 h-4" />
              <input 
                type="text" 
                placeholder="GLOBAL SEARCH..." 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                className="bg-brand-surface-alt/50 border border-brand-border rounded-full py-2.5 pl-12 pr-6 text-[10px] font-black uppercase tracking-widest focus:border-brand-accent outline-none w-64 transition-all" 
              />
            </div>
            <div className="flex items-center gap-3 bg-brand-surface-alt/50 border border-brand-border rounded-full px-4 py-1.5 shadow-brand-sm">
              <div className="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/30 flex items-center justify-center"><span className="text-brand-accent font-black text-xs">A</span></div>
              <div className="hidden lg:block"><p className="text-[10px] font-black uppercase leading-none text-brand-text-primary">Administrator</p><p className="text-[9px] font-black uppercase text-brand-accent leading-none mt-1">Master Access</p></div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                {/* Primary Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat) => (
                    <div key={stat.id} className="bg-brand-surface-alt/30 border border-brand-border p-6 rounded-brand-3xl backdrop-blur-xl group hover:border-brand-accent/30 transition-all duration-500">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-brand-xl ${stat.bg} ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <div className="bg-emerald-500/10 text-emerald-500 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Live Sync</div>
                      </div>
                      <h3 className="text-brand-text-muted text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</h3>
                      <p className="text-3xl font-black italic tracking-tighter text-brand-text-primary">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Sales Chart Section */}
                  <div className="lg:col-span-2 bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-black italic uppercase tracking-tight">Tactical Sales Performance</h3>
                        <p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-1">7-Day Revenue Analysis</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-accent rounded-full animate-pulse" />
                        <span className="text-[8px] font-black uppercase text-brand-accent">Real-time Stream</span>
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#C6A667" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#C6A667" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                          <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} fontWeight="900" />
                          <YAxis stroke="#ffffff40" fontSize={10} fontWeight="900" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#151515', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: '#C6A667', fontSize: '10px', fontWeight: '900' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#C6A667" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Inventory Health Radar */}
                  <div className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-sm font-black italic uppercase tracking-tight">Inventory Health Radar</h3>
                      <FiActivity className="text-brand-error animate-pulse" />
                    </div>
                    <div className="space-y-4">
                      {products.filter(p => p.stock <= 10).length > 0 ? (
                        products.filter(p => p.stock <= 10).slice(0, 4).map(product => (
                          <div key={product.id} className="p-4 bg-brand-error/5 border border-brand-error/10 rounded-brand-2xl">
                            <div className="flex justify-between items-center mb-2">
                              <p className="text-[10px] font-black uppercase text-brand-text-primary truncate max-w-[120px]">{product.name}</p>
                              <span className="text-[9px] font-black text-brand-error uppercase tracking-tighter">CRITICAL</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1 bg-brand-error/20 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-error" style={{ width: `${(product.stock / 10) * 100}%` }} />
                              </div>
                              <span className="text-[10px] font-black text-brand-text-primary">{product.stock} UNITS</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3 opacity-20" />
                          <p className="text-[10px] font-black uppercase text-brand-text-muted">All Stock Levels Normal</p>
                        </div>
                      )}
                    </div>
                    <button onClick={() => setActiveTab('products')} className="w-full mt-6 py-3 border border-brand-border rounded-brand-xl text-[9px] font-black uppercase tracking-widest text-brand-text-muted hover:border-brand-accent hover:text-brand-accent transition-all">Full Inventory Audit</button>
                  </div>
                </div>

                <div className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black italic uppercase tracking-tight">Recent Inventory</h3>
                    <button onClick={() => setActiveTab('products')} className="text-[10px] font-black uppercase tracking-widest text-brand-accent hover:underline decoration-2 underline-offset-4">View All</button>
                  </div>
                  <div className="space-y-4">
                    {products.slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 bg-brand-background/50 border border-brand-border rounded-brand-2xl hover:border-brand-accent/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-brand-surface-alt rounded-brand-lg overflow-hidden border border-brand-border">
                            <img src={product.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-brand-text-primary">{product.name}</p>
                            <p className="text-[10px] text-brand-text-muted font-medium mt-0.5">MRP: ₹{product.comparePrice} • Stock: {product.stock}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-brand-accent uppercase">₹{product.price}</p>
                          <p className="text-[8px] text-emerald-500 font-black">{product.discount}% OFF</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'products' && (<motion.div key="products" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl"><div className="flex items-center justify-between mb-8"><div><h3 className="text-2xl font-black italic uppercase tracking-tighter">Inventory Management</h3><div className="flex items-center gap-2 mt-1">{selectedCategoryFilter ? (<div className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 px-2 py-1 rounded-full"><span className="text-[8px] font-black uppercase text-brand-accent">Filtering: {categories.find(c => c.id === selectedCategoryFilter)?.name}</span><button onClick={() => setSelectedCategoryFilter(null)} className="hover:text-brand-accent text-brand-text-muted transition-colors"><FiX className="w-2.5 h-2.5" /></button></div>) : (<p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest">Total {products.length} Products Found</p>)}</div></div><button onClick={() => { setIsEditing(false); setNewProduct({ name: '', description: '', mrp: '', discount: '', sellingPrice: '', wholesalePrice: '', stock: '', categoryId: categories[0]?.id || '', sku: '', imageUrl: '' }); setIsAddProductModalOpen(true); }} className="bg-brand-accent text-brand-background px-6 py-3 rounded-brand-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-brand-lg shadow-brand-accent/20"><FiPlus className="inline mr-2 w-4 h-4" /> Add Product</button></div><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-brand-border text-[10px] font-black uppercase tracking-widest text-brand-text-muted"><th className="pb-4 pl-4">Product</th><th className="pb-4">Category</th><th className="pb-4">Pricing (₹)</th><th className="pb-4">Stock</th><th className="pb-4">Status</th><th className="pb-4 text-right pr-4">Actions</th></tr></thead><tbody className="divide-y divide-brand-border/50">{products.filter(p => !selectedCategoryFilter || p.categoryId === selectedCategoryFilter).map((product) => (<tr key={product.id} className="group hover:bg-brand-surface-alt/20 transition-all"><td className="py-4 pl-4"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-brand-surface-alt rounded-brand-lg overflow-hidden border border-brand-border"><img src={product.images?.[0] || '/placeholder.png'} className="w-full h-full object-cover" /></div><span className="text-xs font-black uppercase text-brand-text-primary">{product.name}</span></div></td><td className="py-4 text-[10px] font-bold text-brand-text-muted uppercase">{product.category?.name || 'Uncategorized'}</td><td className="py-4"><div><p className="text-xs font-black italic text-brand-text-primary">₹{product.price}</p><p className="text-[8px] text-brand-text-muted line-through">₹{product.comparePrice}</p></div></td><td className="py-4"><span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${product.stock <= 5 ? 'bg-brand-error/10 text-brand-error' : 'bg-emerald-500/10 text-emerald-500'}`}>{product.stock} IN STOCK</span></td><td className="py-4"><span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> ACTIVE</span></td><td className="py-4 text-right pr-4"><button onClick={() => handleEditClick(product)} className="text-brand-text-muted hover:text-brand-accent p-2 transition-all"><FiSettings className="w-4 h-4" /></button></td></tr>))}</tbody></table></div></motion.div>)}
            {activeTab === 'categories' && (<motion.div key="categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl"><div className="flex items-center justify-between mb-8"><div><h3 className="text-2xl font-black italic uppercase tracking-tighter">System Classification</h3><p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-1">Found {categories.length} Taxonomy Nodes</p></div><button onClick={() => setIsAddCategoryModalOpen(true)} className="bg-brand-accent text-brand-background px-6 py-3 rounded-brand-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-brand-lg shadow-brand-accent/20"><FiPlus className="inline mr-2 w-4 h-4" /> Add Category</button></div><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{categories.map((cat) => (<div key={cat.id} className="bg-brand-background/50 border border-brand-border rounded-brand-2xl p-6 group hover:border-brand-accent/30 transition-all"><div className="w-16 h-16 bg-brand-surface-alt rounded-brand-2xl mb-6 overflow-hidden border border-brand-border"><img src={cat.image || '/placeholder.png'} className="w-full h-full object-cover" /></div><h4 className="text-sm font-black uppercase text-brand-text-primary mb-2 tracking-tight group-hover:text-brand-accent transition-colors">{cat.name}</h4><p className="text-[10px] text-brand-text-muted font-medium line-clamp-2 mb-6 h-8">{cat.description || 'System defined taxonomy node.'}</p><div className="flex items-center justify-between pt-4 border-t border-brand-border"><span className="text-[9px] font-black uppercase tracking-widest text-brand-accent">Active Node</span><button onClick={() => { setSelectedCategoryFilter(cat.id); setActiveTab('products'); }} className="p-2 hover:bg-brand-accent hover:text-brand-background rounded-full transition-all group-hover:translate-x-1"><FiArrowRight /></button></div></div>))}</div></motion.div>)}
            {activeTab === 'customers' && (<motion.div key="customers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl"><div className="flex items-center justify-between mb-8"><div><h3 className="text-2xl font-black italic uppercase tracking-tighter">Customer Directory</h3><p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-1">Found {customers.length} Users</p></div></div><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">{customers.map((customer) => (<div key={customer.id} className="bg-brand-background/50 border border-brand-border rounded-brand-2xl p-6 hover:border-brand-accent/30 transition-all group"><div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-brand-accent/10 border border-brand-accent/20 rounded-full flex items-center justify-center text-brand-accent font-black text-lg">{customer.name?.charAt(0)}</div><div><h4 className="text-sm font-black uppercase text-brand-text-primary">{customer.name}</h4><p className="text-[10px] font-black uppercase text-brand-text-muted">{customer.role || 'CUSTOMER'}</p></div></div><div className="space-y-3"><div className="flex items-center gap-3 text-brand-text-muted"><FiMail className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">{customer.email}</span></div><div className="flex items-center gap-3 text-brand-text-muted"><FiPhone className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">{customer.phone || 'N/A'}</span></div></div><div className="mt-6 pt-6 border-t border-brand-border flex justify-between items-center"><div className="flex items-center gap-2"><FiShoppingBag className="w-3.5 h-3.5 text-brand-accent" /> <span className="text-[10px] font-black uppercase">{customer._count?.orders || 0} ORDERS</span></div><button onClick={() => setSelectedCustomer(customer)} className="text-[9px] font-black uppercase tracking-widest text-brand-accent flex items-center gap-1 group-hover:gap-2 transition-all">VIEW PROFILE <FiArrowRight /></button></div></div>))}</div></motion.div>)}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Sales Ledger</h3>
                    <p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-1">
                      {orders.filter(o => {
                        const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
                        const matchesSearch = !globalSearch || 
                          o.id.toLowerCase().includes(globalSearch.toLowerCase()) || 
                          o.user?.name?.toLowerCase().includes(globalSearch.toLowerCase());
                        return matchesStatus && matchesSearch;
                      }).length} Operations Filtered
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={fetchOrders}
                      className="flex items-center gap-2 bg-brand-accent/10 border border-brand-accent/20 rounded-brand-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest text-brand-accent hover:bg-brand-accent hover:text-brand-background transition-all"
                    >
                      <FiRefreshCw className="w-3 h-3" /> Sync Ledger
                    </button>
                    <div className="flex items-center gap-2 bg-brand-background/50 border border-brand-border rounded-brand-xl px-3 py-2">
                      <FiFilter className="text-brand-accent w-3 h-3" />
                      <select 
                        value={orderStatusFilter} 
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-brand-text-primary"
                      >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 bg-brand-background/50 border border-brand-border rounded-brand-xl px-3 py-2">
                      <FiTrendingUp className="text-brand-accent w-3 h-3" />
                      <select 
                        value={orderSort} 
                        onChange={(e) => setOrderSort(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer text-brand-text-primary"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Value</option>
                        <option value="lowest">Lowest Value</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {orders
                    .filter(order => {
                      const matchesStatus = orderStatusFilter === 'ALL' || order.status === orderStatusFilter;
                      const matchesSearch = !globalSearch || 
                        order.id.toLowerCase().includes(globalSearch.toLowerCase()) || 
                        order.user?.name?.toLowerCase().includes(globalSearch.toLowerCase());
                      return matchesStatus && matchesSearch;
                    })
                    .sort((a, b) => {
                      if (orderSort === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      if (orderSort === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                      if (orderSort === 'highest') return (b.total || 0) - (a.total || 0);
                      if (orderSort === 'lowest') return (a.total || 0) - (b.total || 0);
                      return 0;
                    })
                    .map((order) => (
                    <div key={order.id} className="bg-brand-background/50 border border-brand-border rounded-brand-2xl p-6 hover:border-brand-accent/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-brand-surface-alt rounded-brand-xl flex items-center justify-center border border-brand-border group-hover:bg-brand-accent/10 transition-colors">
                          <FiShoppingBag className="text-brand-text-muted group-hover:text-brand-accent transition-colors" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-black uppercase text-brand-text-primary">ORDER #{order.id.slice(-8).toUpperCase()}</span>
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded-full border",
                              order.status === 'DELIVERED' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                              order.status === 'CANCELLED' ? "bg-brand-error/10 text-brand-error border-brand-error/20" :
                              order.status === 'PENDING' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              "bg-brand-accent/10 text-brand-accent border-brand-accent/20"
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-black uppercase text-brand-text-muted mt-1">
                            <span 
                              onClick={() => setSelectedCustomer(order.user)}
                              className="hover:text-brand-accent cursor-pointer transition-colors"
                            >
                              {order.user?.name}
                            </span>
                            <span className="mx-1.5 opacity-30">•</span>
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                        <div className="text-right">
                          <p className="text-xs font-black italic text-brand-text-muted uppercase tracking-widest mb-0.5">Tactical Value</p>
                          <p className="text-lg font-black italic text-brand-accent tracking-tighter">₹{order.total?.toLocaleString()}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-3 bg-brand-surface-alt border border-brand-border rounded-brand-xl hover:border-brand-accent hover:text-brand-accent transition-all"
                        >
                          <FiArrowRight />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {orders.filter(order => orderStatusFilter === 'ALL' || order.status === orderStatusFilter).length === 0 && (
                    <div className="py-20 text-center border border-dashed border-brand-border rounded-brand-3xl">
                      <FiShoppingBag className="w-12 h-12 text-brand-text-muted mx-auto mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted">No tactical operations found matching criteria</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Profile Section */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-brand-accent/10 rounded-brand-xl text-brand-accent"><FiUsers className="w-6 h-6" /></div>
                        <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter">Administrator Profile</h3>
                          <p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-0.5">Master Identity Configuration</p>
                        </div>
                      </div>
                      <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiType className="text-brand-accent" /> Full Name</label>
                            <input type="text" placeholder="Administrator" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3.5 text-xs font-bold focus:border-brand-accent outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiMail className="text-brand-accent" /> Email Address</label>
                            <input type="email" placeholder="admin@alphapowerzone.com" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3.5 text-xs font-bold focus:border-brand-accent outline-none transition-all" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiPhone className="text-brand-accent" /> Tactical Contact</label>
                          <input type="text" placeholder="+91 98765 43210" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3.5 text-xs font-bold focus:border-brand-accent outline-none transition-all" />
                        </div>
                        <button type="button" className="bg-brand-accent text-brand-background px-8 py-3.5 rounded-brand-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-brand-lg shadow-brand-accent/20">Sync Profile Data</button>
                      </form>
                    </div>

                    <div className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-brand-error/10 rounded-brand-xl text-brand-error"><FiShield className="w-6 h-6" /></div>
                        <div>
                          <h3 className="text-xl font-black italic uppercase tracking-tighter">Security Protocol</h3>
                          <p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-0.5">Credential Rotation & Protection</p>
                        </div>
                      </div>
                      <form className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2">Current Password</label>
                          <input type="password" placeholder="••••••••" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3.5 text-xs font-bold focus:border-brand-accent outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2">New Password</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3.5 text-xs font-bold focus:border-brand-accent outline-none transition-all" />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2">Confirm Rotation</label>
                            <input type="password" placeholder="••••••••" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3.5 text-xs font-bold focus:border-brand-accent outline-none transition-all" />
                          </div>
                        </div>
                        <button type="button" className="bg-brand-error text-white px-8 py-3.5 rounded-brand-xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-brand-lg shadow-brand-error/20">Initiate Rotation</button>
                      </form>
                    </div>
                  </div>

                  {/* Sidebar Settings */}
                  <div className="space-y-8">
                    <div className="bg-brand-surface-alt/30 border border-brand-border rounded-brand-3xl p-8 backdrop-blur-xl">
                      <h3 className="text-xs font-black uppercase tracking-widest mb-6">Global Preferences</h3>
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-brand-background/50 border border-brand-border rounded-brand-2xl">
                          <div>
                            <p className="text-[10px] font-black uppercase text-brand-text-primary">Maintenance Mode</p>
                            <p className="text-[8px] text-brand-text-muted font-bold uppercase mt-1">Restrict Public Access</p>
                          </div>
                          <div 
                            onClick={() => {
                              setMaintenanceMode(!maintenanceMode);
                              toast.success(`Protocol: Maintenance Mode ${!maintenanceMode ? 'ENGAGED' : 'DISENGAGED'}`);
                            }}
                            className={`w-10 h-5 ${maintenanceMode ? 'bg-brand-error' : 'bg-brand-border'} rounded-full relative p-1 cursor-pointer transition-all duration-300`}
                          >
                            <motion.div animate={{ x: maintenanceMode ? 20 : 0 }} className={`w-3 h-3 ${maintenanceMode ? 'bg-white' : 'bg-brand-text-muted'} rounded-full shadow-sm`} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-brand-background/50 border border-brand-border rounded-brand-2xl">
                          <div>
                            <p className="text-[10px] font-black uppercase text-brand-text-primary">Order Notifications</p>
                            <p className="text-[8px] text-brand-text-muted font-bold uppercase mt-1">Real-time System Alerts</p>
                          </div>
                          <div 
                            onClick={() => {
                              setOrderNotifications(!orderNotifications);
                              toast.success(`Protocol: Alerts ${!orderNotifications ? 'ENABLED' : 'MUTED'}`);
                            }}
                            className={`w-10 h-5 ${orderNotifications ? 'bg-brand-accent' : 'bg-brand-border'} rounded-full relative p-1 cursor-pointer transition-all duration-300`}
                          >
                            <motion.div animate={{ x: orderNotifications ? 20 : 0 }} className={`w-3 h-3 ${orderNotifications ? 'bg-white' : 'bg-brand-text-muted'} rounded-full shadow-sm`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-brand-accent/5 border border-brand-accent/20 rounded-brand-3xl p-8 backdrop-blur-xl relative overflow-hidden group">
                      <div className="relative z-10">
                        <h4 className="text-brand-accent text-[10px] font-black uppercase tracking-widest mb-2">System Version</h4>
                        <p className="text-2xl font-black italic tracking-tighter text-brand-text-primary">v2.4.0 ALPHA</p>
                        <p className="text-[9px] text-brand-text-muted font-bold mt-4 leading-relaxed uppercase">The system is currently running on the master branch with full tactical synchronization enabled.</p>
                      </div>
                      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:scale-110 transition-transform">
                        <FiSettings className="w-32 h-32 rotate-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Advanced Product Modal */}
      <AnimatePresence>
        {isAddProductModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddProductModalOpen(false)} className="absolute inset-0 bg-brand-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-brand-surface-alt border border-brand-border rounded-brand-3xl shadow-brand-2xl overflow-hidden">
              <div className="p-8 border-b border-brand-border flex items-center justify-between bg-brand-background/50"><div><h3 className="text-2xl font-black italic uppercase tracking-tighter">{isEditing ? 'Inventory Update' : 'Inventory Injection'}</h3><p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-1">{isEditing ? 'Modifying Existing System Record' : 'Registering New Product to Master Database'}</p></div><button onClick={() => setIsAddProductModalOpen(false)} className="w-10 h-10 bg-brand-surface-alt rounded-full flex items-center justify-center text-brand-text-muted hover:text-brand-error transition-all"><FiX className="w-5 h-5" /></button></div>
              <form onSubmit={handleCreateProduct} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-1 md:col-span-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiType className="text-brand-accent" /> Product Name</label><input required type="text" placeholder="e.g. APZ PRO DUMBBELLS" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3.5 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} /></div>
                  
                  {/* Advanced Pricing Row */}
                  <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-6 bg-brand-background/30 p-6 rounded-brand-2xl border border-brand-border/50">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FaIndianRupeeSign className="text-brand-accent" /> MRP</label><input required type="number" placeholder="3599" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newProduct.mrp} onChange={(e) => handlePriceLogic('mrp', e.target.value)} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiPercent className="text-brand-accent" /> Discount %</label><input required type="number" placeholder="10" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newProduct.discount} onChange={(e) => handlePriceLogic('discount', e.target.value)} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-accent flex items-center gap-2"><FiShoppingCart className="text-brand-accent" /> Selling Price</label><input required type="number" placeholder="3199" className="w-full bg-brand-background border-2 border-brand-accent/20 rounded-brand-xl px-4 py-3 text-xs font-black text-brand-accent focus:border-brand-accent outline-none transition-all" value={newProduct.sellingPrice} onChange={(e) => handlePriceLogic('sellingPrice', e.target.value)} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-error flex items-center gap-2"><FiPackage className="text-brand-error" /> Wholesale</label><input required type="number" placeholder="2500" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newProduct.wholesalePrice} onChange={(e) => setNewProduct({...newProduct, wholesalePrice: e.target.value})} /></div>
                  </div>

                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiLayers className="text-brand-accent" /> Initial Stock</label><input required type="number" placeholder="50" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiTag className="text-brand-accent" /> SKU Code</label><input required type="text" placeholder="APZ-DB-001" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all uppercase" value={newProduct.sku} onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})} /></div>
                  
                  <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiGrid className="text-brand-accent" /> System Category</label><select required className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newProduct.categoryId} onChange={(e) => setNewProduct({...newProduct, categoryId: e.target.value})} >{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name.toUpperCase()}</option>))}</select></div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiImage className="text-brand-accent" /> Visual Asset</label>
                    <div className="flex gap-2 p-1 bg-brand-background border border-brand-border rounded-brand-xl"><button type="button" onClick={() => setImageMethod('url')} className={`flex-1 py-2 rounded-brand-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageMethod === 'url' ? 'bg-brand-accent text-brand-background' : 'text-brand-text-muted'}`}>URL</button><button type="button" onClick={() => setImageMethod('upload')} className={`flex-1 py-2 rounded-brand-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageMethod === 'upload' ? 'bg-brand-accent text-brand-background' : 'text-brand-text-muted'}`}>UPLOAD</button></div>
                    {imageMethod === 'url' ? (<input type="url" placeholder="https://..." className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} />) : (<div className="flex items-center gap-4"><input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'product')} /><button type="button" onClick={() => fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-brand-border rounded-brand-xl py-4 flex flex-col items-center justify-center text-brand-text-muted hover:border-brand-accent transition-all">{newProduct.imageUrl && newProduct.imageUrl.startsWith('data:') ? (<img src={newProduct.imageUrl} className="w-10 h-10 object-cover rounded-brand-lg mb-2" />) : (<FiUpload className="w-5 h-5 mb-1" />)}<span className="text-[8px] font-black uppercase tracking-widest">Select Image</span></button></div>)}
                  </div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiInfo className="text-brand-accent" /> Product Specifications</label><textarea required rows={3} placeholder="Enter details..." className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all resize-none" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} /></div>
                <button type="submit" className="w-full bg-brand-accent text-brand-background py-4 rounded-brand-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-brand-lg shadow-brand-accent/20">{isEditing ? 'Authorize Update' : 'Authorize Deployment'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>{isAddCategoryModalOpen && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddCategoryModalOpen(false)} className="absolute inset-0 bg-brand-background/80 backdrop-blur-md" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-brand-surface-alt border border-brand-border rounded-brand-3xl shadow-brand-2xl overflow-hidden"><div className="p-8 border-b border-brand-border bg-brand-background/50 flex items-center justify-between"><div><h3 className="text-xl font-black italic uppercase tracking-tighter">Taxonomy Initialization</h3><p className="text-[9px] text-brand-text-muted font-black uppercase tracking-widest mt-1">Establishing New Classification Node</p></div><button onClick={() => setIsAddCategoryModalOpen(false)} className="text-brand-text-muted hover:text-brand-error transition-all"><FiX className="w-5 h-5" /></button></div><form onSubmit={handleCreateCategory} className="p-8 space-y-6"><div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiType className="text-brand-accent" /> Category Name</label><input required type="text" placeholder="e.g. PERFORMANCE GEAR" className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newCategory.name} onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} /></div><div className="space-y-4"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiImage className="text-brand-accent" /> Category Visual Identifier</label><div className="flex gap-2 p-1 bg-brand-background border border-brand-border rounded-brand-xl"><button type="button" onClick={() => setImageMethod('url')} className={`flex-1 py-2 rounded-brand-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageMethod === 'url' ? 'bg-brand-accent text-brand-background' : 'text-brand-text-muted'}`}>URL</button><button type="button" onClick={() => setImageMethod('upload')} className={`flex-1 py-2 rounded-brand-lg text-[10px] font-black uppercase tracking-widest transition-all ${imageMethod === 'upload' ? 'bg-brand-accent text-brand-background' : 'text-brand-text-muted'}`}>UPLOAD</button></div>{imageMethod === 'url' ? (<input type="url" placeholder="https://..." className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all" value={newCategory.image} onChange={(e) => setNewCategory({...newCategory, image: e.target.value})} />) : (<div className="flex items-center gap-4"><input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'category')} /><button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-brand-border rounded-brand-xl py-6 flex flex-col items-center justify-center text-brand-text-muted hover:border-brand-accent transition-all">{newCategory.image && newCategory.image.startsWith('data:') ? (<img src={newCategory.image} className="w-12 h-12 object-cover rounded-brand-lg mb-2" />) : (<FiUpload className="w-6 h-6 mb-2" />)}<span className="text-[8px] font-black uppercase tracking-widest">Select Image</span></button></div>)}</div><div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-brand-text-muted flex items-center gap-2"><FiBookOpen className="text-brand-accent" /> Brief Protocol</label><textarea rows={3} placeholder="Describe..." className="w-full bg-brand-background border border-brand-border rounded-brand-xl px-4 py-3 text-xs font-bold focus:border-brand-accent outline-none transition-all resize-none" value={newCategory.description} onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} /></div><button type="submit" className="w-full bg-brand-accent text-brand-background py-4 rounded-brand-2xl text-[10px] font-black uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-brand-lg shadow-brand-accent/20">Establish Node</button></form></motion.div></div>)}</AnimatePresence>
      <AnimatePresence>{selectedCustomer && (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4"><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCustomer(null)} className="absolute inset-0 bg-brand-background/80 backdrop-blur-md" /><motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-brand-surface-alt border border-brand-border rounded-brand-3xl shadow-brand-2xl"><div className="h-32 bg-brand-accent relative rounded-t-brand-3xl overflow-hidden"><button onClick={() => setSelectedCustomer(null)} className="absolute top-6 right-6 w-10 h-10 bg-brand-background/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-brand-background/40 transition-all"><FiX className="w-5 h-5" /></button></div><div className="px-8 pb-10 -mt-16"><div className="flex items-end gap-6 mb-8"><div className="w-32 h-32 rounded-brand-3xl bg-brand-background border-4 border-brand-surface-alt flex items-center justify-center text-brand-accent text-4xl font-black shadow-brand-lg z-10">{selectedCustomer.name?.charAt(0)}</div><div className="pb-2"><h3 className="text-3xl font-black italic uppercase tracking-tighter text-brand-text-primary">{selectedCustomer.name}</h3><div className="flex items-center gap-2 text-brand-accent"><FiShield className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-widest italic">{selectedCustomer.role || 'VERIFIED CUSTOMER'}</span></div></div></div><div className="grid grid-cols-2 gap-8 mb-10"><div className="space-y-6"><div><label className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted block mb-2">Email</label><div className="flex items-center gap-3 text-brand-text-primary"><FiMail className="w-4 h-4 text-brand-accent" /><span className="text-sm font-bold">{selectedCustomer.email}</span></div></div><div><label className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted block mb-2">Phone</label><div className="flex items-center gap-3 text-brand-text-primary"><FiPhone className="w-4 h-4 text-brand-accent" /><span className="text-sm font-bold">{selectedCustomer.phone || 'N/A'}</span></div></div></div><div className="space-y-6"><div><label className="text-[9px] font-black uppercase tracking-widest text-brand-text-muted block mb-2">Joined</label><div className="flex items-center gap-3 text-brand-text-primary"><FiCalendar className="w-4 h-4 text-brand-accent" /><span className="text-sm font-bold">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span></div></div></div></div><div className="grid grid-cols-3 gap-4"><div className="bg-brand-background/50 border border-brand-border rounded-brand-2xl p-4 text-center"><p className="text-[9px] font-black uppercase text-brand-text-muted mb-1">Orders</p><p className="text-xl font-black italic text-brand-text-primary">{selectedCustomer._count?.orders || 0}</p></div><div className="bg-brand-background/50 border border-brand-border rounded-brand-2xl p-4 text-center"><p className="text-[9px] font-black uppercase text-brand-text-muted mb-1">Loyalty</p><p className="text-xl font-black italic text-brand-accent">TIER 1</p></div><div className="bg-brand-background/50 border border-brand-border rounded-brand-2xl p-4 text-center"><p className="text-[9px] font-black uppercase text-brand-text-muted mb-1">Status</p><p className="text-xl font-black italic text-emerald-500">ACTIVE</p></div></div></div></motion.div></div>)}</AnimatePresence>
      
      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="absolute inset-0 bg-brand-background/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-brand-surface-alt border border-brand-border rounded-brand-3xl overflow-hidden shadow-2xl">
              <div className="p-8 border-b border-brand-border flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Mission Intelligence</h3>
                  <p className="text-[10px] text-brand-text-muted font-black uppercase tracking-widest mt-1">ORDER #{selectedOrder.id.toUpperCase()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-brand-background rounded-full transition-all text-brand-text-muted hover:text-brand-accent"><FiX className="w-5 h-5" /></button>
              </div>
              
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-8 custom-scrollbar">
                {/* Order Items */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent">Payload Composition</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-brand-background/50 border border-brand-border rounded-brand-2xl group/item">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-brand-surface-alt rounded-brand-lg overflow-hidden border border-brand-border">
                            <img 
                              src={item.product?.images?.[0] || '/images/placeholder.jpg'} 
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                              onError={(e: any) => e.target.src = '/images/placeholder.jpg'}
                            />
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-brand-text-primary">{item.product?.name || 'Unknown Product'}</p>
                            <p className="text-[10px] text-brand-text-muted font-bold mt-0.5">Qty: {item.qty} • Price: ₹{item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-black italic text-brand-accent">₹{(item.price * item.qty).toLocaleString()}</p>
                          </div>
                          {item.product?.slug && (
                            <Link 
                              to={`/product/${item.product.slug}`}
                              target="_blank"
                              className="p-2 bg-brand-surface-alt border border-brand-border rounded-brand-lg text-brand-text-muted hover:text-brand-accent hover:border-brand-accent transition-all opacity-0 group-hover/item:opacity-100"
                              title="Inspect Product Node"
                            >
                              <FiArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Shipping Info */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent">Tactical Deployment</h4>
                    <div className="p-5 bg-brand-background/50 border border-brand-border rounded-brand-2xl space-y-2 min-h-[100px]">
                      {selectedOrder.address ? (
                        <>
                          <p className="text-[10px] font-black uppercase text-brand-text-primary">{selectedOrder.address.name}</p>
                          <p className="text-[10px] font-bold text-brand-text-muted leading-relaxed">
                            {selectedOrder.address.line1}<br />
                            {selectedOrder.address.line2 && <>{selectedOrder.address.line2}<br /></>}
                            {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                          </p>
                          <p className="text-[10px] font-black text-brand-accent mt-2">{selectedOrder.address.phone}</p>
                        </>
                      ) : (
                        <p className="text-[10px] font-black uppercase text-brand-error/50 italic">No Address Payload Detected</p>
                      )}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent">Financial Status</h4>
                    <div className="p-5 bg-brand-background/50 border border-brand-border rounded-brand-2xl space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-brand-text-muted">Method</span>
                        <span className="text-[10px] font-black uppercase text-brand-text-primary">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-brand-text-muted">Status</span>
                        <span className={cn(
                          "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                          selectedOrder.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-500" : "bg-brand-error/10 text-brand-error"
                        )}>{selectedOrder.paymentStatus}</span>
                      </div>
                      <div className="pt-3 border-t border-brand-border flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-brand-text-muted">Total Value</span>
                        <span className="text-sm font-black italic text-brand-accent">₹{selectedOrder.total?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Protocol Control */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent">Protocol Authorization</h4>
                  <div className="flex items-center gap-4">
                    <select 
                      value={selectedOrder.status}
                      onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                      className="flex-1 bg-brand-background border border-brand-border rounded-brand-xl px-5 py-3.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-accent transition-all cursor-pointer"
                    >
                      <option value="PENDING">Pending Approval</option>
                      <option value="CONFIRMED">Mission Confirmed</option>
                      <option value="PROCESSING">Processing Payload</option>
                      <option value="SHIPPED">Tactical Transit</option>
                      <option value="DELIVERED">Mission Accomplished</option>
                      <option value="CANCELLED">Mission Aborted</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-brand-background/50 border-t border-brand-border flex justify-end">
                <button onClick={() => setSelectedOrder(null)} className="px-8 py-3.5 border border-brand-border rounded-brand-xl text-[10px] font-black uppercase tracking-[0.2em] text-brand-text-muted hover:border-brand-accent hover:text-brand-accent transition-all">Close Intelligence Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden"><div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px]" /><div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px]" /></div>
    </div>
  );
};

export default OwnerDashboard;
