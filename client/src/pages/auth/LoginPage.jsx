import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { HiOutlineMail, HiOutlineLockClosed, HiEye, HiEyeOff, HiOutlineShieldCheck, HiOutlineLibrary } from 'react-icons/hi';
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
    <div className="min-h-screen w-full flex bg-[#edf2f7]">
      {/* Left Branding Panel (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden" 
           style={{ background: 'linear-gradient(135deg, #0a1929 0%, #0f2440 50%, #1a365d 100%)' }}>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#d69e2e]/10 rounded-full -ml-20 -mb-20 blur-3xl flex items-center justify-center pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-12 lg:p-20 text-center">
          <div className="w-[120px] h-[120px] rounded-full mb-8 flex items-center justify-center bg-white/5 border border-white/10 shadow-[0_0_40px_rgba(214,158,46,0.15)]">
            <img src="/nitj-logo.png" alt="NIT Jalandhar" className="w-20 h-20 object-contain drop-shadow-xl" />
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Academic Resource <br className="hidden xl:block" />
            <span style={{ color: '#ecc94b' }}>Exchange</span>
          </h1>
          
          <p className="text-white/60 text-lg xl:text-xl font-medium max-w-md mx-auto leading-relaxed">
            The unified platform for NIT Jalandhar students and faculty to share and discover verified academic materials.
          </p>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#d69e2e]/20 flex items-center justify-center">
                  <HiOutlineLibrary className="w-6 h-6 text-[#ecc94b]" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-sm">Centralized</h3>
                  <p className="text-white/40 text-xs font-medium mt-0.5">Access all resources</p>
                </div>
             </div>
             <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm shadow-lg">
                <div className="w-12 h-12 rounded-xl bg-[#38a169]/20 flex items-center justify-center">
                  <HiOutlineShieldCheck className="w-6 h-6 text-[#48bb78]" />
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-sm">Verified</h3>
                  <p className="text-white/40 text-xs font-medium mt-0.5">Faculty approved</p>
                </div>
             </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-0 w-full text-center text-white/30 text-xs font-bold tracking-widest uppercase">
          Dr B R Ambedkar National Institute of Technology
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10 w-full animate-fade-in">
        <div className="w-full max-w-[min(92vw,440px)] animate-scale-in" style={{ animationDelay: '100ms' }}>
          
          {/* Mobile Header Branding */}
          <div className="lg:hidden text-center mb-10">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-white shadow-xl border border-slate-100 p-3">
              <img src="/nitj-logo.png" alt="NIT Jalandhar" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Resource Exchange</h2>
            <p className="text-slate-500 text-sm mt-1 font-medium">Log in to your NITJ account</p>
          </div>

          <div className="card shadow-[0_8px_30px_rgba(0,0,0,0.06)] border-none">
            <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
              <h2 className="text-xl font-black text-slate-800 tracking-tight">
                Welcome Back
              </h2>
              <p className="text-slate-500 text-sm mt-1.5 font-bold">
                Enter your credentials to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-[13px] font-black mb-2 text-slate-600 uppercase tracking-wide">
                  College Email
                </label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@nitj.ac.in"
                    className="input-field shadow-sm bg-slate-50/50 hover:bg-white focus:bg-white"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-[13px] font-black mb-2 text-slate-600 uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <HiOutlineLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="input-field shadow-sm bg-slate-50/50 hover:bg-white focus:bg-white"
                    style={{ paddingRight: '48px' }}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors text-slate-400 hover:text-[#d69e2e] focus:outline-none"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <HiEyeOff className="w-[18px] h-[18px]" /> : <HiEye className="w-[18px] h-[18px]" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-primary mt-2 group relative overflow-hidden">
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to Dashboard'
                  )}
                </span>
              </button>

              {/* Quick Login */}
              <div className="pt-6 mt-4 border-t border-slate-100">
                <p className="text-[11px] text-center mb-3 font-black uppercase tracking-[0.2em] text-slate-400">
                  Quick Login For Review
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Admin', email: 'admin@nitj.ac.in', pass: 'admin123', color: '#1a365d' },
                    { label: 'Teacher', email: 'teacher@nitj.ac.in', pass: 'teacher123', color: '#d69e2e' },
                    { label: 'Student', email: 'student@nitj.ac.in', pass: '21105001', color: '#38a169' },
                  ].map((cred) => (
                    <button
                      key={cred.label}
                      type="button"
                      onClick={() => { setEmail(cred.email); setPassword(cred.pass); }}
                      className="text-[11px] font-bold py-2 px-1 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md border border-slate-200 bg-white"
                      style={{ color: cred.color }}
                    >
                      {cred.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center text-[12px] pt-2 text-slate-500 font-medium">
                <p>Forgot password?{' '}
                  <span className="font-bold text-[#d69e2e] cursor-pointer hover:underline transition-all">Contact Admin</span>
                </p>
              </div>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
}
