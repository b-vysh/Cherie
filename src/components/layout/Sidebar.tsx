import { useEffect, useState } from 'react';
import { X, Phone } from 'lucide-react';
import type { Database } from '../../types/database.types';
import { supabase } from '../../services/supabase';

type Category = Database['public']['Tables']['categories']['Row'];

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export default function Sidebar({ isOpen, onClose, categories, selectedCategoryId, onSelectCategory }: SidebarProps) {
  const [settings, setSettings] = useState<{whatsapp: string, insta: string} | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number, instagram_url')
        .limit(1)
        .single();
      if (data) {
        setSettings({
          whatsapp: data.whatsapp_number || '',
          insta: data.instagram_url || ''
        });
      }
    }
    fetchSettings();
  }, []);

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
        h-full
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

          {/* Sidebar Footer */}
          <div className="mt-6 pt-6 border-t border-[#115E63]/20 space-y-4 flex-shrink-0">
            <a 
              href={settings?.insta || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center gap-3 text-[#115E63] hover:opacity-70 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span className="font-semibold text-sm">cherie.io_</span>
            </a>
            <a 
              href={settings?.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, '')}` : '#'}
              target="_blank"
              rel="noopener noreferrer" 
              className="flex items-center gap-3 text-[#115E63] hover:opacity-70 transition-opacity"
            >
              <Phone size={20} />
              <span className="font-semibold text-sm">{settings?.whatsapp || 'Setup WhatsApp'}</span>
            </a>
            
            <div className="pt-2 text-[#115E63] text-sm font-semibold flex flex-col gap-1 items-start">
              <p>Made with ❤️</p>
              <p>By Vysh 👑</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
