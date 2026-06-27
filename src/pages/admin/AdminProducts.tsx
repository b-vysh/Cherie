import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';
import ProductFormModal from '../../components/admin/ProductFormModal';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProductsAndCategories = async () => {
    setIsLoading(true);
    
    // Fetch Categories
    const { data: categoryData } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (categoryData) setCategories(categoryData);

    // Fetch Products
    const { data: productData } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (productData) setProducts(productData);
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchProductsAndCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      await supabase.from('products').delete().eq('id', id);
      fetchProductsAndCategories(); // Refresh list
      toast.success(`Deleted ${name}`);
    }
  };

  const openAddModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const getCategoryName = (id: string | null) => {
    if (!id) return 'Uncategorized';
    return categories.find(c => c.id === id)?.name || 'Unknown';
  };

  const toggleVisibility = async (product: Product) => {
    const newStatus = !product.visible;
    
    // Optimistic UI update
    setProducts(products.map(p => p.id === product.id ? { ...p, visible: newStatus } : p));
    
    // Database update
    const { error } = await supabase
      .from('products')
      .update({ visible: newStatus })
      .eq('id', product.id);
      
    if (error) {
      toast.error("Failed to update visibility");
      fetchProductsAndCategories(); // Revert on error
    } else {
      toast.success(newStatus ? 'Product is now visible' : 'Product hidden from store');
    }
  };

  // Filter products locally by search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-heading text-[#115E63]">Products</h1>
        
        <button 
          onClick={openAddModal}
          className="bg-brand-primary text-[#115E63] px-6 py-3 rounded-[10px] font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-colors flex-shrink-0"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      <div className="bg-brand-peach p-4 md:p-6 rounded-[16px] shadow-sm flex flex-col h-full">
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
            <Search className="text-[#115E63]/50" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '3rem' }}
            className="w-full block pr-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* Data Table Wrapper */}
        <div className="overflow-x-auto w-full flex-1 min-h-[400px]">
          {isLoading ? (
            <div className="py-20 text-center text-[#115E63] animate-pulse font-bold">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center text-[#115E63]/70 font-bold">No products found.</div>
          ) : (
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 text-[#115E63]">
                  <th className="py-4 px-4 font-heading text-lg">Product</th>
                  <th className="py-4 px-4 font-heading text-lg">Price</th>
                  <th className="py-4 px-4 font-heading text-lg">Category</th>
                  <th className="py-4 px-4 font-heading text-lg">Status</th>
                  <th className="py-4 px-4 font-heading text-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-brand-primary/5 hover:bg-brand-bg/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-brand-bg rounded-lg overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#115E63]/30 text-[10px]">No Image</div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#115E63]">{product.name}</p>
                          {product.featured && (
                            <span className="inline-flex items-center gap-1 text-brand-accent text-xs font-bold mt-1">
                              <Star size={12} fill="currentColor" /> Featured
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#115E63]">₹{product.price}</td>
                    <td className="py-4 px-4 text-[#115E63]/80">
                      <span className="bg-brand-primary/5 px-3 py-1 rounded-full text-sm font-bold">
                        {getCategoryName(product.category_id)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button 
                        onClick={() => toggleVisibility(product)}
                        className={`inline-flex items-center gap-1 font-bold text-sm px-3 py-1 rounded-full transition-colors ${
                          product.visible 
                            ? 'text-brand-green bg-brand-green/10 hover:bg-brand-green/20' 
                            : 'text-[#115E63]/50 bg-brand-primary/5 hover:bg-brand-primary/10'
                        }`}
                        title={product.visible ? "Click to hide from store" : "Click to show on store"}
                      >
                        {product.visible ? (
                          <><Eye size={14} /> Visible</>
                        ) : (
                          <><EyeOff size={14} /> Hidden</>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="p-2 text-[#115E63] hover:bg-brand-primary/10 rounded-lg transition-colors inline-flex"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="p-2 text-brand-accent hover:bg-brand-accent/10 rounded-lg transition-colors inline-flex"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <ProductFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        categories={categories}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchProductsAndCategories();
        }}
      />

    </AdminLayout>
  );
}
