import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineSearch, HiOutlineLogout, HiMenu } from 'react-icons/hi';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="nitj-header" id="main-header">
      <div className="navbar-inner">

        {/* ── Left zone: hamburger + branding ── */}
        <div className="topbar-left">
          {/* Mobile hamburger — only shown when authenticated */}
          {isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="topbar-hamburger"
              aria-label="Toggle sidebar"
            >
              <HiMenu className="w-5 h-5" />
            </button>
          )}

          {/* Logo */}
          <img
            src="/nitj-logo.png"
            alt="NIT Jalandhar Logo"
            className="nitj-logo"
          />

          {/* Institution text block */}
          <div className="header-text">
            <div className="header-hindi">
              डॉ बी आर अम्बेडकर राष्ट्रीय प्रौद्योगिकी संस्थान जालंधर
            </div>
            <h1 className="header-title">
              National Institute of Technology Jalandhar
            </h1>
            <div className="header-product">
              NITJ ResourceHub
            </div>
          </div>
        </div>

        {/* ── Right zone: search + user + logout ── */}
        <div className="topbar-right">
          {isAuthenticated ? (
            <>
              {/* Search bar — hidden below md */}
              <div className="topbar-search">
                <div className="topbar-search-icon">
                  <HiOutlineSearch className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="topbar-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      navigate('/resources?search=' + encodeURIComponent(searchQuery.trim()));
                      setSearchQuery('');
                    }
                  }}
                  placeholder="Search resources…"
                  aria-label="Search resources"
                  autoComplete="off"
                />
              </div>

              {/* User avatar pill */}
              <button
                className="topbar-user"
                onClick={() => navigate('/profile')}
                title="View profile"
              >
                <div className="topbar-avatar">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="topbar-username">
                  {user?.firstName || user?.email?.split('@')[0]}
                </span>
              </button>

              {/* Divider */}
              <div className="topbar-divider" aria-hidden="true" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="topbar-logout"
                title="Logout"
                aria-label="Logout"
              >
                <HiOutlineLogout className="w-[18px] h-[18px]" />
              </button>
            </>
          ) : (
            location.pathname !== '/login' && (
              <Link to="/login" className="topbar-login-link">
                Sign In
              </Link>
            )
          )}
        </div>

      </div>
    </header>
  );
}
