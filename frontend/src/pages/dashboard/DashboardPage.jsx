import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
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
    <div className="bg-white border border-[#c5d8ed] rounded-md p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[#6c7a8e] uppercase tracking-wider">{label}</p>
        <div style={{ background: c.iconBg }} className="p-2 rounded-lg">
          <Icon className="w-5 h-5" style={{ color: c.icon }} />
        </div>
      </div>
      <p className="text-3xl font-bold text-[#1a1a2e]">{value}</p>
      {subtext && <p className="text-[10px] text-[#6c7a8e] mt-1 uppercase">{subtext}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isAdmin, isTeacher } = useAuth();
  
  const [userStats, setUserStats] = useState({
    totalUploads: '—', totalDownloads: '—', reputationScore: '—', pending: '—'
  });
  const [adminData, setAdminData] = useState({
    pendingResources: '—', totalUsers: '—', totalDepartments: '—', totalResources: '—'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const uStats = await api.get('/resources/user/stats');
        setUserStats(uStats.data.data);
        
        if (isAdmin || isTeacher) {
          const aStats = await api.get('/admin/stats');
          setAdminData(aStats.data.data);
        }
      } catch { /* ignore */ }
    }
    fetchStats();
  }, [isAdmin, isTeacher]);

  const stats = [
    { icon: HiOutlineUpload, label: 'Uploads', value: userStats.totalUploads, color: 'gold' },
    { icon: HiOutlineShieldCheck, label: 'Pending Auth', value: userStats.pending, color: 'orange' },
    { icon: HiOutlineCloudDownload, label: 'Downloads Received', value: userStats.totalDownloads, color: 'green' },
    { icon: HiOutlineStar, label: 'Reputation', value: userStats.reputationScore, color: 'blue' },
  ];

  const adminStats = [
    { icon: HiOutlineShieldCheck, label: 'Pending DB', value: adminData.pendingResources, color: 'orange' },
    { icon: HiOutlineUsers, label: 'Global Users', value: adminData.totalUsers, color: 'navy' },
    { icon: HiOutlineFolder, label: 'Archives', value: adminData.totalResources, color: 'gold' },
    { icon: HiOutlineAcademicCap, label: 'Depts', value: adminData.totalDepartments, color: 'green' },
  ];

  const quickActions = [
    { icon: HiOutlineUpload, title: 'Upload Resource', desc: 'Share academic materials with peers', href: '/upload', gradient: 'linear-gradient(135deg, #d69e2e, #ecc94b)' },
    { icon: HiOutlineFolder, title: 'Browse Repository', desc: 'Explore verified notes and papers', href: '/resources', gradient: 'linear-gradient(135deg, #1a365d, #2c5282)' },
    { icon: HiOutlineAcademicCap, title: 'My Department', desc: 'View department-specific resources', href: '/resources', gradient: 'linear-gradient(135deg, #38a169, #48bb78)' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <section className="panel mb-6">
        <div className="content-card-header">
          <HiOutlineAcademicCap className="w-5 h-5 mr-2" /> Welcome to Academic Resource Exchange
        </div>
        <div className="content-card-body">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#1a3a6e] text-[#e8a020] text-3xl font-bold">
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a3a6e]">
                Welcome back, {user?.firstName || user?.email?.split('@')[0]}
              </h1>
              <p className="text-[#6c7a8e] font-medium text-sm">
                {isAdmin ? 'System Administrator • Full Repository Access' : isTeacher ? 'Faculty Member • Resource Management Access' : 'Student Member • Resource Discovery Access'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="panel mb-6">
        <div className="content-card-header">
          <HiOutlineStar className="w-5 h-5 mr-2" /> System Repository Stats
        </div>
        <div className="content-card-body">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StatCard key={stat.label} {...stat} delay={i * 50} />
            ))}
          </div>
        </div>
      </section>

      {/* Admin Stats */}
      {(isAdmin || isTeacher) && (
        <section className="panel mb-6">
          <div className="content-card-header">
            <HiOutlineShieldCheck className="w-5 h-5 mr-2" /> {isAdmin ? 'Administrative Control' : 'Teaching Analytics'}
          </div>
          <div className="content-card-body">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {adminStats.map((stat, i) => (
                <StatCard key={stat.label} {...stat} delay={i * 50} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="panel mb-6">
        <div className="content-card-header">
          <HiOutlineUpload className="w-5 h-5 mr-2" /> Rapid Deployment
        </div>
        <div className="content-card-body">
          <div className="grid gap-5 md:grid-cols-3">
            {quickActions.map((action, i) => (
              <Link
                key={action.title}
                to={action.href}
                className="bg-[#f8fbff] border border-[#d0e4f4] rounded-md p-5 block hover:border-[#1a3a6e] hover:bg-[#e8f0fd] transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded text-center flex items-center justify-center text-white" style={{ background: action.gradient }}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-[#1a3a6e] text-sm">{action.title}</h3>
                </div>
                <p className="text-xs text-[#6c7a8e]">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="panel">
        <div className="nitj-info-box border-l-[#28a745]">
          <strong><HiOutlineShieldCheck className="w-4 h-4 inline me-1" /> Technical Infrastructure Status:</strong> System Production Ready. Core engine stable.<br />
          <span className="text-xs text-muted">Secure Database Connections Alive • Native Roles Guarded</span>
        </div>
      </section>
    </div>
  );
}
