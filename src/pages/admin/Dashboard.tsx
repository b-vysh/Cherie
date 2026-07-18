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
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        supabase.from('products').select('featured'),
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('status, order_items(price, quantity)')
      ]);

      if (!productsRes.error && productsRes.data) {
        setProductCount(productsRes.data.length);
        setFeaturedCount(productsRes.data.filter(p => p.featured).length);
      }
      
      if (!categoriesRes.error && categoriesRes.count !== null) {
        setCategoryCount(categoriesRes.count);
      }
      
      if (!ordersRes.error && ordersRes.data) {
        setOrderCount(ordersRes.data.length);
        
        // Calculate pending orders
        const pending = ordersRes.data.filter(o => o.status === 'Pending').length;
        setPendingOrders(pending);
        
        // Calculate total revenue (excluding cancelled orders and excluding shipping)
        const revenue = ordersRes.data
          .filter(o => o.status !== 'Cancelled')
          .reduce((sum, order) => {
            const items = (order.order_items as any[]) || [];
            const orderItemsTotal = items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
            return sum + orderItemsTotal;
          }, 0);
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
