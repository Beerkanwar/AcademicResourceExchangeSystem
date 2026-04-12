import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  HiOutlineHome,
  HiOutlineUpload,
  HiOutlineFolder,
  HiOutlineBookmark,
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiOutlineClipboardList,
  HiOutlineAcademicCap,
  HiOutlineCog,
  HiOutlineSearch,
  HiX,
} from 'react-icons/hi';

const navItemClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? 'bg-white/15 text-white shadow-sm'
      : 'text-white/70 hover:bg-white/10 hover:text-white'
  }`;

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, isTeacher } = useAuth();

  const mainLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
    { to: '/resources', icon: HiOutlineFolder, label: 'Browse Resources' },
    { to: '/search', icon: HiOutlineSearch, label: 'Search' },
    { to: '/upload', icon: HiOutlineUpload, label: 'Upload Resource' },
    { to: '/bookmarks', icon: HiOutlineBookmark, label: 'My Bookmarks' },
  ];

  const verificationLinks = [
    { to: '/verification', icon: HiOutlineShieldCheck, label: 'Verification Queue' },
  ];

  const adminLinks = [
    { to: '/admin/users', icon: HiOutlineUsers, label: 'Manage Users' },
    { to: '/admin/departments', icon: HiOutlineAcademicCap, label: 'Departments' },
    { to: '/admin/audit', icon: HiOutlineClipboardList, label: 'Audit Logs' },
    { to: '/admin/settings', icon: HiOutlineCog, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-nitj-navy-dark z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button (mobile) */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-white font-semibold text-sm">QUICK LINKS</span>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
            aria-label="Close sidebar"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="p-3 pt-20 lg:pt-4 space-y-1 overflow-y-auto h-full pb-20">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-4 mb-2">
            Quick Links
          </p>

          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navItemClass}
              onClick={onClose}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              {link.label}
            </NavLink>
          ))}

          {/* Verification — Teachers and Admin */}
          {(isAdmin || isTeacher) && (
            <>
              <div className="my-3 border-t border-white/10" />
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-4 mb-2">
                Verification
              </p>
              {verificationLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navItemClass}
                  onClick={onClose}
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {link.label}
                  {/* Pending badge placeholder */}
                  <span className="ml-auto bg-nitj-gold text-nitj-navy-dark text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    0
                  </span>
                </NavLink>
              ))}
            </>
          )}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="my-3 border-t border-white/10" />
              <p className="text-white/40 text-xs font-semibold uppercase tracking-wider px-4 mb-2">
                Administration
              </p>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navItemClass}
                  onClick={onClose}
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  {link.label}
                </NavLink>
              ))}
            </>
          )}
        </div>
      </aside>
    </>
  );
}
