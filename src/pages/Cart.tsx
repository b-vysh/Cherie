import { useEffect, useState } from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import AnnouncementBar from '../components/layout/AnnouncementBar';
import Header from '../components/layout/Header';
import { supabase } from '../services/supabase';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase
        .from('settings')
        .select('whatsapp_number')
        .limit(1)
        .single();
      
      if (data?.whatsapp_number) {
        setWhatsappNumber(data.whatsapp_number);
      }
    }
    fetchSettings();
  }, []);

  const handleCheckout = () => {
    if (!whatsappNumber) {
      toast.error("Checkout is currently unavailable as no WhatsApp number is configured.");
      return;
    }

    setIsProcessing(true);

    let message = "Hello CHERIE,\n\nI would like to enquire about:\n\n";
    
    cart.forEach(item => {
      message += `* ${item.name} - ${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    message += `\nTotal Amount: ₹${cartTotal}\n\nPlease share availability and payment details.`;
    
    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = whatsappNumber.replace(/\D/g, ''); // Remove non-numeric characters
    
    window.open(`https://wa.me/${cleanNumber}?text=${encodedMessage}`, '_blank');
    
    setTimeout(() => setIsProcessing(false), 500); // Reset processing state quickly
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-body">
      <AnnouncementBar />
      <Header />
      
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-brand-primary hover:text-brand-accent transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-4xl font-heading text-brand-primary">Your Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-brand-peach rounded-[16px] border border-brand-primary/10">
            <p className="text-xl text-brand-primary mb-6 font-heading">Your cart is feeling a little empty.</p>
            <Link to="/" className="bg-brand-primary text-brand-bg px-6 py-3 rounded-[10px] font-semibold hover:bg-brand-primary/90 transition-colors inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-brand-peach p-4 rounded-[16px] flex gap-4 items-center shadow-sm">
                  <div className="w-24 h-24 bg-brand-bg rounded-xl overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-primary/30 text-xs">No Image</div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-xl text-brand-primary truncate">{item.name}</h3>
                    <p className="text-brand-primary font-bold mt-1">₹{item.price}</p>
                    
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center bg-brand-bg rounded-lg border border-brand-primary/20 w-fit">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-brand-primary hover:bg-brand-primary/5 rounded-l-lg"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center font-bold text-brand-primary">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-brand-primary hover:bg-brand-primary/5 rounded-r-lg"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-brand-primary/60 hover:text-brand-accent transition-colors p-2"
                        title="Remove item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="hidden sm:block text-right">
                    <p className="text-sm text-brand-primary/70 mb-1">Total</p>
                    <p className="font-bold text-brand-primary text-lg">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="lg:w-80 h-fit bg-brand-peach p-6 rounded-[16px] shadow-sm sticky top-6">
              <h2 className="text-2xl font-heading text-brand-primary mb-6">Order Summary</h2>
              <div className="space-y-3 text-brand-primary mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">₹{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-brand-primary/70">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="h-px bg-brand-primary/20 my-4"></div>
                <div className="flex justify-between text-xl font-bold">
                  <span>Grand Total</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={isProcessing || !whatsappNumber}
                className={`w-full py-3 rounded-[10px] font-semibold transition-colors
                  ${!whatsappNumber 
                    ? 'bg-brand-primary/50 text-brand-bg cursor-not-allowed' 
                    : 'bg-brand-primary text-brand-bg hover:bg-brand-primary/90'
                  }`}
              >
                {!whatsappNumber ? 'Setup Required' : (isProcessing ? 'Processing...' : 'Proceed to Checkout')}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
