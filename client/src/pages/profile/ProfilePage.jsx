import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineAcademicCap,
  HiOutlineIdentification,
  HiOutlinePhone,
  HiOutlinePencil,
  HiOutlineCheck,
  HiOutlineX,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const ROLE_COLORS = {
  admin: { bg: 'rgba(229, 62, 62, 0.1)', text: '#e53e3e' },
  teacher: { bg: 'rgba(49, 130, 206, 0.1)', text: '#3182ce' },
  student: { bg: 'rgba(56, 161, 105, 0.1)', text: '#38a169' },
};

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setProfile(res.data.data);
      setForm({
        firstName: res.data.data.firstName || '',
        lastName: res.data.data.lastName || '',
        phone: res.data.data.phone || '',
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', form);
      setProfile(res.data.data);
      updateUser(res.data.data);
      setEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="card p-8 animate-pulse">
          <div className="h-24 w-24 rounded-2xl mx-auto mb-4 bg-slate-100" />
          <div className="h-6 rounded w-48 mx-auto mb-2 bg-slate-100" />
          <div className="h-4 rounded w-36 mx-auto bg-slate-100" />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const roleColor = ROLE_COLORS[profile.role] || ROLE_COLORS.student;

  return (
    <div className="w-full max-w-5xl mx-auto animate-fade-in space-y-8">
      <div className="card overflow-hidden border-none shadow-2xl bg-white" style={{ borderRadius: '10px' }}>
        {/* Profile Header */}
        <div className="gradient-header px-10 py-16 text-center relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-nitj-gold/5 rounded-full -ml-32 -mb-32 blur-2xl" />

          <div
            className="w-28 h-28 rounded-xl flex items-center justify-center mx-auto mb-6 relative z-10 shadow-2xl"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(236,201,75,0.4)',
            }}
          >
            <span className="text-4xl font-black" style={{ color: '#ecc94b' }}>
              {profile.firstName?.[0] || profile.email[0].toUpperCase()}
              {profile.lastName?.[0] || ''}
            </span>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-white text-3xl font-black tracking-tight">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.email.split('@')[0]}
            </h1>
            <p className="text-white/50 text-lg mt-2 font-bold uppercase tracking-widest">{profile.email}</p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <span
                className="px-5 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-[0.2em] shadow-lg"
                style={{ background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.text}30` }}
              >
                {profile.role}
              </span>
              {profile.department && (
                <span className="px-5 py-1.5 rounded-lg text-[12px] font-black uppercase tracking-[0.2em] bg-white/10 text-white border border-white/20">
                  {profile.department.code}
                </span>
              )}
            </div>
          </div>

          {/* Edit toggle */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-8 right-8 p-3 rounded-xl bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all z-20 shadow-lg"
              title="Edit Profile"
            >
              <HiOutlinePencil className="w-6 h-6" />
            </button>
          ) : (
            <div className="absolute top-8 right-8 flex gap-3 z-20">
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-3 rounded-xl bg-success/20 text-success hover:bg-success/30 transition-all shadow-lg"
                title="Save Changes"
              >
                <HiOutlineCheck className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setForm({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    phone: profile.phone || '',
                  });
                }}
                className="p-3 rounded-xl bg-danger/20 text-danger hover:bg-danger/30 transition-all shadow-lg"
                title="Cancel"
              >
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-10 md:p-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
            <ProfileField
              icon={HiOutlineUser}
              label="First Name"
              value={profile.firstName || '—'}
              editing={editing}
              editValue={form.firstName}
              onChange={(v) => setForm({ ...form, firstName: v })}
            />
            <ProfileField
              icon={HiOutlineUser}
              label="Last Name"
              value={profile.lastName || '—'}
              editing={editing}
              editValue={form.lastName}
              onChange={(v) => setForm({ ...form, lastName: v })}
            />
            <ProfileField
              icon={HiOutlineMail}
              label="Institutional Email"
              value={profile.email}
            />
            <ProfileField
              icon={HiOutlineIdentification}
              label="University Roll ID"
              value={profile.rollNumber || '—'}
            />
            <ProfileField
              icon={HiOutlineAcademicCap}
              label="Academic Department"
              value={profile.department?.name || '—'}
            />
            <ProfileField
              icon={HiOutlinePhone}
              label="Contact Number"
              value={profile.phone || '—'}
              editing={editing}
              editValue={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />
          </div>

          {/* Meta Footer */}
          <div className="pt-14 mt-14 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>Last Access: {profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : 'Active Now'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span>System Member Since: {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value, editing, editValue, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</p>
      </div>
      <div className="pl-11">
        {editing && onChange ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-base font-bold border-b-2 outline-none py-2 bg-transparent transition-colors"
            style={{ color: '#2d3748', borderColor: '#d69e2e44' }}
            onFocus={(e) => { e.target.style.borderColor = '#d69e2e'; }}
            onBlur={(e) => { e.target.style.borderColor = '#d69e2e44'; }}
          />
        ) : (
          <p className="text-lg font-bold text-slate-700 truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
