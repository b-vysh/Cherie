import { useEffect, useState } from 'react';
import { Eye, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);

  const fetchOrders = async () => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast.error('Failed to fetch orders');
    } else if (data) {
      setOrders(data);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const openOrderModal = async (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
    setSelectedOrderItems([]); // Clear previous

    // Fetch items for this order
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);
      
    if (error) {
      toast.error('Failed to load order items');
    } else if (data) {
      setSelectedOrderItems(data);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Failed to update status');
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      // Update local state to reflect change without refetching everything
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  // Filter orders by ID or customer name/phone and status
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customer_phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'All' || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-heading text-[#115E63]">Orders</h1>
      </div>

      <div className="bg-brand-peach p-4 md:p-6 rounded-[16px] shadow-sm flex flex-col h-full">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="text-[#115E63]/50" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search by Order ID, Name, or Phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '3rem' }}
              className="w-full block pr-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-48 px-4 py-3 bg-brand-bg border border-brand-primary/20 rounded-[10px] text-[#115E63] focus:outline-none focus:border-brand-primary transition-colors font-bold"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto w-full flex-1 min-h-[400px]">
          {isLoading ? (
            <div className="py-20 text-center text-[#115E63] animate-pulse font-bold">Loading orders...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-[#115E63]/70 font-bold">No orders found.</div>
          ) : (
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-primary/10 text-[#115E63]">
                  <th className="py-4 px-4 font-heading text-lg">Order ID</th>
                  <th className="py-4 px-4 font-heading text-lg">Date</th>
                  <th className="py-4 px-4 font-heading text-lg">Customer</th>
                  <th className="py-4 px-4 font-heading text-lg">Amount</th>
                  <th className="py-4 px-4 font-heading text-lg">Status</th>
                  <th className="py-4 px-4 font-heading text-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-brand-primary/5 hover:bg-brand-bg/50 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm text-[#115E63]/70 font-bold uppercase tracking-wider">
                      #{order.id.split('-')[0]}
                    </td>
                    <td className="py-4 px-4 text-[#115E63] text-sm">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-[#115E63]">{order.customer_name}</p>
                      <p className="text-xs text-[#115E63]/70">{order.customer_phone}</p>
                    </td>
                    <td className="py-4 px-4 font-bold text-[#115E63]">₹{order.total_amount}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => openOrderModal(order)}
                        className="px-3 py-1.5 bg-[#115E63]/5 hover:bg-[#115E63]/10 text-[#115E63] rounded-lg transition-colors inline-flex items-center gap-2 text-sm font-bold"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <OrderDetailsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
        orderItems={selectedOrderItems}
        onStatusChange={handleStatusChange}
      />

    </AdminLayout>
  );
}
