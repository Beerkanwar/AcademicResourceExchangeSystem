import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { HiOutlineLockClosed, HiEye, HiEyeOff, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function ChangePasswordPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const toggleShow = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/change-password', form);
      toast.success(res.data.message || 'Password changed successfully!');

      // If this was a forced password change, redirect to dashboard
      if (user?.mustChangePassword) {
        // Logout and re-login with new password
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

  const inputClass =
    'w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nitj-gold/50 focus:border-nitj-gold transition-all';

  return (
    <div className="max-w-lg mx-auto animate-scale-in">
      <div className="bg-white rounded-2xl shadow-card-hover overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-nitj-navy to-nitj-navy-light p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-nitj-gold/30 flex items-center justify-center mx-auto mb-3">
            <HiOutlineShieldCheck className="w-7 h-7 text-nitj-gold" />
          </div>
          <h2 className="text-white text-lg font-bold">Change Password</h2>
          {user?.mustChangePassword && (
            <p className="text-nitj-gold text-xs mt-1 font-medium">
              ⚠️ You must change your password before continuing
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-text-body mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                id="currentPassword"
                name="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                value={form.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => toggleShow('current')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body"
              >
                {showPasswords.current ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-text-body mb-1.5">
              New Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                id="newPassword"
                name="newPassword"
                type={showPasswords.new ? 'text' : 'password'}
                value={form.newPassword}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={inputClass}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => toggleShow('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body"
              >
                {showPasswords.new ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-body mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
                className={inputClass}
                required
              />
              <button
                type="button"
                onClick={() => toggleShow('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body"
              >
                {showPasswords.confirm ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
              </button>
            </div>
            {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-danger text-xs mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-nitj-navy hover:bg-nitj-navy-light text-white py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Changing Password...
              </>
            ) : (
              'Change Password'
            )}
          </button>

          {!user?.mustChangePassword && (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-text-muted hover:text-text-body text-sm py-2 transition-colors"
            >
              Cancel
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
