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
          setPendingCount(
            res.data.data?.pagination?.total ||
            res.data.data?.resources?.length ||
            0
          );
        } catch { /* ignore */ }
      };
      fetchCount();
    }
  }, [isAdmin, isTeacher]);

  const mainLinks = [
    { to: '/dashboard',  icon: HiOutlineHome,      label: 'Dashboard' },
    { to: '/resources',  icon: HiOutlineFolder,    label: 'Browse Resources' },
    { to: '/upload',     icon: HiOutlineUpload,    label: 'Upload Resource' },
    { to: '/bookmarks',  icon: HiOutlineBookmark,  label: 'My Bookmarks' },
  ];

  const verificationLinks = [
    { to: '/verification', icon: HiOutlineShieldCheck, label: 'Verification Queue' },
  ];

  const adminLinks = [
    { to: '/admin/users',       icon: HiOutlineUsers,         label: 'Manage Users' },
    { to: '/admin/departments', icon: HiOutlineAcademicCap,   label: 'Departments' },
    { to: '/admin/audit',       icon: HiOutlineClipboardList, label: 'Audit Logs' },
  ];

  const navItemClass = ({ isActive }) =>
    `sidebar-item${isActive ? ' active' : ''}`;

  return (
    <>
      {/* Mobile overlay — plain dark, no blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`portal-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0 lg:block ${
          isOpen ? 'translate-x-0 fixed inset-y-0 left-0 z-50' : '-translate-x-full hidden lg:block'
        }`}
      >
        {/* Mobile drawer header */}
        <div className="sidebar-mobile-header lg:hidden">
          <span className="sidebar-mobile-title">Navigation</span>
          <button
            onClick={onClose}
            className="sidebar-close-btn"
            aria-label="Close navigation"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav" aria-label="Main navigation">

          {/* Main section */}
          <div className="sidebar-heading">Main</div>
          {mainLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={navItemClass}
              onClick={onClose}
            >
              <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}

          {/* Verification — teachers and admins */}
          {(isAdmin || isTeacher) && (
            <>
              <div className="sidebar-heading">Verification</div>
              {verificationLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navItemClass}
                  onClick={onClose}
                >
                  <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="flex-1">{link.label}</span>
                  {pendingCount > 0 && (
                    <span className="sidebar-badge">{pendingCount}</span>
                  )}
                </NavLink>
              ))}
            </>
          )}

          {/* Administration — admins only */}
          {isAdmin && (
            <>
              <div className="sidebar-heading">Administration</div>
              {adminLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={navItemClass}
                  onClick={onClose}
                >
                  <link.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </>
          )}

        </nav>
      </aside>
    </>
  );
}
