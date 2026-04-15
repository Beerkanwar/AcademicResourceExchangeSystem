import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineSearch, HiOutlineBell, HiOutlineLogout, HiMenu } from 'react-icons/hi';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="nitj-header" id="main-header">
        <div className="header-inner flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="header-logo">
              <img src="/nitj-logo.png" alt="NIT Jalandhar Logo" className="nitj-logo" style={{ height: '72px', width: 'auto' }} />
            </div>
            <div className="header-text">
              <div className="header-hindi">डॉ बी आर अम्बेडकर राष्ट्रीय प्रौद्योगिकी संस्थान जालंधर</div>
              <div className="header-sub-en">Dr B R Ambedkar</div>
              <h1 className="header-title">National Institute of Technology Jalandhar</h1>
            </div>
          </div>
        </div>
      </header>

      <nav className="nitj-navbar" id="main-navbar">
        <div className="navbar-inner flex items-center w-full justify-between">
          <div className="flex items-center">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="text-white/70 hover:text-white lg:hidden transition-colors p-1 mr-2"
                aria-label="Toggle sidebar"
              >
                <HiMenu className="w-5 h-5" />
              </button>
            )}
            <div className="navbar-brand-erp">
              <span className="erp-divider">|</span>
              <span className="erp-label">ERP - NITJ</span>
            </div>
          </div>

          <div className="navbar-right ml-auto flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="md:flex hidden bg-white/10 border border-white/20 rounded-md overflow-hidden" style={{ minWidth: '300px' }}>
                  <div className="px-3 flex items-center justify-center border-r border-white/20 text-white/50">
                    <HiOutlineSearch className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        navigate('/resources?search=' + encodeURIComponent(searchQuery.trim()));
                        setSearchQuery('');
                      }
                    }}
                    placeholder="Search resources..."
                    className="w-full bg-transparent text-white px-2 py-1 text-sm outline-none placeholder:text-white/40"
                  />
                </div>

                <div className="model-status-nav flex items-center gap-2 cursor-pointer" onClick={() => navigate('/profile')}>
                  <div className="w-6 h-6 rounded-full bg-white text-[10px] font-bold flex items-center justify-center text-primary">
                    {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <span className="text-[11px] font-bold text-white block leading-tight">
                      {user?.firstName || user?.email?.split('@')[0]}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="text-white/40 hover:text-red-400 p-1"
                  title="Logout"
                >
                  <HiOutlineLogout className="w-4 h-4" />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-nitj-secondary py-1 px-4 text-xs bg-white/20">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
