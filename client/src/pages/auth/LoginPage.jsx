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
      if (result.data?.user?.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 -mt-4">
      <div className="w-full max-w-[420px] animate-scale-in">
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#fff',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid rgba(226,232,240,0.8)',
          }}
        >
          {/* Header with gradient */}
          <div
            className="px-8 pt-10 pb-8 text-center"
            style={{ background: 'linear-gradient(135deg, #0a1929 0%, #1a365d 50%, #2c5282 100%)' }}
          >
            <div
              className="w-[88px] h-[88px] rounded-full mx-auto mb-5 flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '2px solid rgba(214,158,46,0.35)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              }}
            >
              <img src="/nitj-logo.png" alt="NIT Jalandhar" className="w-16 h-16 object-contain" />
            </div>
            <h2 className="text-white text-xl font-bold tracking-tight">
              Academic Resource Exchange
            </h2>
            <p className="text-white/45 text-sm mt-1.5">
              NIT Jalandhar — Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[13px] font-semibold mb-1.5" style={{ color: '#4a5568' }}>
                College Email
              </label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: '#a0aec0' }} />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@nitj.ac.in"
                  className="input-field"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-[13px] font-semibold mb-1.5" style={{ color: '#4a5568' }}>
                Password
              </label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" style={{ color: '#a0aec0' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field"
                  style={{ paddingRight: '48px' }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#a0aec0' }}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <HiEyeOff className="w-[18px] h-[18px]" /> : <HiEye className="w-[18px] h-[18px]" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Quick Login */}
            <div style={{ borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
              <p className="text-[11px] text-center mb-2.5 font-semibold uppercase tracking-wider" style={{ color: '#a0aec0' }}>
                Quick Login (Demo)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Admin', email: 'admin@nitj.ac.in', pass: 'admin123', color: '#e53e3e' },
                  { label: 'Teacher', email: 'teacher@nitj.ac.in', pass: 'teacher123', color: '#3182ce' },
                  { label: 'Student', email: 'student@nitj.ac.in', pass: '21105001', color: '#38a169' },
                ].map((cred) => (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
                    className="text-[12px] font-semibold py-2 px-3 rounded-lg transition-all hover:-translate-y-0.5"
                    style={{
                      background: `${cred.color}08`,
                      border: `1.5px solid ${cred.color}20`,
                      color: cred.color,
                    }}
                  >
                    {cred.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-center text-[11px] pt-1" style={{ color: '#a0aec0' }}>
              <p>Default credentials: college email + roll number</p>
              <p className="mt-1">
                Forgot password?{' '}
                <span className="font-semibold cursor-pointer" style={{ color: '#d69e2e' }}>Contact Admin</span>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
