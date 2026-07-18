import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
  onSuccess: () => void;
}

export default function ProductFormModal({ isOpen, onClose, product, categories, onSuccess }: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  const [variants, setVariants] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visible, setVisible] = useState(true);
  const [featured, setFeatured] = useState(false);
  
  // Image handling state
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setVariants(product.variants || '');
      setCategoryId(product.category_id || '');
      setVisible(product.visible || false);
      setFeatured(product.featured || false);
      setImageUrl(product.image_url);
      setImagePreview(product.image_url);
    } else {
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setStock('0');
      setVariants('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setVisible(true);
      setFeatured(false);
      setImageUrl(null);
      setImagePreview(null);
      setImageFile(null);
    }
    setError(null);
    setUploadProgress(null);
  }, [product, isOpen, categories]);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create local preview URL
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let finalImageUrl = imageUrl;

      // Handle image upload if a new file was selected
      if (imageFile) {
        setUploadProgress('Uploading image...');
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, imageFile, { upsert: true });

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}. Make sure 'product-images' bucket exists and is public.`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      setUploadProgress('Saving product details...');

      const productData = {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        variants: variants.trim() || null,
        category_id: categoryId,
        image_url: finalImageUrl,
        visible,
        featured
      };

      if (product) {
        // Update existing
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (updateError) throw updateError;
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/50 overflow-y-auto">
      <div className="bg-brand-bg w-full max-w-2xl rounded-[16px] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-brand-primary/10 bg-brand-peach">
          <h2 className="text-2xl font-heading text-[#115E63]">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-[#115E63] hover:bg-brand-primary/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-brand-accent/20 border border-brand-accent text-[#115E63] rounded-[10px] text-sm">
              {error}
            </div>
          )}

          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="block text-[#115E63] text-sm font-bold">Product Image</label>
              
              <div 
                className={`border-2 border-dashed rounded-[16px] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  imagePreview ? 'border-brand-primary/20 bg-brand-peach/50' : 'border-brand-primary/40 hover:border-brand-primary bg-brand-bg'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden group">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-brand-primary/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-[#115E63] font-bold flex items-center gap-2">
                        <Upload size={20} /> Change Image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center text-[#115E63]/60">
                    <ImageIcon size={48} className="mb-3 opacity-50" />
                    <p className="font-bold mb-1">Click to upload image</p>
                    <p className="text-sm">SVG, PNG, JPG or GIF</p>
                  </div>
                )}
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageSelect}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Name */}
              <div className="space-y-2 md:col-span-1">
                <label className="block text-[#115E63] text-sm font-bold">Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                />
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-[#115E63] text-sm font-bold">Price (₹)</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                />
              </div>

              {/* Stock */}
              <div className="space-y-2">
                <label className="block text-[#115E63] text-sm font-bold">Stock</label>
                <input 
                  type="number" 
                  required
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-[#115E63] text-sm font-bold">Category</label>
              <select 
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all appearance-none"
              >
                <option value="" disabled>Select a category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-[#115E63] text-sm font-bold">Description</label>
              <textarea 
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all resize-none"
              />
            </div>

            {/* Variants */}
            <div className="space-y-2">
              <label className="block text-[#115E63] text-sm font-bold">Variants (Optional)</label>
              <p className="text-xs text-[#115E63]/70">Enter options separated by commas (e.g., Gold, Silver, Rose Gold)</p>
              <input 
                type="text" 
                value={variants}
                onChange={(e) => setVariants(e.target.value)}
                placeholder="Gold, Silver"
                className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row gap-6 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={visible}
                  onChange={(e) => setVisible(e.target.checked)}
                  className="w-5 h-5 accent-brand-primary rounded border-brand-primary/20"
                />
                <span className="text-[#115E63] font-bold">Visible on Store</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 accent-brand-primary rounded border-brand-primary/20"
                />
                <span className="text-[#115E63] font-bold">Featured Product</span>
              </label>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-primary/10 bg-brand-bg flex justify-end gap-4">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-[10px] text-[#115E63] font-bold hover:bg-brand-primary/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            form="product-form"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-brand-primary text-[#115E63] rounded-[10px] font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? (
              <span className="animate-pulse">{uploadProgress || 'Saving...'}</span>
            ) : (
              'Save Product'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
