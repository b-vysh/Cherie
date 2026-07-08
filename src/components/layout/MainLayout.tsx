import { useState } from 'react';
import { Menu } from 'lucide-react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Sidebar, { type SidebarProps } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  sidebarProps: Omit<SidebarProps, 'isOpen' | 'onClose'>;
}

export default function MainLayout({ children, sidebarProps }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-body">
      <AnnouncementBar />
      <Header />

      {/* Sticky Mobile Navbar */}
      <div className="lg:hidden sticky top-0 z-40 bg-brand-bg/95 backdrop-blur-sm border-b border-brand-primary/20 p-4 flex items-center justify-between shadow-sm">
        <button 
          className="text-[#115E63] p-1 rounded-md hover:bg-brand-primary/10 transition-colors"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open Menu"
        >
          <Menu size={28} />
        </button>
        <span className="font-heading text-3xl text-[#115E63] absolute left-1/2 -translate-x-1/2">Cherie</span>
        <div className="w-8 flex justify-center text-2xl" title="Strawberry">🍓</div>
      </div>
      
      <div className="flex-1 flex items-start">
        {/* Sticky wrapper for desktop sidebar */}
        <div className="hidden lg:block sticky top-0 h-screen">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            {...sidebarProps}
          />
        </div>

        {/* Mobile sidebar handles its own fixed positioning */}
        <div className="lg:hidden">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            {...sidebarProps}
          />
        </div>
        
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
