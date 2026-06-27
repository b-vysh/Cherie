import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { totalItems } = useCart();
  const location = useLocation();
  const isCartPage = location.pathname === '/cart';

  return (
    <header className="bg-brand-bg relative border-b border-brand-primary/10">
      {onMenuClick && (
        <button 
          className="md:hidden absolute left-4 top-4 text-[#115E63] z-10 bg-brand-bg/80 p-2 rounded-lg"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
      )}
      
      <div className="w-full relative">
        <Link to="/">
          <img 
            src="/logo.png" 
            alt="CHERIE" 
            className="w-full h-48 md:h-72 object-cover object-center"
          />
        </Link>
        
        <Link 
          to={isCartPage ? "/" : "/cart"} 
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 w-16 h-16 md:w-20 md:h-20 bg-[#115E63] rounded-full text-brand-primary hover:bg-[#115E63]/90 transition-all shadow-[0_8px_30px_rgba(17,94,99,0.5)] z-50 text-3xl md:text-4xl flex items-center justify-center hover:-translate-y-1 border border-[#115E63]/20"
        >
          {isCartPage ? <X size={32} className="md:w-10 md:h-10" /> : "🛒"}
          {totalItems > 0 && !isCartPage && (
            <span className="absolute -top-1 -right-1 bg-brand-accent text-[#115E63] text-xs md:text-sm font-bold rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center shadow-md border-2 border-[#115E63]">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
