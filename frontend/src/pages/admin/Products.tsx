import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Filter, Edit2, Trash2, 
  ExternalLink, MoreVertical, ChevronLeft, ChevronRight, X 
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import adminAxios from '@config/adminAxios';
import { cn } from '@utils/cn';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';
import Badge from '@components/ui/Badge';
import toast from 'react-hot-toast';

const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      const { data } = await adminAxios.get(`/products?search=${search}&admin=true`);
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await adminAxios.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted successfully');
    },
  });

  const products = productsData?.products || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black font-display italic uppercase tracking-tighter">Products</h1>
          <p className="text-sm text-brand-text-muted mt-1">Manage your catalog, stock, and pricing</p>
        </div>
        <Button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }} size="lg">
          <Plus className="mr-2" size={20} /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-brand-xl border border-brand-border shadow-brand-sm flex flex-col md:flex-row gap-4">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, SKU, or tags..."
            className="w-full pl-12 pr-4 py-3 bg-brand-surface-alt rounded-brand-md border-2 border-transparent focus:border-brand-accent transition-all outline-none text-sm font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="px-6">
            <Filter className="mr-2" size={18} /> Filter
          </Button>
          <Button variant="outline" className="px-6">Export</Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-brand-xl border border-brand-border shadow-brand-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-surface-alt border-b border-brand-border">
              <tr className="text-left">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Product</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Price</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Stock</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Status</th>
                <th className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-brand-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-8 py-6 h-20 animate-pulse bg-brand-surface-alt/50" />
                  </tr>
                ))
              ) : products.map((product: any) => (
                <tr key={product.id} className="hover:bg-brand-surface-alt/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img src={product.images[0]} className="w-12 h-12 rounded-brand-md object-cover flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold uppercase tracking-tight">{product.name}</p>
                        <p className="text-[10px] font-mono text-brand-text-muted uppercase">SKU: {product.sku || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant="outline" className="text-[10px]">{product.category.name}</Badge>
                  </td>
                  <td className="px-8 py-6 text-sm font-black font-mono">₹{product.price}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock < 5 ? "bg-brand-error" : product.stock < 20 ? "bg-brand-warning" : "bg-brand-success"
                      )} />
                      <span className="text-sm font-bold font-mono">{product.stock}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button className={cn(
                      "w-12 h-6 rounded-full relative transition-all duration-300",
                      product.isActive ? "bg-brand-success" : "bg-brand-text-muted"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                        product.isActive ? "left-7" : "left-1"
                      )} />
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setEditingProduct(product); setIsModalOpen(true); }}
                        className="p-2 text-brand-text-muted hover:text-brand-accent transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Delete product?')) deleteMutation.mutate(product.id); }}
                        className="p-2 text-brand-text-muted hover:text-brand-error transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 border-t border-brand-border flex items-center justify-between">
          <p className="text-xs text-brand-text-muted font-bold uppercase">Showing {products.length} of {productsData?.total || 0} products</p>
          <div className="flex gap-2">
            <button className="p-2 rounded-brand-md border border-brand-border hover:bg-brand-surface-alt disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="p-2 rounded-brand-md border border-brand-border hover:bg-brand-surface-alt">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              className="fixed inset-y-0 right-0 w-full max-w-3xl bg-white z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-8 border-b border-brand-border flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-black font-display italic uppercase tracking-tighter">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-brand-surface-alt rounded-full">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Product Name" placeholder="e.g. Elite Whey Isolate" defaultValue={editingProduct?.name} />
                  <Input label="SKU" placeholder="e.g. APZ-WHEY-01" defaultValue={editingProduct?.sku} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Description</label>
                  <textarea 
                    className="w-full bg-brand-surface-alt border-2 border-brand-border rounded-brand-md p-4 text-sm font-bold focus:border-brand-accent transition-all outline-none h-48 resize-none"
                    placeholder="Describe the performance benefits..."
                    defaultValue={editingProduct?.description}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Input label="Price (₹)" type="number" defaultValue={editingProduct?.price} />
                  <Input label="Compare Price (₹)" type="number" defaultValue={editingProduct?.comparePrice} />
                  <Input label="Stock Quantity" type="number" defaultValue={editingProduct?.stock} />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black uppercase tracking-widest text-brand-text-muted">Product Images</label>
                  <div className="grid grid-cols-4 gap-4">
                    {editingProduct?.images?.map((img: string, i: number) => (
                      <div key={i} className="aspect-square rounded-brand-md overflow-hidden border-2 border-brand-border relative group">
                        <img src={img} className="w-full h-full object-cover" />
                        <button className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    <button className="aspect-square rounded-brand-md border-2 border-dashed border-brand-border flex flex-col items-center justify-center text-brand-text-muted hover:border-brand-accent hover:text-brand-accent transition-all">
                      <Plus size={32} />
                      <span className="text-[10px] font-black uppercase tracking-widest mt-2">Upload</span>
                    </button>
                  </div>
                </div>

                <div className="flex gap-4 pt-10 border-t border-brand-border">
                  <Button variant="outline" fullWidth onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button fullWidth>{editingProduct ? 'Update Product' : 'Create & Publish'}</Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
