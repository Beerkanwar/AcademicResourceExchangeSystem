import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  HiOutlineFolder,
  HiOutlineUpload,
  HiOutlineShieldCheck,
  HiOutlineUsers,
  HiOutlineBookmark,
  HiOutlineStar,
  HiOutlineCloudDownload,
  HiOutlineAcademicCap,
} from 'react-icons/hi';

const statColors = {
  navy: { bg: '#1a365d10', icon: '#1a365d', iconBg: '#1a365d15' },
  gold: { bg: '#d69e2e10', icon: '#b7791f', iconBg: '#d69e2e15' },
  blue: { bg: '#3182ce10', icon: '#3182ce', iconBg: '#3182ce15' },
  green: { bg: '#38a16910', icon: '#38a169', iconBg: '#38a16915' },
  orange: { bg: '#dd6b2010', icon: '#dd6b20', iconBg: '#dd6b2015' },
  red: { bg: '#e53e3e10', icon: '#e53e3e', iconBg: '#e53e3e15' },
};

function StatCard({ icon: Icon, label, value, color, subtext, delay = 0 }) {
  const c = statColors[color] || statColors.navy;
  return (
    <div
      className="card p-8 animate-slide-up group border-none shadow-sm hover:shadow-xl bg-white"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
            {label}
          </p>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
          {subtext && (
            <p className="text-xs font-bold mt-2 text-slate-300 uppercase tracking-widest">{subtext}</p>
          )}
        </div>
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner"
          style={{ background: c.iconBg }}
        >
          <Icon className="w-8 h-8" style={{ color: c.icon }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isTeacher } = useAuth();

  const stats = [
    { icon: HiOutlineFolder, label: 'Resources', value: '—', color: 'navy', subtext: 'Phase 4' },
    { icon: HiOutlineUpload, label: 'Uploads', value: '—', color: 'gold', subtext: 'Phase 4' },
    { icon: HiOutlineBookmark, label: 'Bookmarks', value: '—', color: 'blue', subtext: 'Phase 8' },
    { icon: HiOutlineCloudDownload, label: 'Downloads', value: '—', color: 'green', subtext: 'Phase 6' },
  ];

  const adminStats = [
    { icon: HiOutlineShieldCheck, label: 'Pending', value: '—', color: 'orange', subtext: 'Phase 5' },
    { icon: HiOutlineUsers, label: 'Users', value: '—', color: 'navy', subtext: 'Phase 3' },
    { icon: HiOutlineStar, label: 'Rating', value: '—', color: 'gold', subtext: 'Phase 8' },
    { icon: HiOutlineAcademicCap, label: 'Depts', value: '—', color: 'green', subtext: 'Phase 4' },
  ];

  const quickActions = [
    { icon: HiOutlineUpload, title: 'Upload Resource', desc: 'Share academic materials with peers', href: '/upload', gradient: 'linear-gradient(135deg, #d69e2e, #ecc94b)' },
    { icon: HiOutlineFolder, title: 'Browse Repository', desc: 'Explore verified notes and papers', href: '/resources', gradient: 'linear-gradient(135deg, #1a365d, #2c5282)' },
    { icon: HiOutlineAcademicCap, title: 'My Department', desc: 'View department-specific resources', href: '/resources', gradient: 'linear-gradient(135deg, #38a169, #48bb78)' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <div
        className="px-10 py-12 animate-fade-in relative overflow-hidden"
        style={{
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #0a1929 0%, #1a365d 40%, #2c5282 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        }}
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div
            className="w-24 h-24 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(236,201,75,0.3)',
              boxShadow: '0 0 30px rgba(0,0,0,0.2)',
            }}
          >
            <span className="text-4xl font-black" style={{ color: '#ecc94b' }}>
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Welcome, {user?.firstName || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-white/50 text-base md:text-lg mt-2 font-medium">
              {isAdmin
                ? 'System Administrator • Full Repository Access'
                : isTeacher
                ? 'Faculty Member • Resource Management Access'
                : 'Student Member • Resource Discovery Access'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-400">System Repository Stats</h2>
          <div className="h-px flex-1 bg-slate-200 ml-6 hidden sm:block" />
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 20vw, 280px), 1fr))' }}>
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 50} />
          ))}
        </div>
      </section>

      {/* Admin Stats */}
      {(isAdmin || isTeacher) && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-400">
              {isAdmin ? 'Administrative Control' : 'Teaching Analytics'}
            </h2>
            <div className="h-px flex-1 bg-slate-200 ml-6 hidden sm:block" />
          </div>
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 20vw, 280px), 1fr))' }}>
            {adminStats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 50} />
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[13px] font-black uppercase tracking-[0.25em] text-slate-400">Rapid Deployment</h2>
          <div className="h-px flex-1 bg-slate-200 ml-6 hidden sm:block" />
        </div>
        <div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(260px, 30vw, 360px), 1fr))' }}>
          {quickActions.map((action, i) => (
            <Link
              key={action.title}
              to={action.href}
              className="card p-8 group animate-slide-up block relative overflow-hidden bg-white border-none shadow-sm hover:shadow-2xl transition-all"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg"
                  style={{ background: action.gradient }}
                >
                  <action.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-black text-xl text-slate-800 tracking-tight">{action.title}</h3>
                <p className="text-base mt-2 text-slate-500 font-medium leading-relaxed">{action.desc}</p>
                <div className="mt-8 flex items-center gap-2 text-nitj-gold font-bold text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                  Launch Action <span className="text-lg">→</span>
                </div>
              </div>
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-slate-100/50 transition-colors" />
            </Link>
          ))}
        </div>
      </section>

      {/* System Status */}
      <div className="card p-10 animate-slide-up border-none shadow-sm bg-white">
        <h2 className="text-lg font-black text-slate-800 mb-4 uppercase tracking-tight">Technical Infrastructure Status</h2>
        <div className="flex items-center gap-4 p-5 bg-success/5 rounded-lg border border-success/10">
          <div className="w-4 h-4 rounded-full bg-success animate-pulse shadow-[0_0_12px_rgba(56,161,105,0.4)]" />
          <span className="text-base font-bold text-success-dark">
            Phase 2 Operational — Production Environment Stable
          </span>
        </div>
        <p className="text-sm mt-5 text-slate-500 font-bold uppercase tracking-widest leading-loose">
          Core Authentication Module Active • User Management (Phase 3) Deploying Next
        </p>
      </div>
    </div>
  );
}
