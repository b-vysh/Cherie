import { useEffect, useState } from 'react';
import { Search, Plus, Minus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import MainLayout from '../components/layout/MainLayout';
import { supabase } from '../services/supabase';
import type { Database } from '../types/database.types';
import { useCart } from '../context/CartContext';
import Skeleton from '../components/ui/Skeleton';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type SortOption = 'newest' | 'price_asc' | 'price_desc';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();

  // Fetch Categories
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  // Fetch Products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*')
          .eq('visible', true);

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }

        if (searchQuery.trim()) {
          query = query.ilike('name', `%${searchQuery.trim()}%`);
        }

        if (sortBy === 'newest') {
          // Keep featured on top for default view, then newest
          query = query.order('featured', { ascending: false }).order('created_at', { ascending: false });
        } else if (sortBy === 'price_asc') {
          query = query.order('price', { ascending: true });
        } else if (sortBy === 'price_desc') {
          query = query.order('price', { ascending: false });
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    }

    const timeoutId = setTimeout(() => {
      fetchProducts();
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`Added ${product.name} to cart!`);
  };

  return (
    <MainLayout 
      sidebarProps={{
        categories,
        selectedCategoryId: selectedCategory,
        onSelectCategory: setSelectedCategory
      }}
    >
      <div className="max-w-6xl mx-auto relative">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <h1 className="text-4xl font-heading text-[#115E63]">Our Collection</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#115E63]/50" size={18} />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-brand-bg border border-brand-primary rounded-[10px] text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="pl-4 pr-10 py-2 bg-brand-bg border border-brand-primary rounded-[10px] text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
        
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-brand-peach rounded-[16px] p-4 shadow-sm flex flex-col h-[300px]">
                <Skeleton className="w-full h-48 mb-4 rounded-xl" />
                <Skeleton className="w-3/4 h-6 mb-2" />
                <Skeleton className="w-1/2 h-6 mt-auto" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-brand-peach border border-brand-accent text-[#115E63] p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className="text-center py-20 text-[#115E63]/70">
            No products match your criteria.
          </div>
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => {
              const cartItem = cart.find(item => item.id === product.id);
              
              return (
              <div key={product.id} className="bg-brand-peach rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col relative group">
                <div 
                  className={`aspect-square bg-brand-bg rounded-xl mb-4 overflow-hidden flex items-center justify-center relative ${product.image_url ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                  onClick={() => product.image_url && setSelectedImage(product.image_url)}
                >
                  {product.featured && (
                    <div className="absolute top-2 right-2 z-10 bg-brand-accent text-[#115E63] text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md">
                      Featured
                    </div>
                  )}
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[#115E63]/30 text-sm">No Image</span>
                  )}
                </div>
                <h3 className="font-body font-bold text-lg md:text-xl text-[#115E63] mb-1 line-clamp-2">{product.name}</h3>
                <div className="mt-auto pt-4">
                  <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-3">
                    <span className="font-bold text-[#115E63] text-lg">₹{product.price}</span>
                    {cartItem ? (
                      <div className="flex items-center justify-between bg-brand-bg rounded-[10px] border border-brand-primary/20 w-full xl:w-auto overflow-hidden">
                        <button 
                          onClick={() => {
                            if (cartItem.quantity > 1) {
                              updateQuantity(product.id, cartItem.quantity - 1);
                            } else {
                              removeFromCart(product.id);
                              toast.success(`Removed from cart`);
                            }
                          }}
                          className="px-3 py-2 text-[#115E63] hover:bg-brand-primary/10 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-[#115E63] text-sm px-2 w-6 text-center">{cartItem.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          className="px-3 py-2 text-[#115E63] hover:bg-brand-primary/10 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-[#115E63] text-brand-primary px-3 py-2 rounded-[10px] text-sm font-semibold hover:bg-[#115E63]/90 transition-colors flex-1 xl:flex-none flex-shrink-0"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white hover:text-brand-primary transition-colors p-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Product full view" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
          />
        </div>
      )}
    </MainLayout>
  );
}
