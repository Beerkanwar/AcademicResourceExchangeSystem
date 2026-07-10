import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import {
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineKey,
  HiOutlineBan,
  HiOutlineCheckCircle,
  HiOutlineX,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFilter,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const ROLE_BADGE = {
  admin: { bg: '#e53e3e12', color: '#e53e3e', label: 'Admin' },
  teacher: { bg: '#3182ce12', color: '#3182ce', label: 'Teacher' },
  student: { bg: '#38a16912', color: '#38a169', label: 'Student' },
};

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [departments, setDepartments] = useState([]);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      setDepartments(res.data.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchUsers(); fetchDepartments(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handleResetPassword = async (userId, email) => {
    if (!confirm(`Reset password for ${email}?`)) return;
    try {
      const res = await api.post(`/users/${userId}/reset-password`);
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.delete(`/users/${userId}`);
      toast.success(res.data.message);
      fetchUsers(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const openCreate = () => { setEditUser(null); setShowModal(true); };
  const openEdit = (user) => { setEditUser(user); setShowModal(true); };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1a202c' }}>User Management</h1>
          <p className="text-[13px]" style={{ color: '#a0aec0' }}>
            {pagination.total} users total
          </p>
        </div>
        <button onClick={openCreate} className="btn-accent flex items-center gap-2 w-fit">
          <HiOutlinePlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a0aec0' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, roll number..."
              className="nitj-input w-full pl-[36px]"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a0aec0' }} />
              <select
                value={roleFilter}
                onChange={(e) => { setRoleFilter(e.target.value); }}
                className="nitj-select w-full pl-[30px] pr-[30px] appearance-none cursor-pointer"
                style={{ minWidth: '140px' }}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-nitj-submit">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['User', 'Email', 'Role', 'Department', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[11px] font-bold uppercase tracking-wider px-5 py-3" style={{ color: '#a0aec0' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f7fafc' }}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 rounded animate-pulse" style={{ background: '#edf2f7', width: j === 0 ? 150 : 100 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[13px]" style={{ color: '#a0aec0' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const badge = ROLE_BADGE[user.role] || ROLE_BADGE.student;
                  return (
                    <tr key={user._id} className="hover:bg-[#f7fafc] transition-colors" style={{ borderBottom: '1px solid #f7fafc' }}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold" style={{ color: '#2d3748' }}>
                              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split('@')[0]}
                            </p>
                            {user.rollNumber && (
                              <p className="text-[11px]" style={{ color: '#a0aec0' }}>{user.rollNumber}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px]" style={{ color: '#4a5568' }}>{user.email}</td>
                      <td className="px-5 py-3.5">
                        <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px]" style={{ color: '#718096' }}>
                        {user.department?.code || '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className="badge"
                          style={{
                            background: user.isActive ? '#38a16912' : '#e53e3e12',
                            color: user.isActive ? '#38a169' : '#e53e3e',
                          }}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <ActionBtn icon={HiOutlinePencil} title="Edit" onClick={() => openEdit(user)} color="#3182ce" />
                          <ActionBtn icon={HiOutlineKey} title="Reset Password" onClick={() => handleResetPassword(user._id, user.email)} color="#d69e2e" />
                          <ActionBtn
                            icon={user.isActive ? HiOutlineBan : HiOutlineCheckCircle}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                            onClick={() => handleToggleStatus(user._id)}
                            color={user.isActive ? '#e53e3e' : '#38a169'}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid #e2e8f0' }}>
            <p className="text-[12px]" style={{ color: '#a0aec0' }}>
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-1.5">
              <PaginationBtn
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1)}
                icon={HiOutlineChevronLeft}
              />
              <PaginationBtn
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchUsers(pagination.page + 1)}
                icon={HiOutlineChevronRight}
              />
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <UserModal
          user={editUser}
          departments={departments}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchUsers(pagination.page); }}
        />
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, title, onClick, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-lg transition-all hover:scale-110"
      style={{ color, background: `${color}08` }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}15`; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}08`; }}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function PaginationBtn({ disabled, onClick, icon: Icon }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="p-1.5 rounded-lg transition-colors disabled:opacity-30"
      style={{ border: '1px solid #e2e8f0' }}
    >
      <Icon className="w-4 h-4" style={{ color: '#4a5568' }} />
    </button>
  );
}

function UserModal({ user, departments, onClose, onSaved }) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    role: user?.role || 'student',
    rollNumber: user?.rollNumber || '',
    department: user?.department?._id || user?.department || '',
    phone: user?.phone || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/users/${user._id}`, form);
        toast.success('User updated');
      } else {
        await api.post('/users', form);
        toast.success('User created');
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden animate-scale-in"
        style={{ background: '#fff', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 gradient-header">
          <h3 className="text-white font-bold text-[15px]">{isEdit ? 'Edit User' : 'Create New User'}</h3>
          <button onClick={onClose} className="text-white/50 hover:text-white p-1">
            <HiOutlineX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEdit && (
            <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="user@nitj.ac.in" />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} placeholder="First" />
            <Field label="Last Name" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} placeholder="Last" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="nitj-select w-full"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Field label="Roll Number" value={form.rollNumber} onChange={(v) => setForm({ ...form, rollNumber: v })} placeholder="21105XXX" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="nitj-select w-full"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>
          <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+91..." />

          {!isEdit && (
            <p className="text-[11px] p-3 rounded-lg" style={{ background: '#edf2f7', color: '#718096' }}>
              💡 Default password will be set to the roll number (or "password123" for teachers/admins). User must change it on first login.
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
              style={{ border: '1px solid #e2e8f0', color: '#718096' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-nitj-submit flex-1">
              {saving ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold mb-1" style={{ color: '#4a5568' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="nitj-input w-full"
      />
    </div>
  );
}
