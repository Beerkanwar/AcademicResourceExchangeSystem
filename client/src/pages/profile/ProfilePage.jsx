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
import { ROLE_COLORS } from '../../utils/constants';

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
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-card p-8 animate-pulse">
          <div className="h-24 w-24 rounded-full bg-gray-200 mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-36 mx-auto" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const roleColor = ROLE_COLORS[profile.role] || ROLE_COLORS.student;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card-hover overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-nitj-navy to-nitj-navy-light px-6 py-8 text-center relative">
          <div className="w-20 h-20 rounded-full bg-white/15 border-3 border-nitj-gold/40 flex items-center justify-center mx-auto mb-3">
            <span className="text-nitj-gold text-2xl font-bold">
              {profile.firstName?.[0] || profile.email[0].toUpperCase()}
              {profile.lastName?.[0] || ''}
            </span>
          </div>
          <h1 className="text-white text-xl font-bold">
            {profile.firstName && profile.lastName
              ? `${profile.firstName} ${profile.lastName}`
              : profile.email.split('@')[0]}
          </h1>
          <p className="text-white/60 text-sm mt-0.5">{profile.email}</p>
          <span
            className={`inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-semibold capitalize ${roleColor.bg} ${roleColor.text}`}
          >
            {profile.role}
          </span>

          {/* Edit toggle */}
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
              title="Edit Profile"
            >
              <HiOutlinePencil className="w-5 h-5" />
            </button>
          ) : (
            <div className="absolute top-4 right-4 flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-green-300 hover:text-green-100 transition-colors"
                title="Save"
              >
                <HiOutlineCheck className="w-5 h-5" />
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
                className="text-red-300 hover:text-red-100 transition-colors"
                title="Cancel"
              >
                <HiOutlineX className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-4">
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
            label="Email"
            value={profile.email}
          />
          <ProfileField
            icon={HiOutlineIdentification}
            label="Roll Number"
            value={profile.rollNumber || '—'}
          />
          <ProfileField
            icon={HiOutlineAcademicCap}
            label="Department"
            value={profile.department?.name || '—'}
          />
          <ProfileField
            icon={HiOutlinePhone}
            label="Phone"
            value={profile.phone || '—'}
            editing={editing}
            editValue={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />

          {/* Meta */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="grid grid-cols-2 gap-4 text-xs text-text-muted">
              <div>
                <span className="font-medium">Last Login:</span>{' '}
                {profile.lastLogin
                  ? new Date(profile.lastLogin).toLocaleString()
                  : 'Never'}
              </div>
              <div>
                <span className="font-medium">Member Since:</span>{' '}
                {new Date(profile.createdAt).toLocaleDateString()}
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
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-muted font-medium">{label}</p>
        {editing && onChange ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => onChange(e.target.value)}
            className="w-full text-sm text-text-heading border-b border-nitj-gold/30 focus:border-nitj-gold outline-none py-0.5 bg-transparent"
          />
        ) : (
          <p className="text-sm text-text-heading font-medium truncate">{value}</p>
        )}
      </div>
    </div>
  );
}
