import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiGrid, FiPlus, FiEdit2, FiTrash2, FiImage } from 'react-icons/fi';

const OwnerDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [view, setView] = useState('overview');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productForm, setProductForm] = useState({ name: '', description: '', price: '', categoryId: '' });
    const [categoryForm, setCategoryForm] = useState({ name: '' });
    const [productImage, setProductImage] = useState(null);
    const [categoryImage, setCategoryImage] = useState(null);
    const [productPreview, setProductPreview] = useState(null);
    const [categoryPreview, setCategoryPreview] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);

    // Cleanup previews to avoid memory leaks
    useEffect(() => {
        return () => {
            if (productPreview) URL.revokeObjectURL(productPreview);
            if (categoryPreview) URL.revokeObjectURL(categoryPreview);
        };
    }, [productPreview, categoryPreview]);

    const handleProductImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProductImage(file);
            setProductPreview(URL.createObjectURL(file));
        }
    };

    const handleCategoryImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCategoryImage(file);
            setCategoryPreview(URL.createObjectURL(file));
        }
    };

    useEffect(() => {
        if (!user || user.role !== 'owner') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(productForm).forEach(key => formData.append(key, productForm[key]));
        if (productImage) formData.append('image', productImage);

        try {
            if (editingProduct) {
                await api.put(`/products/${editingProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Product updated successfully!');
            } else {
                await api.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Product created successfully!');
            }
            setProductForm({ name: '', description: '', price: '', categoryId: '' });
            setProductImage(null);
            setProductPreview(null);
            setEditingProduct(null);
            fetchData();
        } catch (err) {
            alert('Failed to save product');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', categoryForm.name);
        if (categoryImage) formData.append('image', categoryImage);

        try {
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Category updated successfully!');
            } else {
                await api.post('/categories', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                alert('Category created successfully!');
            }
            setCategoryForm({ name: '' });
            setCategoryImage(null);
            setCategoryPreview(null);
            setEditingCategory(null);
            fetchData();
        } catch (err) {
            alert('Failed to save category');
        }
    };

    const deleteProduct = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            alert('Product deleted successfully!');
            fetchData();
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const deleteCategory = async (id) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await api.delete(`/categories/${id}`);
            alert('Category deleted successfully!');
            fetchData();
        } catch (err) {
            alert('Failed to delete category');
        }
    };

    const startEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId
        });
        setView('products');
    };

    const startEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({ name: category.name });
        setView('categories');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-primary to-purple-600 bg-clip-text text-transparent mb-3">
                        Owner Dashboard
                    </h1>
                    <p className="text-lg text-gray-600">Manage your store inventory and categories</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-primary transform hover:-translate-y-1 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                                <p className="text-4xl font-bold text-gray-900">{products.length}</p>
                            </div>
                            <div className="bg-primary/10 p-4 rounded-full">
                                <FiPackage className="w-8 h-8 text-primary" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-500 transform hover:-translate-y-1 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Categories</p>
                                <p className="text-4xl font-bold text-gray-900">{categories.length}</p>
                            </div>
                            <div className="bg-purple-100 p-4 rounded-full">
                                <FiGrid className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500 transform hover:-translate-y-1 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                                <p className="text-4xl font-bold text-gray-900">₹{products.reduce((acc, p) => acc + parseFloat(p.price), 0).toFixed(0)}</p>
                            </div>
                            <div className="bg-green-100 p-4 rounded-full">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-orange-500 transform hover:-translate-y-1 transition-all">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Avg. Price</p>
                                <p className="text-4xl font-bold text-gray-900">₹{products.length > 0 ? (products.reduce((acc, p) => acc + parseFloat(p.price), 0) / products.length).toFixed(0) : 0}</p>
                            </div>
                            <div className="bg-orange-100 p-4 rounded-full">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex border-b border-gray-200 bg-gray-50">
                        <button
                            onClick={() => setView('overview')}
                            className={`flex-1 px-6 py-4 font-semibold transition-all ${view === 'overview'
                                ? 'text-primary bg-white border-b-3 border-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setView('products')}
                            className={`flex-1 px-6 py-4 font-semibold transition-all ${view === 'products'
                                ? 'text-primary bg-white border-b-3 border-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => setView('categories')}
                            className={`flex-1 px-6 py-4 font-semibold transition-all ${view === 'categories'
                                ? 'text-primary bg-white border-b-3 border-primary shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                        >
                            Categories
                        </button>
                    </div>

                    {/* Overview Tab */}
                    {view === 'overview' && (
                        <div className="p-8">
                            <h2 className="text-3xl font-bold mb-8 text-gray-900">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <button
                                    onClick={() => setView('products')}
                                    className="group bg-gradient-to-br from-primary to-indigo-600 text-white p-10 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                    <FiPackage className="w-12 h-12 mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Manage Products</h3>
                                    <p className="text-indigo-100">Add, edit, or delete your product catalog</p>
                                </button>
                                <button
                                    onClick={() => setView('categories')}
                                    className="group bg-gradient-to-br from-purple-500 to-pink-600 text-white p-10 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-1 text-left relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                    <FiGrid className="w-12 h-12 mb-4" />
                                    <h3 className="text-2xl font-bold mb-2">Manage Categories</h3>
                                    <p className="text-purple-100">Organize your products into categories</p>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Products Tab */}
                    {view === 'products' && (
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Form */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 sticky top-24">
                                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                            <FiPlus className="w-6 h-6" />
                                            {editingProduct ? 'Edit' : 'Add New'} Product
                                        </h3>
                                        <form onSubmit={handleProductSubmit} className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Product Name"
                                                value={productForm.name}
                                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                            <textarea
                                                placeholder="Description"
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                                className="input-field h-24 resize-none"
                                                required
                                            />
                                            <input
                                                type="number"
                                                placeholder="Price (₹)"
                                                value={productForm.price}
                                                onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                            <select
                                                value={productForm.categoryId}
                                                onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                                                className="input-field"
                                                required
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="space-y-2">
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors relative">
                                                    {productPreview ? (
                                                        <div className="relative h-32 w-full">
                                                            <img src={productPreview} alt="Preview" className="h-full w-full object-contain rounded" />
                                                            <button
                                                                type="button"
                                                                onClick={() => { setProductImage(null); setProductPreview(null); }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FiImage className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                            <p className="text-xs text-gray-500 mb-2">Click to upload product image</p>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        onChange={handleProductImageChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        required={!editingProduct}
                                                        accept="image/*"
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" className="w-full btn btn-primary py-3 text-lg">
                                                {editingProduct ? 'Update' : 'Create'} Product
                                            </button>
                                            {editingProduct && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingProduct(null);
                                                        setProductForm({ name: '', description: '', price: '', categoryId: '' });
                                                        setProductImage(null);
                                                    }}
                                                    className="w-full btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </form>
                                    </div>
                                </div>

                                {/* Products Grid */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-2xl font-bold mb-6">All Products ({products.length})</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[800px] overflow-y-auto pr-2">
                                        {products.map(product => (
                                            <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                                                <div className="relative h-48">
                                                    <img src={product.Image} alt={product.name} className="w-full h-full object-cover" />
                                                    <div className="absolute top-3 right-3 flex gap-2">
                                                        <button
                                                            onClick={() => startEditProduct(product)}
                                                            className="bg-white p-2 rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
                                                        >
                                                            <FiEdit2 className="w-5 h-5 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteProduct(product.id)}
                                                            className="bg-white p-2 rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-5 h-5 text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="p-4">
                                                    <h4 className="font-bold text-gray-900 text-lg mb-1 truncate">{product.name}</h4>
                                                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-2xl font-bold text-primary">₹{product.price}</p>
                                                        <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">
                                                            {categories.find(c => c.id === product.categoryId)?.name || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Categories Tab */}
                    {view === 'categories' && (
                        <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Form */}
                                <div className="lg:col-span-1">
                                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 sticky top-24">
                                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                            <FiPlus className="w-6 h-6" />
                                            {editingCategory ? 'Edit' : 'Add New'} Category
                                        </h3>
                                        <form onSubmit={handleCategorySubmit} className="space-y-4">
                                            <input
                                                type="text"
                                                placeholder="Category Name (e.g., Gym, Cloths, Footwear)"
                                                value={categoryForm.name}
                                                onChange={(e) => setCategoryForm({ name: e.target.value })}
                                                className="input-field"
                                                required
                                            />
                                            <div className="space-y-2">
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors relative">
                                                    {categoryPreview ? (
                                                        <div className="relative h-32 w-full">
                                                            <img src={categoryPreview} alt="Preview" className="h-full w-full object-contain rounded" />
                                                            <button
                                                                type="button"
                                                                onClick={() => { setCategoryImage(null); setCategoryPreview(null); }}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <FiImage className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                                            <p className="text-xs text-gray-500 mb-2">Click to upload category image</p>
                                                        </>
                                                    )}
                                                    <input
                                                        type="file"
                                                        onChange={handleCategoryImageChange}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        required={!editingCategory}
                                                        accept="image/*"
                                                    />
                                                </div>
                                            </div>
                                            <button type="submit" className="w-full btn btn-primary py-3 text-lg">
                                                {editingCategory ? 'Update' : 'Create'} Category
                                            </button>
                                            {editingCategory && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategory(null);
                                                        setCategoryForm({ name: '' });
                                                        setCategoryImage(null);
                                                    }}
                                                    className="w-full btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </form>
                                    </div>
                                </div>

                                {/* Categories Grid */}
                                <div className="lg:col-span-2">
                                    <h3 className="text-2xl font-bold mb-6">All Categories ({categories.length})</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {categories.map(category => (
                                            <div key={category.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
                                                <div className="relative h-48">
                                                    <img src={category.Image} alt={category.name} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                                    <div className="absolute bottom-4 left-4 right-4">
                                                        <h4 className="font-bold text-white text-xl mb-1">{category.name}</h4>
                                                        <p className="text-white/80 text-sm">
                                                            {products.filter(p => p.categoryId === category.id).length} Products
                                                        </p>
                                                    </div>
                                                    <div className="absolute top-3 right-3 flex gap-2">
                                                        <button
                                                            onClick={() => startEditCategory(category)}
                                                            className="bg-white p-2 rounded-lg shadow-lg hover:bg-blue-50 transition-colors"
                                                        >
                                                            <FiEdit2 className="w-5 h-5 text-blue-600" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteCategory(category.id)}
                                                            className="bg-white p-2 rounded-lg shadow-lg hover:bg-red-50 transition-colors"
                                                        >
                                                            <FiTrash2 className="w-5 h-5 text-red-600" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default OwnerDashboard;
