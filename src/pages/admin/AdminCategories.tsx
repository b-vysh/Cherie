import { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';
import CategoryFormModal from '../../components/admin/CategoryFormModal';
import ConfirmModal from '../../components/admin/ConfirmModal';

type Category = Database['public']['Tables']['categories']['Row'];

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<{id: string, name: string} | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
      
    if (error) {
      toast.error('Failed to fetch categories');
    } else if (data) {
      setCategories(data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const confirmDelete = (id: string, name: string) => {
    setCategoryToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    const { id, name } = categoryToDelete;
    
    const { error } = await supabase.from('categories').delete().eq('id', id);
    
    if (error) {
      if (error.code === '23503') { // Foreign key violation
        toast.error(`Cannot delete "${name}" because it contains products. Please reassign or delete those products first.`);
      } else {
        toast.error(`Failed to delete category: ${error.message}`);
      }
    } else {
      toast.success(`Deleted category "${name}"`);
      fetchCategories(); // Refresh list
    }
  };

  const openAddModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  // Filter categories locally by search query
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-heading text-[#115E63]">Categories</h1>
        
        <button 
          onClick={openAddModal}
          className="bg-brand-primary text-[#115E63] px-6 py-3 rounded-[10px] font-bold flex items-center gap-2 hover:bg-brand-primary/90 transition-colors flex-shrink-0"
        >
          <Plus size={20} />
          <span>Add Category</span>
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
            placeholder="Search categories by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '3rem' }}
            className="w-full block pr-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
          />
        </div>

        {/* Data Table Wrapper */}
        <div className="overflow-x-auto w-full flex-1 min-h-[400px]">
          {isLoading ? (
            <div className="py-20 text-center text-[#115E63] animate-pulse font-bold">Loading categories...</div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-20 text-center text-[#115E63]/70 font-bold">No categories found.</div>
          ) : (
            <table className="w-full min-w-[600px] text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 text-[#115E63]">
                  <th className="py-4 px-4 font-heading text-lg">Category Name</th>
                  <th className="py-4 px-4 font-heading text-lg">Created At</th>
                  <th className="py-4 px-4 font-heading text-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="border-b border-brand-primary/5 hover:bg-brand-bg/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-[#115E63]">{category.name}</td>
                    <td className="py-4 px-4 text-[#115E63]/70 text-sm">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right space-x-2">
                      <button 
                        onClick={() => openEditModal(category)}
                        className="p-2 text-[#115E63] hover:bg-brand-primary/10 rounded-lg transition-colors inline-flex"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => confirmDelete(category.id, category.name)}
                        className="p-2 text-[#115E63] hover:bg-[#115E63]/10 rounded-lg transition-colors inline-flex"
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
      <CategoryFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchCategories();
          toast.success(selectedCategory ? 'Category updated successfully!' : 'Category created successfully!');
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This cannot be undone.`}
        confirmText="Delete"
      />

    </AdminLayout>
  );
}
