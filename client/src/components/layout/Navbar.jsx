import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineSearch, HiOutlineBell, HiOutlineLogout, HiMenu } from 'react-icons/hi';

export default function Navbar({ onToggleSidebar }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
      {/* Top Banner */}
      <div className="gradient-header border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-4">
          <img
            src="/nitj-logo.png"
            alt="NIT Jalandhar Logo"
            className="h-11 w-11 object-contain drop-shadow-md"
          />
          <div className="leading-tight">
            <p className="text-white/50 text-[10px] tracking-wide">
              डॉ बी आर अम्बेडकर राष्ट्रीय प्रौद्योगिकी संस्थान, जालंधर
            </p>
            <h1 className="text-white text-sm font-semibold tracking-wide">
              Dr B R Ambedkar National Institute of Technology, Jalandhar
            </h1>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div style={{ background: '#1a365d' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-11">
            {/* Left */}
            <div className="flex items-center gap-4">
              {isAuthenticated && (
                <button
                  onClick={onToggleSidebar}
                  className="text-white/70 hover:text-white lg:hidden transition-colors p-1"
                  aria-label="Toggle sidebar"
                >
                  <HiMenu className="w-5 h-5" />
                </button>
              )}
              <Link to="/" className="flex items-center gap-2.5">
                <span
                  className="px-2 py-0.5 rounded-md text-[11px] font-extrabold tracking-wider"
                  style={{ background: 'linear-gradient(135deg, #d69e2e, #ecc94b)', color: '#0f2440' }}
                >
                  ARES
                </span>
                <span className="hidden sm:inline text-white/85 text-[13px] font-medium">
                  Academic Resource Exchange
                </span>
              </Link>
            </div>

            {/* Center — Search */}
            {isAuthenticated && (
              <div className="hidden md:flex flex-1 max-w-lg mx-8">
                <div className="relative w-full">
                  <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search resources, subjects, tags..."
                    className="w-full rounded-lg pl-10 pr-4 py-[7px] text-[13px] text-white placeholder:text-white/35 focus:outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                    onFocus={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.14)';
                      e.target.style.borderColor = 'rgba(214,158,46,0.4)';
                    }}
                    onBlur={(e) => {
                      e.target.style.background = 'rgba(255,255,255,0.08)';
                      e.target.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Right */}
            <div className="flex items-center gap-2.5">
              {isAuthenticated ? (
                <>
                  <button
                    className="relative p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
                    aria-label="Notifications"
                  >
                    <HiOutlineBell className="w-[18px] h-[18px]" />
                    <span
                      className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full"
                      style={{ background: '#d69e2e' }}
                    />
                  </button>

                  <div className="h-5 w-px bg-white/15 mx-1" />

                  <Link to="/profile" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold"
                      style={{
                        background: 'linear-gradient(135deg, rgba(214,158,46,0.2), rgba(214,158,46,0.3))',
                        border: '1.5px solid rgba(214,158,46,0.4)',
                        color: '#ecc94b',
                      }}
                    >
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block leading-tight">
                      <p className="text-white text-[12px] font-medium">
                        {user?.firstName || user?.email?.split('@')[0]}
                      </p>
                      <p className="text-white/40 text-[10px] capitalize">{user?.role}</p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all ml-0.5"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <HiOutlineLogout className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="btn-accent text-[12px] py-1.5 px-5">
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
