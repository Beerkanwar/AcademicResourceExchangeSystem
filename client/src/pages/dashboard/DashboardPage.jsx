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
      className="card p-5 animate-slide-up group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#a0aec0' }}>
            {label}
          </p>
          <p className="text-2xl font-bold mt-1.5" style={{ color: '#1a202c' }}>{value}</p>
          {subtext && (
            <p className="text-[11px] mt-1" style={{ color: '#a0aec0' }}>{subtext}</p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
          style={{ background: c.iconBg }}
        >
          <Icon className="w-6 h-6" style={{ color: c.icon }} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isTeacher } = useAuth();

  const stats = [
    { icon: HiOutlineFolder, label: 'Total Resources', value: '—', color: 'navy', subtext: 'Coming in Phase 4' },
    { icon: HiOutlineUpload, label: 'My Uploads', value: '—', color: 'gold', subtext: 'Coming in Phase 4' },
    { icon: HiOutlineBookmark, label: 'Bookmarks', value: '—', color: 'blue', subtext: 'Coming in Phase 8' },
    { icon: HiOutlineCloudDownload, label: 'Downloads', value: '—', color: 'green', subtext: 'Coming in Phase 6' },
  ];

  const adminStats = [
    { icon: HiOutlineShieldCheck, label: 'Pending Verification', value: '—', color: 'orange', subtext: 'Coming in Phase 5' },
    { icon: HiOutlineUsers, label: 'Total Users', value: '—', color: 'navy', subtext: 'Coming in Phase 3' },
    { icon: HiOutlineStar, label: 'Average Rating', value: '—', color: 'gold', subtext: 'Coming in Phase 8' },
    { icon: HiOutlineAcademicCap, label: 'Departments', value: '—', color: 'green', subtext: 'Coming in Phase 4' },
  ];

  const quickActions = [
    { icon: HiOutlineUpload, title: 'Upload Resource', desc: 'Share notes, PDFs, assignments with your peers', href: '/upload', gradient: 'linear-gradient(135deg, #d69e2e, #ecc94b)' },
    { icon: HiOutlineFolder, title: 'Browse Resources', desc: 'Discover resources organized by subject & semester', href: '/resources', gradient: 'linear-gradient(135deg, #1a365d, #2c5282)' },
    { icon: HiOutlineAcademicCap, title: 'My Department', desc: 'View resources in your department', href: '/resources', gradient: 'linear-gradient(135deg, #38a169, #48bb78)' },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div
        className="rounded-2xl px-7 py-7 animate-fade-in"
        style={{
          background: 'linear-gradient(135deg, #0a1929 0%, #1a365d 40%, #2c5282 100%)',
          boxShadow: '0 8px 30px rgba(26, 54, 93, 0.25)',
        }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(214,158,46,0.35)',
            }}
          >
            <span className="text-2xl font-bold" style={{ color: '#ecc94b' }}>
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Welcome back, {user?.firstName || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-white/50 text-sm mt-0.5">
              {isAdmin
                ? 'System Administrator — Full access to all features'
                : isTeacher
                ? 'Teacher — Upload, verify, and manage resources'
                : 'Student — Browse, download, and bookmark resources'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-[15px] font-bold mb-4" style={{ color: '#2d3748' }}>Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard key={stat.label} {...stat} delay={i * 50} />
          ))}
        </div>
      </div>

      {/* Admin Stats */}
      {(isAdmin || isTeacher) && (
        <div>
          <h2 className="text-[15px] font-bold mb-4" style={{ color: '#2d3748' }}>
            {isAdmin ? 'Administration' : 'Teaching'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 50} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-[15px] font-bold mb-4" style={{ color: '#2d3748' }}>Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, i) => (
            <Link
              key={action.title}
              to={action.href}
              className="card p-5 group animate-slide-up block"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform duration-300"
                style={{ background: action.gradient }}
              >
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold text-sm" style={{ color: '#2d3748' }}>{action.title}</h3>
              <p className="text-[12px] mt-1" style={{ color: '#a0aec0' }}>{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="card p-6 animate-slide-up">
        <h2 className="text-[15px] font-bold mb-3" style={{ color: '#2d3748' }}>System Status</h2>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: '#38a169' }} />
          <span className="text-sm" style={{ color: '#4a5568' }}>
            Phase 2 Complete — Authentication system is fully operational
          </span>
        </div>
        <p className="text-[12px] mt-2" style={{ color: '#a0aec0' }}>
          User management, resource upload, and search features coming in the next phases.
        </p>
      </div>
    </div>
  );
}
