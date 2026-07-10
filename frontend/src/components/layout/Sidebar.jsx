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
  ];

  const navItemClass = ({ isActive }) =>
    `sidebar-item ${isActive ? 'active' : ''}`;

  const navItemStyle = (isActive) => ({});

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-[2px]" onClick={onClose} />
      )}

      <aside
        className={`portal-sidebar transform transition-all duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0 fixed z-50 h-[100dvh]' : '-translate-x-full hidden lg:block'}`}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-[#c5d8ed] mb-2">
          <span className="text-[#1a3a6e] font-bold text-xs uppercase tracking-widest">Menu</span>
          <button onClick={onClose} className="text-[#1a3a6e]/50 hover:text-[#1a3a6e] p-1" aria-label="Close sidebar">
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="sidebar-heading">Quick Links</div>

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
              <div className="sidebar-heading mt-4">Verification</div>
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
              <div className="sidebar-heading mt-4">Administration</div>
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
