import { useEffect, useState } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../services/supabase';

export default function Dashboard() {
  const [productCount, setProductCount] = useState<number | string>('--');
  const [categoryCount, setCategoryCount] = useState<number | string>('--');
  const [featuredCount, setFeaturedCount] = useState<number | string>('--');
  const [orderCount, setOrderCount] = useState<number | string>('--');
  const [pendingOrders, setPendingOrders] = useState<number | string>('--');
  const [totalRevenue, setTotalRevenue] = useState<number | string>('--');

  useEffect(() => {
    async function fetchCounts() {
      // Run all queries in parallel; each is optimised to only fetch what's needed
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        // Only fetch 'featured' column — avoids transferring image_url, description, etc.
        supabase.from('products').select('featured', { count: 'exact' }),

        // head:true = no rows transferred, just the count
        supabase.from('categories').select('*', { count: 'exact', head: true }),

        // Only fetch status + total_amount — avoids joining all order_items
        supabase.from('orders').select('status, total_amount'),
      ]);

      if (!productsRes.error && productsRes.data) {
        setProductCount(productsRes.count ?? productsRes.data.length);
        setFeaturedCount(productsRes.data.filter(p => p.featured).length);
      }
      
      if (!categoriesRes.error && categoriesRes.count !== null) {
        setCategoryCount(categoriesRes.count);
      }
      
      if (!ordersRes.error && ordersRes.data) {
        setOrderCount(ordersRes.data.length);
        
        const pending = ordersRes.data.filter(o => o.status === 'Pending').length;
        setPendingOrders(pending);
        
        // Sum total_amount from orders (pre-computed at order time), excluding cancelled
        const revenue = ordersRes.data
          .filter(o => o.status !== 'Cancelled')
          .reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
        setTotalRevenue(revenue);
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
        <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm">
          <h2 className="text-lg text-[#115E63]/70 mb-2 font-bold">Total Orders</h2>
          <p className="text-4xl font-heading text-[#115E63]">{orderCount}</p>
        </div>
        <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm border-2 border-brand-accent/20">
          <h2 className="text-lg text-[#115E63]/70 mb-2 font-bold">Pending Actions</h2>
          <p className="text-4xl font-heading text-[#115E63]">{pendingOrders}</p>
        </div>
        <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm">
          <h2 className="text-lg text-[#115E63]/70 mb-2 font-bold">Total Revenue</h2>
          <p className="text-4xl font-heading text-[#115E63]">
            {typeof totalRevenue === 'number' ? `₹${totalRevenue.toLocaleString('en-IN')}` : totalRevenue}
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
