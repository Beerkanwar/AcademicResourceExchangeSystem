import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  HiOutlineUsers,
  HiOutlineAcademicCap,
  HiOutlineFolder,
  HiOutlineShieldCheck,
  HiOutlinePencil
} from 'react-icons/hi';

export default function AdminPanelPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50')
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
    } catch (error) {
      toast.error('Failed to load admin panel data');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === user._id) {
      toast.error('You cannot change your own role');
      return;
    }
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success(`User role updated to ${newRole}`);
      // Update local state
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-nitj-gold rounded-full animate-spin mb-4" />
        <p className="text-xs font-black uppercase tracking-[0.2em]">Loading Secure Channel...</p>
      </div>
    );
  }

  const overviewCards = [
    { label: 'Registered Users', value: stats?.totalUsers || 0, icon: HiOutlineUsers, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Global Archives', value: stats?.totalResources || 0, icon: HiOutlineFolder, color: 'text-nitj-gold', bg: 'bg-yellow-50' },
    { label: 'Pending Verification', value: stats?.pendingResources || 0, icon: HiOutlineShieldCheck, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Departments Array', value: stats?.totalDepartments || 0, icon: HiOutlineAcademicCap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="w-full space-y-10 animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Administrative Control</h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            System overview and global role-based access management.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, i) => (
          <div key={i} className="card p-6 border-none shadow-sm flex items-center justify-between bg-white" style={{ borderRadius: '10px' }}>
             <div>
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{card.label}</p>
               <p className="text-3xl font-black text-slate-800">{card.value}</p>
             </div>
             <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-7 h-7 ${card.color}`} />
             </div>
          </div>
        ))}
      </div>

      {/* User Management Table */}
      <div className="card overflow-hidden border-none shadow-sm bg-white" style={{ borderRadius: '10px' }}>
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 flex items-center gap-3">
             <HiOutlineUsers className="w-5 h-5 text-nitj-gold" /> User Access Directory
           </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-black tracking-[0.15em] text-slate-400">
              <tr>
                <th className="px-6 py-4">User Identity</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4 text-right">Modify Privilege</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-nitj-gold/20 flex items-center justify-center text-nitj-gold font-bold text-xs uppercase shadow-inner">
                        {u.firstName?.[0] || u.email[0]}
                      </div>
                      <span className="font-bold text-slate-800">{u.firstName ? `${u.firstName} ${u.lastName || ''}` : 'Pending Setup'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium">{u.email}</td>
                  <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {u.department?.code || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      u.role === 'admin' ? 'bg-red-50 text-red-600' :
                      u.role === 'teacher' ? 'bg-blue-50 text-blue-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={u._id === user._id}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg outline-none cursor-pointer disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-8 border border-slate-200"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
