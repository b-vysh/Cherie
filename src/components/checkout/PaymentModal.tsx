import { useState, useRef } from 'react';
import { X, Upload, CheckCircle, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  upiId: string;
  payeeName: string;
  customerDetails: {
    name: string;
    phone: string;
    instaId: string;
    address: string;
    orderNotes: string;
  };
  cartItems: any[];
}

export default function PaymentModal({ isOpen, onClose, grandTotal, upiId, payeeName, customerDetails, cartItems }: PaymentModalProps) {
  const { clearCart } = useCart();
  const navigate = useNavigate();
  
  const [utr, setUtr] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Generate UPI URI
  const upiUri = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${grandTotal}&cu=INR`;
  
  // Use a reliable free QR API
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Please upload an image under 5MB.");
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file.");
        return;
      }
      setScreenshot(file);
    }
  };

  const compressImage = async (file: File): Promise<Blob> => {
    // Basic canvas compression to keep storage costs low
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas to Blob failed'));
          }, 'image/jpeg', 0.7); // 70% quality JPEG
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleCompleteOrder = async () => {
    if (!utr.trim() && !screenshot) {
      toast.error('Please provide a UTR number or upload a screenshot of the payment to verify your order.');
      return;
    }

    if (utr.trim() && utr.trim().length !== 12) {
      toast.error('UTR must be exactly 12 digits.');
      return;
    }

    setIsSubmitting(true);
    let paymentProofUrl = null;

    try {
      // 1. Upload screenshot if exists
      if (screenshot) {
        toast.loading('Uploading payment proof...', { id: 'checkout' });
        const compressedBlob = await compressImage(screenshot);
        const fileExt = 'jpg';
        const fileName = `proof_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('payment_proofs')
          .upload(fileName, compressedBlob, {
            contentType: 'image/jpeg'
          });

        if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('payment_proofs')
          .getPublicUrl(fileName);
          
        paymentProofUrl = publicUrl;
      }

      toast.loading('Saving your order...', { id: 'checkout' });

      // 2. Create Order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: customerDetails.name,
          customer_phone: customerDetails.phone,
          customer_insta: customerDetails.instaId || null,
          customer_address: customerDetails.address,
          order_notes: customerDetails.orderNotes || null,
          total_amount: grandTotal,
          payment_utr: utr.trim() || null,
          payment_proof_url: paymentProofUrl,
          status: 'Pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 3. Create Order Items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success('Order placed successfully!', { id: 'checkout' });
      clearCart();
      onClose();
      navigate('/success', { state: { orderId: order.id } });

    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please try again.', { id: 'checkout' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-brand-primary/50 backdrop-blur-sm">
      <div className="bg-brand-bg w-full max-w-lg max-h-[95vh] rounded-[24px] shadow-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-brand-primary/10 bg-brand-peach/30">
          <h2 className="text-2xl font-heading text-[#115E63]">Complete Payment</h2>
          <button onClick={onClose} className="text-[#115E63] hover:bg-brand-primary/10 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">
          
          <div className="text-center space-y-2">
            <p className="text-[#115E63]/70 font-bold">Total Amount to Pay</p>
            <p className="text-4xl font-heading text-[#115E63]">₹{grandTotal}</p>
          </div>

          <div className="bg-brand-peach p-6 rounded-[16px] border border-brand-primary/10 flex flex-col items-center">
            <p className="text-center text-[#115E63] font-bold mb-4">Scan to Pay with any UPI App</p>
            
            {/* Desktop QR */}
            <div className="hidden md:block bg-white p-2 rounded-xl mb-4 shadow-sm">
              <img src={qrUrl} alt="UPI QR Code" className="w-48 h-48" />
            </div>
            
            {/* Mobile Intent Button */}
            <div className="md:hidden w-full mb-4">
              <a 
                href={upiUri}
                className="w-full flex items-center justify-center gap-2 bg-[#115E63] text-brand-primary py-3 rounded-[10px] font-bold text-lg hover:bg-[#115E63]/90 transition-colors"
              >
                Pay with UPI App
                <ExternalLink size={18} />
              </a>
            </div>

            <div className="text-center mt-2 space-y-1">
              <p className="text-sm text-[#115E63]/70">UPI ID: <span className="font-bold text-[#115E63] select-all">{upiId}</span></p>
              <p className="text-sm text-[#115E63]/70">Payee: <span className="font-bold text-[#115E63]">{payeeName}</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-heading text-lg text-[#115E63] border-b border-brand-primary/10 pb-2">Verify Payment</h3>
            <p className="text-sm text-[#115E63]/70">After making the payment, please provide the 12-digit UTR/Reference number <span className="font-bold">OR</span> upload a screenshot of the successful payment screen.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#115E63] mb-1">12-Digit UTR Number</label>
                <input 
                  type="text" 
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="e.g. 123456789012"
                  className="w-full px-4 py-3 bg-white border border-brand-primary/20 rounded-[10px] focus:outline-none focus:border-[#115E63] text-[#115E63] font-mono tracking-wider"
                />
              </div>

              <div className="flex items-center justify-center">
                <span className="text-[#115E63]/40 font-bold px-2">OR</span>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#115E63] mb-2">Upload Screenshot</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-[10px] p-4 text-center cursor-pointer transition-colors
                    ${screenshot ? 'border-brand-accent bg-brand-accent/5' : 'border-brand-primary/20 hover:border-brand-primary/50 bg-white'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {screenshot ? (
                    <div className="flex flex-col items-center text-brand-accent">
                      <CheckCircle size={24} className="mb-2" />
                      <span className="font-bold text-sm">{screenshot.name}</span>
                      <span className="text-xs opacity-70 mt-1">Click to change file</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-[#115E63]/60">
                      <Upload size={24} className="mb-2" />
                      <span className="text-sm font-bold">Choose a file</span>
                      <span className="text-xs opacity-70 mt-1">Max 5MB</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 border-t border-brand-primary/10 bg-brand-peach/30 flex gap-4">
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-[12px] font-bold text-lg transition-colors bg-white text-[#115E63] border border-brand-primary/20 hover:bg-brand-primary/5 disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleCompleteOrder}
            disabled={isSubmitting || (!utr && !screenshot)}
            className={`flex-[2] py-4 rounded-[12px] font-bold text-lg transition-colors flex justify-center items-center gap-2
              ${(!utr && !screenshot) || isSubmitting
                ? 'bg-brand-primary/50 text-[#115E63]/50 cursor-not-allowed' 
                : 'bg-brand-primary text-[#115E63] hover:bg-brand-primary/90'
              }`}
          >
            {isSubmitting ? 'Placing Order...' : 'Complete Order'}
          </button>
        </div>

      </div>
    </div>
  );
}
