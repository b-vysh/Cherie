import { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import { supabase } from '../services/supabase';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart, updateCustomMessage } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    instaId: '',
    address: '',
    orderNotes: ''
  });

  const [shippingText, setShippingText] = useState<string>('Shipping ₹80');
  const [shippingThreshold, setShippingThreshold] = useState<number | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number, shipping_text, free_shipping_threshold')
        .limit(1)
        .single();
      
      if (data) {
        if (data.whatsapp_number) setWhatsappNumber(data.whatsapp_number);
        setShippingText(data.shipping_text || 'Shipping ₹80');
        if (data.free_shipping_threshold) setShippingThreshold(Number(data.free_shipping_threshold));
      }
    }
    fetchSettings();
  }, []);

  const handleCheckout = () => {
    if (!whatsappNumber) {
      toast.error("Checkout is currently unavailable as no WhatsApp number is configured.");
      return;
    }

    if (!customerDetails.name || !customerDetails.phone || !customerDetails.address) {
      toast.error("Please fill in all required details (Name, Phone, Address).");
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(customerDetails.phone)) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsProcessing(true);

    let message = "Hello CHERIE,\n\nI would like to place an order:\n\n";
    
    message += `*Customer Details*\n`;
    message += `Name: ${customerDetails.name}\n`;
    message += `Phone: ${customerDetails.phone}\n`;
    if (customerDetails.instaId) message += `Insta ID: ${customerDetails.instaId}\n`;
    message += `Address: ${customerDetails.address}\n\n`;
    
    message += `*Order Items*\n`;
    cart.forEach(item => {
      let itemLine = `- ${item.name}`;
      if (item.variant) {
        itemLine += ` [${item.variant}]`;
      }
      itemLine += ` x${item.quantity} (₹${item.price * item.quantity})\n`;
      message += itemLine;
    });
    
    if (customerDetails.orderNotes.trim()) {
      message += `\n*Order Notes*\n${customerDetails.orderNotes.trim()}\n`;
    }
    
    message += `\n*Subtotal: ₹${cartTotal}*\n`;
    message += `*Shipping: ${actualShippingCost === 0 ? 'Free' : `₹${actualShippingCost}`}*\n`;
    message += `*Grand Total: ₹${grandTotal}*\n\nPlease share payment details.`;
    
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/\D/g, ''); // Remove non-numeric characters
    
    // Use window.location.href instead of window.open to prevent mobile popup blockers
    window.location.href = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
    }, 500); // Reset processing state and clear cart after short delay to ensure redirect happens first
  };

  const shippingMatch = shippingText.match(/\d+/);
  const baseShippingCost = shippingMatch ? parseInt(shippingMatch[0]) : 0;
  const isFreeShipping = shippingThreshold !== null && cartTotal >= shippingThreshold;
  const actualShippingCost = isFreeShipping ? 0 : baseShippingCost;
  const grandTotal = cartTotal + actualShippingCost;

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-body">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-[#115E63] hover:text-brand-accent transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-heading text-[#115E63]">Your Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-brand-peach rounded-[16px] border border-brand-primary/10">
            <p className="text-xl text-[#115E63] mb-6 font-heading">Your cart is feeling a little empty.</p>
            <Link to="/" className="bg-[#115E63] text-brand-primary px-6 py-3 rounded-[10px] font-semibold hover:bg-[#115E63]/90 transition-colors inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cart.map((item) => (
                <div key={item.cartItemId} className="bg-brand-peach p-4 rounded-[16px] flex gap-4 items-center shadow-sm">
                  <div className="w-24 h-24 bg-brand-bg rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#115E63]/30 text-xs">No Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-body font-bold text-xl text-[#115E63] truncate">{item.name}</h3>
                    {item.variant && (
                      <p className="text-sm text-[#115E63]/70 font-bold mb-1">Variant: {item.variant}</p>
                    )}
                    <p className="text-[#115E63] font-bold mt-1">₹{item.price}</p>
                    
                    <div className="mt-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-brand-bg rounded-lg border border-brand-primary/20 w-fit">
                          <button 
                            onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                            className="p-2 text-[#115E63] hover:bg-brand-primary/5 rounded-l-lg"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-bold text-[#115E63]">{item.quantity}</span>
                          <button 
                            onClick={() => {
                              if (item.quantity < item.stock) {
                                updateQuantity(item.cartItemId, item.quantity + 1);
                              } else {
                                toast.error(`Only ${item.stock} available in stock`);
                              }
                            }}
                            disabled={item.quantity >= item.stock}
                            className={`p-2 transition-colors rounded-r-lg ${item.quantity >= item.stock ? 'text-[#115E63]/30 cursor-not-allowed' : 'text-[#115E63] hover:bg-brand-primary/5'}`}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-[#115E63]/60 hover:text-brand-accent transition-colors p-2"
                          title="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-[#115E63]/70 mb-1">Total</p>
                    <p className="font-bold text-[#115E63] text-lg">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:w-96 space-y-6">
              {/* Customer Details Form */}
              <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm">
                <h2 className="text-2xl font-heading text-[#115E63] mb-6">Your Details</h2>
                <div className="space-y-4 text-[#115E63]">
                  <div>
                    <label className="block text-sm font-bold mb-1">Name *</label>
                    <input 
                      type="text" 
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/20 rounded-[10px] focus:outline-none focus:border-[#115E63]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Phone Number *</label>
                    <input 
                      type="tel" 
                      value={customerDetails.phone}
                      onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value.replace(/\D/g, '')})}
                      maxLength={10}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/20 rounded-[10px] focus:outline-none focus:border-[#115E63]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Instagram ID (Optional)</label>
                    <input 
                      type="text" 
                      value={customerDetails.instaId}
                      onChange={(e) => setCustomerDetails({...customerDetails, instaId: e.target.value})}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/20 rounded-[10px] focus:outline-none focus:border-[#115E63]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Delivery Address *</label>
                    <textarea 
                      value={customerDetails.address}
                      onChange={(e) => setCustomerDetails({...customerDetails, address: e.target.value})}
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/20 rounded-[10px] focus:outline-none focus:border-[#115E63] resize-none h-24"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Order Notes / Customizations (Optional)</label>
                    <textarea 
                      value={customerDetails.orderNotes}
                      onChange={(e) => setCustomerDetails({...customerDetails, orderNotes: e.target.value})}
                      placeholder="e.g. For the Gold necklace, please make it 18 inches"
                      className="w-full px-4 py-2 bg-brand-bg border border-brand-primary/20 rounded-[10px] focus:outline-none focus:border-[#115E63] resize-none h-20 placeholder:text-[#115E63]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-brand-peach p-6 rounded-[16px] shadow-sm sticky top-6">
                <h2 className="text-2xl font-heading text-[#115E63] mb-6">Order Summary</h2>
              <div className="space-y-3 text-[#115E63] mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-[#115E63]/70">
                  <span>Shipping</span>
                  <span>
                    {isFreeShipping 
                      ? 'Free' 
                      : shippingText.replace(/^Shipping\s+/i, '')}
                  </span>
                </div>
                <div className="h-px bg-brand-primary/20 my-4"></div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing || !whatsappNumber}
                className={`w-full py-3 rounded-[10px] font-semibold transition-colors
                  ${!whatsappNumber 
                    ? 'bg-[#115E63]/50 text-brand-primary cursor-not-allowed' 
                    : 'bg-[#115E63] text-brand-primary hover:bg-[#115E63]/90'
                  }`}
              >
                {!whatsappNumber ? 'Setup Required' : (isProcessing ? 'Processing...' : 'Place Order')}
              </button>
            </div>
          </div>
          </div>
        )}
      </main>
    </div>
  );
}
