import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../services/supabase';

export default function Dashboard() {
  const [productCount, setProductCount] = useState<number | string>('--');
  const [categoryCount, setCategoryCount] = useState<number | string>('--');
  const [featuredCount, setFeaturedCount] = useState<number | string>('--');

  useEffect(() => {
    async function fetchCounts() {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('featured'),
        supabase.from('categories').select('*', { count: 'exact', head: true })
      ]);

      if (!productsRes.error && productsRes.data) {
        setProductCount(productsRes.data.length);
        setFeaturedCount(productsRes.data.filter(p => p.featured).length);
      }
      
      if (!categoriesRes.error && categoriesRes.count !== null) {
        setCategoryCount(categoriesRes.count);
      }
    }
    
    fetchCounts();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-4xl font-heading text-[#115E63] mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm">
          <h2 className="text-lg text-[#115E63]/70 mb-2 font-bold">Total Products</h2>
          <p className="text-4xl font-heading text-[#115E63]">{productCount}</p>
        </div>
        <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm">
          <h2 className="text-lg text-[#115E63]/70 mb-2 font-bold">Categories</h2>
          <p className="text-4xl font-heading text-[#115E63]">{categoryCount}</p>
        </div>
        <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm">
          <h2 className="text-lg text-[#115E63]/70 mb-2 font-bold">Featured Products</h2>
          <p className="text-4xl font-heading text-[#115E63]">{featuredCount}</p>
        </div>
      </div>
    </AdminLayout>
  );
}
