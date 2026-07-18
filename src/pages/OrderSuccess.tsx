import { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '../components/layout/Header';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { orderId: string } | null;

  useEffect(() => {
    // If they landed here without a valid order ID in state, redirect to home
    if (!state?.orderId) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.orderId) return null;

  // Shorten the UUID for display
  const shortOrderId = state.orderId.split('-')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-body text-[#115E63]">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4 py-20">
        <div className="bg-brand-peach max-w-lg w-full rounded-[24px] p-8 md:p-12 text-center shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="mx-auto w-20 h-20 bg-brand-primary/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="text-brand-primary w-10 h-10" />
          </div>

          <h1 className="text-4xl md:text-5xl font-heading text-[#115E63] mb-4">
            Order Confirmed!
          </h1>
          
          <p className="text-[#115E63]/80 text-lg mb-8 leading-relaxed font-medium">
            Thank you for supporting our small business! Your order is being uniquely crafted and will reach you soon.
          </p>

          <div className="bg-brand-bg rounded-[16px] p-6 mb-8 border border-brand-primary/10">
            <p className="text-sm text-[#115E63]/70 font-bold uppercase tracking-wider mb-2">Your Order Number</p>
            <p className="font-mono text-3xl font-bold text-[#115E63]">#{shortOrderId}</p>
          </div>

          <Link 
            to="/"
            className="w-full bg-brand-primary text-[#115E63] py-4 rounded-[12px] font-bold text-lg hover:bg-brand-primary/90 transition-colors flex items-center justify-center gap-2 group shadow-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            Continue Shopping
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

        </div>
      </main>
    </div>
  );
}
