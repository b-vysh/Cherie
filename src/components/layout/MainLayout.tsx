import { useState } from 'react';
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
      <Header onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="flex-1 flex items-start">
        {/* Sticky wrapper for desktop sidebar */}
        <div className="hidden md:block sticky top-0 h-screen">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            {...sidebarProps}
          />
        </div>

        {/* Mobile sidebar handles its own fixed positioning */}
        <div className="md:hidden">
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            {...sidebarProps}
          />
        </div>
        
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
