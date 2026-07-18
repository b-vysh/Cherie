import { useEffect, useState } from 'react';
import { Search, Plus, Minus, X, Info } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
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
  
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  
  const setSelectedCategory = (id: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (id) {
      newParams.set('category', id);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFlippedCards(prev => ({ ...prev, [productId]: !prev[productId] }));
  };

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

  const categoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name || 'Our Collection'
    : 'Our Collection';

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
          <h1 className="text-4xl font-heading text-[#115E63]">{categoryName}</h1>
          
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
              
              const isFlipped = !!flippedCards[product.id];
              
              return (
              <div key={product.id} className="relative group [perspective:1000px]">
                <div className={`w-full transition-transform duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  
                  {/* Front of Card */}
                  <div className="w-full bg-brand-peach rounded-[16px] p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col relative [backface-visibility:hidden]">
                    <div 
                      className={`aspect-square bg-brand-bg rounded-xl mb-4 overflow-hidden flex items-center justify-center relative ${product.image_url ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''}`}
                      onClick={() => product.image_url && setSelectedImage(product.image_url)}
                    >
                      <button 
                        onClick={(e) => toggleFlip(product.id, e)}
                        className="absolute top-2 left-2 z-30 bg-white/80 backdrop-blur-sm text-[#115E63] p-1.5 rounded-full shadow-md hover:bg-brand-primary transition-colors"
                        title="View Description"
                      >
                        <Info size={18} />
                      </button>
                  {product.featured && (
                    <div className="absolute top-2 right-2 z-10 bg-brand-accent text-[#115E63] text-[10px] uppercase tracking-widest font-bold px-3 py-1 rounded-full shadow-md">
                      Featured
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 z-20 bg-brand-bg/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                      <span className="bg-brand-bg text-[#115E63] font-bold px-4 py-2 rounded-full border border-brand-primary shadow-sm text-sm transform -rotate-12">
                        Sold Out
                      </span>
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
                <div className="min-h-[3.5rem]">
                  <h3 className="font-body font-bold text-lg md:text-xl text-[#115E63] mb-1 line-clamp-2">{product.name}</h3>
                </div>
                

                
                <div className="mt-4 pt-4 border-t border-brand-primary/10">
                  <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-3">
                    <span className="font-bold text-[#115E63] text-lg">₹{product.price}</span>
                    {cartItem ? (
                      <div className="flex items-center justify-between bg-brand-bg rounded-[10px] border border-brand-primary/20 w-full xl:w-auto overflow-hidden">
                        <button 
                          onClick={() => {
                            if (cartItem.quantity > 1) {
                              updateQuantity(cartItem.cartItemId, cartItem.quantity - 1);
                            } else {
                              removeFromCart(cartItem.cartItemId);
                              toast.success(`Removed from cart`);
                            }
                          }}
                          className="px-3 py-2 text-[#115E63] hover:bg-brand-primary/10 transition-colors"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-[#115E63] text-sm px-2 w-6 text-center">{cartItem.quantity}</span>
                        <button 
                          onClick={() => {
                            if (cartItem.quantity < product.stock) {
                              updateQuantity(cartItem.cartItemId, cartItem.quantity + 1);
                            } else {
                              toast.error(`Only ${product.stock} available in stock`);
                            }
                          }}
                          disabled={cartItem.quantity >= product.stock}
                          className={`px-3 py-2 transition-colors ${cartItem.quantity >= product.stock ? 'text-[#115E63]/30 cursor-not-allowed' : 'text-[#115E63] hover:bg-brand-primary/10'}`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : product.stock === 0 ? (
                      <button 
                        disabled
                        className="bg-brand-primary/30 text-[#115E63]/50 px-3 py-2 rounded-[10px] text-sm font-semibold flex-1 xl:flex-none flex-shrink-0 cursor-not-allowed"
                      >
                        Sold Out
                      </button>
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

              {/* Back of Card (Description) */}
              <div className="absolute inset-0 w-full h-full bg-brand-peach rounded-[16px] p-6 shadow-md flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)] border-2 border-brand-primary/10">
                <div className="flex justify-between items-center mb-4 border-b border-brand-primary/10 pb-3">
                  <h3 className="font-heading text-xl text-[#115E63]">Description</h3>
                  <button 
                    onClick={(e) => toggleFlip(product.id, e)}
                    className="text-[#115E63]/60 hover:text-[#115E63] bg-white rounded-full p-1 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-[#115E63]/80 text-sm whitespace-pre-wrap leading-relaxed">
                    {product.description || 'No description available for this beautiful piece.'}
                  </p>
                </div>
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
