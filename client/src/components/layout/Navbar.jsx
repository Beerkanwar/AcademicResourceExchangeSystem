import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineSearch, HiOutlineBell, HiOutlineLogout, HiOutlineUser, HiMenu } from 'react-icons/hi';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-nitj-navy shadow-navbar sticky top-0 z-50">
      {/* Top Banner — NITJ Branding */}
      <div className="bg-nitj-navy-dark border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 py-2 flex items-center gap-3">
          <img
            src="/nitj-logo.png"
            alt="NIT Jalandhar Logo"
            className="h-10 w-10 object-contain"
          />
          <div>
            <p className="text-white/60 text-[10px] leading-tight tracking-wide">
              डॉ बी आर अम्बेडकर राष्ट्रीय प्रौद्योगिकी संस्थान, जालंधर
            </p>
            <h1 className="text-white text-sm font-semibold leading-tight">
              Dr B R Ambedkar National Institute of Technology, Jalandhar
            </h1>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Left */}
          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="text-white/80 hover:text-white lg:hidden transition-colors"
                aria-label="Toggle sidebar"
              >
                <HiMenu className="w-6 h-6" />
              </button>
            )}
            <Link
              to="/"
              className="flex items-center gap-2 text-nitj-gold font-bold text-sm tracking-wide hover:text-nitj-gold-light transition-colors"
            >
              <span className="bg-nitj-gold text-nitj-navy-dark px-2 py-0.5 rounded text-xs font-bold">
                ARES
              </span>
              <span className="hidden sm:inline text-white/90">Academic Resource Exchange</span>
            </Link>
          </div>

          {/* Center — Search (when authenticated) */}
          {isAuthenticated && (
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search resources, subjects, tags..."
                  className="w-full bg-white/10 border border-white/10 text-white placeholder:text-white/40 rounded-lg pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-nitj-gold/50 focus:bg-white/15 transition-all"
                />
              </div>
            </div>
          )}

          {/* Right */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <button className="relative text-white/70 hover:text-white transition-colors" aria-label="Notifications">
                  <HiOutlineBell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-nitj-gold rounded-full"></span>
                </button>
                <div className="flex items-center gap-2 pl-3 border-l border-white/20">
                  <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-nitj-gold/20 border border-nitj-gold/30 flex items-center justify-center">
                      <span className="text-nitj-gold text-xs font-bold">
                        {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-white text-xs font-medium leading-tight">
                        {user?.firstName || user?.email?.split('@')[0]}
                      </p>
                      <p className="text-white/50 text-[10px] capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white/50 hover:text-red-400 transition-colors ml-1"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-nitj-gold hover:bg-nitj-gold-light text-nitj-navy-dark px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
