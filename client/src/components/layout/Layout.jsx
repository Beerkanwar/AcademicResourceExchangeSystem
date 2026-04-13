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
          className={`flex-1 overflow-y-auto transition-all duration-300 ${isAuthenticated ? 'lg:ml-0' : ''
            }`}
          style={{ minHeight: 'calc(100vh - 120px)' }}
        >
          <div className="p-4 sm:p-6 md:p-8 lg:p-10 w-full animate-fade-in transition-all">
            <Outlet />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
