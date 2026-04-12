import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await login(email, password);
      toast.success(result.message || 'Login successful!');

      // Check if password change is needed
      if (result.data?.user?.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card-hover overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-nitj-navy to-nitj-navy-light p-8 text-center">
            <img
              src="/nitj-logo.png"
              alt="NIT Jalandhar"
              className="w-20 h-20 mx-auto mb-4 drop-shadow-lg"
            />
            <h2 className="text-white text-xl font-bold">
              Academic Resource Exchange
            </h2>
            <p className="text-white/60 text-sm mt-1">
              NIT Jalandhar — Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-text-body mb-1.5">
                College Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@nitj.ac.in"
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nitj-gold/50 focus:border-nitj-gold transition-all"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-text-body mb-1.5">
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted w-5 h-5" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nitj-gold/50 focus:border-nitj-gold transition-all"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-body transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <HiEyeOff className="w-5 h-5" /> : <HiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-nitj-navy hover:bg-nitj-navy-light text-white py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Demo credentials */}
            <div className="border-t border-gray-100 pt-4 mt-4">
              <p className="text-xs text-text-muted text-center mb-3 font-medium">Quick Login (Demo)</p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Admin', email: 'admin@nitj.ac.in', pass: 'admin123' },
                  { label: 'Teacher', email: 'teacher@nitj.ac.in', pass: 'teacher123' },
                  { label: 'Student', email: 'student@nitj.ac.in', pass: '21105001' },
                ].map((cred) => (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => {
                      setEmail(cred.email);
                      setPassword(cred.pass);
                    }}
                    className="text-xs bg-gray-50 hover:bg-nitj-navy/5 border border-gray-200 rounded-lg py-2 px-2 text-text-body font-medium transition-colors"
                  >
                    {cred.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Help text */}
            <div className="text-center text-xs text-text-muted">
              <p>Default credentials: college email + roll number</p>
              <p className="mt-1">
                Forgot password?{' '}
                <span className="text-nitj-gold hover:text-nitj-gold-dark cursor-pointer font-medium">
                  Contact Admin
                </span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
