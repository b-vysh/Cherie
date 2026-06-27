import { X } from 'lucide-react';
import type { Database } from '../../types/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function Sidebar({ isOpen, onClose, categories, selectedCategoryId, onSelectCategory }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-primary/20 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-brand-primary border-r border-[#115E63]/10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 h-full flex flex-col">
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-xl font-heading text-[#115E63]">Categories</h2>
            <button onClick={onClose} className="text-[#115E63]">
              <X size={24} />
            </button>
          </div>
          
          <h2 className="hidden md:block text-2xl font-heading text-[#115E63] mb-6">Collections</h2>
          
          <nav className="flex-1 space-y-2 overflow-y-auto">
            <button
              onClick={() => {
                onSelectCategory(null);
                onClose(); // Close on mobile after selection
              }}
              className={`
                w-full text-left px-4 py-2 rounded-lg transition-colors
                ${selectedCategoryId === null ? 'bg-[#115E63]/10 text-[#115E63] font-bold' : 'text-[#115E63] hover:bg-[#115E63]/5'}
              `}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  onSelectCategory(category.id);
                  onClose(); // Close on mobile after selection
                }}
                className={`
                  w-full text-left px-4 py-2 rounded-lg transition-colors
                  ${selectedCategoryId === category.id ? 'bg-[#115E63]/10 text-[#115E63] font-bold' : 'text-[#115E63] hover:bg-[#115E63]/5'}
                `}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
