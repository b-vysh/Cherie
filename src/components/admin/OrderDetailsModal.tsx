import { useState } from 'react';
import { X, ExternalLink, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '../../services/supabase';
import type { Database } from '../../types/database.types';

type Order = Database['public']['Tables']['orders']['Row'];
type OrderItem = Database['public']['Tables']['order_items']['Row'];

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  orderItems: OrderItem[];
  onStatusChange: (id: string, newStatus: string) => void;
}

export default function OrderDetailsModal({ isOpen, onClose, order, orderItems, onStatusChange }: OrderDetailsModalProps) {
  const [loadingProof, setLoadingProof] = useState(false);

  if (!isOpen || !order) return null;

  const handleViewScreenshot = async () => {
    if (!order.payment_proof_url) return;

    try {
      setLoadingProof(true);
      const url = order.payment_proof_url;
      
      // Extract file path from stored URL or path
      let filePath = '';
      if (url.includes('/payment_proofs/')) {
        filePath = url.split('/payment_proofs/')[1].split('?')[0];
      } else if (url.includes('/payment-receipts/')) {
        filePath = url.split('/payment-receipts/')[1].split('?')[0];
      } else {
        const parts = url.split('/');
        filePath = parts[parts.length - 1].split('?')[0];
      }

      // Try creating signed URL (works for private buckets)
      const { data, error } = await supabase.storage
        .from('payment_proofs')
        .createSignedUrl(decodeURIComponent(filePath), 60 * 60); // 1 hour expiry

      if (!error && data?.signedUrl) {
        window.open(data.signedUrl, '_blank');
      } else {
        // Fallback to direct URL if public or bucket is different
        window.open(url, '_blank');
      }
    } catch {
      // Direct link fallback
      window.open(order.payment_proof_url, '_blank');
    } finally {
      setLoadingProof(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-primary/50 backdrop-blur-sm">
      <div className="bg-brand-bg w-full max-w-3xl rounded-[16px] shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-brand-primary/10">
          <div>
            <h2 className="text-2xl font-heading text-[#115E63]">Order Details</h2>
            <p className="text-sm text-[#115E63]/70 font-mono mt-1 font-bold tracking-wider">#{order.id.split('-')[0].toUpperCase()}</p>
          </div>
          <button onClick={onClose} className="text-[#115E63] hover:bg-brand-primary/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 text-[#115E63]">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg border-b border-brand-primary/10 pb-2">Customer Information</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Name:</span> {order.customer_name}</p>
                <p><span className="font-bold">Phone:</span> {order.customer_phone}</p>
                {order.customer_insta && (
                  <p><span className="font-bold">Instagram:</span> {order.customer_insta}</p>
                )}
                <div>
                  <span className="font-bold">Address:</span>
                  <p className="whitespace-pre-wrap mt-1 bg-brand-primary/5 p-3 rounded-lg">{order.customer_address}</p>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="space-y-4">
              <h3 className="font-heading text-lg border-b border-brand-primary/10 pb-2">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-bold">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
                <p><span className="font-bold">Total Amount:</span> ₹{order.total_amount}</p>
                <div className="flex items-center gap-2">
                  <span className="font-bold">Status:</span>
                  <select 
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value)}
                    className="bg-brand-primary/10 border border-brand-primary/20 rounded-md px-2 py-1 focus:outline-none focus:border-brand-primary font-bold"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                
                {/* Payment Proof */}
                <div className="pt-4 mt-4 border-t border-brand-primary/10">
                  <span className="font-bold block mb-2">Payment Verification:</span>
                  {order.payment_utr && (
                    <p className="mb-2"><span className="font-bold text-[#115E63]/70">UTR:</span> {order.payment_utr}</p>
                  )}
                  {order.payment_proof_url ? (
                    <button 
                      onClick={handleViewScreenshot}
                      disabled={loadingProof}
                      className="inline-flex items-center gap-2 bg-brand-primary/10 hover:bg-brand-primary/20 px-4 py-2 rounded-lg transition-colors text-sm font-bold text-[#115E63] disabled:opacity-50 cursor-pointer"
                    >
                      {loadingProof ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                      View Screenshot
                      <ExternalLink size={14} />
                    </button>
                  ) : (
                    !order.payment_utr && <p className="text-brand-accent text-xs italic">No payment proof provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.order_notes && (
            <div className="mb-8">
              <h3 className="font-heading text-lg border-b border-brand-primary/10 pb-2 mb-3">Order Notes</h3>
              <p className="whitespace-pre-wrap bg-brand-peach p-4 rounded-[10px] text-sm italic">"{order.order_notes}"</p>
            </div>
          )}

          {/* Items */}
          <div>
            <h3 className="font-heading text-lg border-b border-brand-primary/10 pb-2 mb-4">Items Ordered</h3>
            <div className="bg-white rounded-[10px] overflow-hidden border border-brand-primary/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-brand-primary/5">
                  <tr>
                    <th className="py-3 px-4 text-left font-body text-sm text-[#115E63]/70">Item</th>
                    <th className="py-3 px-4 text-left font-body text-sm text-[#115E63]/70">Qty</th>
                    <th className="py-3 px-4 text-left font-body text-sm text-[#115E63]/70">Price</th>
                    <th className="py-3 px-4 font-bold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-primary/10">
                  {orderItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#115E63]">{item.product_name || `Product #${item.product_id?.substring(0, 8)}`}</div>
                      </td>
                      <td className="py-3 px-4 text-[#115E63]">{item.quantity}</td>
                      <td className="py-3 px-4 text-[#115E63]">₹{item.price}</td>
                      <td className="py-3 px-4 text-right font-bold">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
