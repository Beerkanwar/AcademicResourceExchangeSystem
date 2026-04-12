import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { HiOutlineLockClosed, HiEye, HiEyeOff, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggleShow = (field) => setShowPasswords((p) => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('All fields are required'); return;
    }
    if (form.newPassword.length < 6) { toast.error('New password must be at least 6 characters'); return; }
    if (form.newPassword !== form.confirmPassword) { toast.error('New passwords do not match'); return; }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-password', form);
      toast.success(res.data.message || 'Password changed successfully!');
      if (user?.mustChangePassword) {
        toast('Please login with your new password', { icon: '🔑' });
        logout();
        navigate('/login');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (name, label, placeholder, showKey) => (
    <div>
      <label htmlFor={name} className="block text-[13px] font-semibold mb-1.5" style={{ color: '#4a5568' }}>
        {label}
      </label>
      <div className="relative">
        <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: '#a0aec0' }} />
        <input
          id={name}
          name={name}
          type={showPasswords[showKey] ? 'text' : 'password'}
          value={form[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="input-field"
          style={{ paddingRight: '48px' }}
          required
        />
        <button type="button" onClick={() => toggleShow(showKey)}
          className="absolute right-3.5 top-1/2 -translate-y-1/2" style={{ color: '#a0aec0' }}>
          {showPasswords[showKey] ? <HiEyeOff className="w-[18px] h-[18px]" /> : <HiEye className="w-[18px] h-[18px]" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto animate-scale-in">
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: '#fff',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Header */}
        <div className="px-8 py-7 text-center gradient-header">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(214,158,46,0.35)' }}
          >
            <HiOutlineShieldCheck className="w-8 h-8" style={{ color: '#ecc94b' }} />
          </div>
          <h2 className="text-white text-lg font-bold">Change Password</h2>
          {user?.mustChangePassword && (
            <p className="text-[12px] mt-1.5 font-semibold" style={{ color: '#ecc94b' }}>
              ⚠️ You must change your password before continuing
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {renderField('currentPassword', 'Current Password', 'Enter current password', 'current')}
          {renderField('newPassword', 'New Password', 'Minimum 6 characters', 'new')}
          {renderField('confirmPassword', 'Confirm New Password', 'Re-enter new password', 'confirm')}

          {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
            <p className="text-[12px] font-medium" style={{ color: '#e53e3e' }}>⚠ Passwords do not match</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Changing...</>
            ) : 'Change Password'}
          </button>

          {!user?.mustChangePassword && (
            <button type="button" onClick={() => navigate(-1)}
              className="w-full text-sm py-2 transition-colors" style={{ color: '#a0aec0' }}>
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
