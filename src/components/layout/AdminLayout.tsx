import { LogOut, LayoutDashboard, Package, Settings } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../services/supabase';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex font-body">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-brand-primary text-brand-bg flex-col hidden md:flex">
        <div className="p-6 border-b border-brand-bg/10 flex justify-center">
          <Link to="/" className="font-heading text-2xl text-brand-bg hover:opacity-80 transition-opacity">
            Admin Panel
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/admin');
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-[10px] transition-colors ${
                  isActive ? 'bg-brand-accent/20 text-brand-accent font-bold' : 'hover:bg-brand-bg/10'
                }`}
              >
                <Icon size={20} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-brand-bg/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-[10px] hover:bg-brand-bg/10 transition-colors text-left font-bold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-brand-primary text-brand-bg p-4 flex justify-between items-center">
          <span className="font-heading text-xl">Admin Panel</span>
          <button onClick={handleLogout}>
            <LogOut size={24} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
