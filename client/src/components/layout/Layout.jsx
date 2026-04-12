import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useAuth } from '../../hooks/useAuth';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#edf2f7' }}>
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — only when authenticated */}
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Main content area — offset by sidebar width on desktop */}
        <main
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            isAuthenticated ? 'lg:ml-0' : ''
          }`}
          style={{ minHeight: 'calc(100vh - 120px)' }}
        >
          <div className="p-5 md:p-7 lg:p-8 max-w-[1200px] mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
