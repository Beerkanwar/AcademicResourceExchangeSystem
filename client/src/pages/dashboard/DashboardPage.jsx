import { useAuth } from '../../hooks/useAuth';
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

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-all duration-300 p-5 group animate-slide-up">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-text-muted text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-text-heading mt-1">{value}</p>
        {subtext && (
          <p className="text-xs text-text-muted mt-1">{subtext}</p>
        )}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

export default function DashboardPage() {
  const { user, isAdmin, isTeacher } = useAuth();

  // Placeholder stats — will be dynamic in later phases
  const stats = [
    {
      icon: HiOutlineFolder,
      label: 'Total Resources',
      value: '—',
      color: 'bg-primary/10 text-primary',
      subtext: 'Coming in Phase 4',
    },
    {
      icon: HiOutlineUpload,
      label: 'My Uploads',
      value: '—',
      color: 'bg-nitj-gold/10 text-nitj-gold-dark',
      subtext: 'Coming in Phase 4',
    },
    {
      icon: HiOutlineBookmark,
      label: 'Bookmarks',
      value: '—',
      color: 'bg-info/10 text-info',
      subtext: 'Coming in Phase 8',
    },
    {
      icon: HiOutlineCloudDownload,
      label: 'Downloads',
      value: '—',
      color: 'bg-success/10 text-success',
      subtext: 'Coming in Phase 6',
    },
  ];

  const adminStats = [
    {
      icon: HiOutlineShieldCheck,
      label: 'Pending Verification',
      value: '—',
      color: 'bg-warning/10 text-warning',
      subtext: 'Coming in Phase 5',
    },
    {
      icon: HiOutlineUsers,
      label: 'Total Users',
      value: '—',
      color: 'bg-primary/10 text-primary',
      subtext: 'Coming in Phase 3',
    },
    {
      icon: HiOutlineStar,
      label: 'Average Rating',
      value: '—',
      color: 'bg-nitj-gold/10 text-nitj-gold-dark',
      subtext: 'Coming in Phase 8',
    },
    {
      icon: HiOutlineAcademicCap,
      label: 'Departments',
      value: '—',
      color: 'bg-success/10 text-success',
      subtext: 'Coming in Phase 4',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-nitj-navy to-nitj-navy-light rounded-2xl p-6 md:p-8 text-white shadow-lg animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-nitj-gold/30 flex items-center justify-center flex-shrink-0">
            <span className="text-nitj-gold text-xl font-bold">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Welcome back, {user?.firstName || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-white/60 text-sm mt-0.5">
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
        <h2 className="text-lg font-semibold text-text-heading mb-4">Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </div>

      {/* Admin/Teacher Stats */}
      {(isAdmin || isTeacher) && (
        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-4">
            {isAdmin ? 'Administration' : 'Teaching'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {adminStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-text-heading mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickAction
            icon={HiOutlineUpload}
            title="Upload Resource"
            description="Share notes, PDFs, assignments with your peers"
            href="/upload"
            color="bg-nitj-gold"
          />
          <QuickAction
            icon={HiOutlineFolder}
            title="Browse Resources"
            description="Discover resources organized by subject & semester"
            href="/resources"
            color="bg-primary"
          />
          <QuickAction
            icon={HiOutlineAcademicCap}
            title="My Department"
            description="View resources in your department"
            href="/resources"
            color="bg-success"
          />
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-card p-6 animate-slide-up">
        <h2 className="text-lg font-semibold text-text-heading mb-3">System Status</h2>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-text-body">
            Phase 1 Complete — Project architecture and skeleton built successfully
          </span>
        </div>
        <p className="text-xs text-text-muted mt-2">
          Authentication, resource upload, and search features coming in the next phases.
        </p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, href, color }) {
  return (
    <a
      href={href}
      className="bg-white rounded-xl shadow-card hover:shadow-card-hover p-5 transition-all duration-300 group block animate-slide-up"
    >
      <div className={`w-10 h-10 rounded-lg ${color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-semibold text-text-heading text-sm">{title}</h3>
      <p className="text-xs text-text-muted mt-1">{description}</p>
    </a>
  );
}
