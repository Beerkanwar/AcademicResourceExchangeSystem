import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api/axios';
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

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin, isTeacher } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAdmin || isTeacher) {
      const fetchCount = async () => {
        try {
          const res = await api.get('/verification/pending');
          setPendingCount(res.data.data?.pagination?.total || res.data.data?.resources?.length || 0);
        } catch { /* ignore */ }
      };
      fetchCount();
    }
  }, [isAdmin, isTeacher]);

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

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 group ${isActive
      ? 'text-white'
      : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
    }`;

  const navItemStyle = (isActive) =>
    isActive
      ? {
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
      }
      : {};

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-[2px]" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-[100dvh] w-[260px] xl:w-[280px] z-50 lg:z-auto flex-shrink-0 transform transition-all duration-300 ease-in-out lg:translate-x-0 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        style={{
          background: 'linear-gradient(180deg, #0a1929 0%, #0f2440 50%, #132e57 100%)',
          borderRight: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-white/80 font-semibold text-xs uppercase tracking-widest">Menu</span>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1" aria-label="Close sidebar">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="px-3 pt-4 lg:pt-5 pb-8 space-y-1">
          <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.15em] px-3.5 mb-3">
            Quick Links
          </p>

          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navItemClass}
              style={({ isActive }) => navItemStyle(isActive)}
              onClick={onClose}
            >
              <link.icon className="w-[18px] h-[18px] flex-shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
              {link.label}
            </NavLink>
          ))}

          {/* Verification — Teachers and Admin */}
          {(isAdmin || isTeacher) && (
            <>
              <div className="my-4 mx-3 border-t border-white/[0.06]" />
              <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.15em] px-3.5 mb-3">
                Verification
              </p>
              {verificationLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navItemClass}
                  style={({ isActive }) => navItemStyle(isActive)}
                  onClick={onClose}
                >
                  <link.icon className="w-[18px] h-[18px] flex-shrink-0 opacity-70" />
                  <span className="flex-1">{link.label}</span>
                  {pendingCount > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: '#d69e2e', color: '#0f2440' }}
                    >
                      {pendingCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </>
          )}

          {/* Admin section */}
          {isAdmin && (
            <>
              <div className="my-4 mx-3 border-t border-white/[0.06]" />
              <p className="text-white/25 text-[10px] font-bold uppercase tracking-[0.15em] px-3.5 mb-3">
                Administration
              </p>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navItemClass}
                  style={({ isActive }) => navItemStyle(isActive)}
                  onClick={onClose}
                >
                  <link.icon className="w-[18px] h-[18px] flex-shrink-0 opacity-70" />
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
