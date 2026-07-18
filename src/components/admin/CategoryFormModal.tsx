import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess: () => void;
}

export default function CategoryFormModal({ isOpen, onClose, category, onSuccess }: CategoryFormModalProps) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
    } else {
      setName('');
    }
    setError(null);
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError("Category name cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      if (category) {
        // Update existing
        const { error: updateError } = await supabase
          .from('categories')
          .update({ name: name.trim() })
          .eq('id', category.id);

        if (updateError) throw updateError;
      } else {
        // Create new
        const { error: insertError } = await supabase
          .from('categories')
          .insert([{ name: name.trim() }]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-primary/50 overflow-y-auto">
      <div className="bg-brand-bg w-full max-w-md rounded-[16px] shadow-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-brand-primary/10 bg-brand-peach">
          <h2 className="text-2xl font-heading text-[#115E63]">
            {category ? 'Edit Category' : 'Add New Category'}
          </h2>
          <button onClick={onClose} className="text-[#115E63] hover:bg-brand-primary/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-brand-accent/20 border border-brand-accent text-[#115E63] rounded-[10px] text-sm">
              {error}
            </div>
          )}

          <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[#115E63] text-sm font-bold">Category Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Necklaces"
                className="w-full bg-brand-bg border border-brand-primary/20 rounded-[10px] px-4 py-3 text-[#115E63] focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-brand-primary/10 bg-brand-bg flex justify-end gap-4 mt-auto">
          <button 
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-[10px] text-[#115E63] font-bold hover:bg-brand-primary/5 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            form="category-form"
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-brand-primary text-[#115E63] rounded-[10px] font-bold hover:bg-brand-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting ? 'Saving...' : 'Save Category'}
          </button>
        </div>

      </div>
    </div>
  );
}
