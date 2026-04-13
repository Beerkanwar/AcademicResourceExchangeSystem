import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import {
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineUser,
  HiOutlineAcademicCap,
  HiOutlineTag,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  pdf: '📄', ppt: '📊', pptx: '📊', doc: '📝', docx: '📝',
  txt: '📃', zip: '📦', rar: '📦', xls: '📈', xlsx: '📈', csv: '📈',
  png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
};

const STATUS_COLORS = {
  approved: { bg: '#38a16915', color: '#38a169', label: 'Approved' },
  pending: { bg: '#dd6b2015', color: '#dd6b20', label: 'Pending Review' },
  rejected: { bg: '#e53e3e15', color: '#e53e3e', label: 'Rejected' },
};

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResource();
  }, [id]); // eslint-disable-line

  const fetchResource = async () => {
    try {
      const res = await api.get(`/resources/${id}`);
      setResource(res.data.data);
    } catch (err) {
      toast.error('Resource not found');
      navigate('/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/resources/${id}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', resource.originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Download started!');
      setResource((prev) => ({ ...prev, downloads: prev.downloads + 1 }));
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success('Resource deleted');
      navigate('/resources');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8 animate-pulse">
          <div className="h-6 rounded w-1/3 mb-4" style={{ background: '#edf2f7' }} />
          <div className="h-4 rounded w-full mb-2" style={{ background: '#edf2f7' }} />
          <div className="h-4 rounded w-2/3 mb-6" style={{ background: '#edf2f7' }} />
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-16 rounded-lg" style={{ background: '#f7fafc' }} />)}
          </div>
        </div>
      </div>
    );
  }

  if (!resource) return null;

  const isOwner = user?._id === resource.uploadedBy?._id;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner || isAdmin;
  const status = STATUS_COLORS[resource.status] || STATUS_COLORS.pending;

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      {/* Back link */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] font-medium transition-colors" style={{ color: '#718096' }}>
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Resources
      </button>

      {/* Main Card */}
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="gradient-header px-6 py-6">
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              {FILE_ICONS[resource.fileType] || '📄'}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-white leading-tight">{resource.title}</h1>
              <p className="text-[12px] text-white/50 mt-1">
                {resource.originalFilename} • {formatSize(resource.fileSize)} • .{resource.fileType?.toUpperCase()}
              </p>
            </div>
            <span className="badge flex-shrink-0" style={{ background: status.bg, color: status.color }}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Description */}
          {resource.description && (
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-2" style={{ color: '#a0aec0' }}>Description</h3>
              <p className="text-[14px] leading-relaxed" style={{ color: '#4a5568' }}>{resource.description}</p>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatBox icon={HiOutlineEye} label="Views" value={resource.views} color="#3182ce" />
            <StatBox icon={HiOutlineDownload} label="Downloads" value={resource.downloads} color="#38a169" />
            <StatBox icon={HiOutlineStar} label="Rating" value={resource.averageRating > 0 ? resource.averageRating.toFixed(1) : '—'} color="#d69e2e" />
            <StatBox icon={HiOutlineClock} label="Uploaded" value={new Date(resource.createdAt).toLocaleDateString()} color="#718096" />
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resource.department && (
              <DetailRow icon={HiOutlineAcademicCap} label="Department" value={`${resource.department.name} (${resource.department.code})`} />
            )}
            {resource.semester && <DetailRow icon={HiOutlineDocumentText} label="Semester" value={`Semester ${resource.semester}`} />}
            {resource.subject && <DetailRow icon={HiOutlineDocumentText} label="Subject" value={`${resource.subject.name} (${resource.subject.code})`} />}
            {resource.courseCode && <DetailRow icon={HiOutlineDocumentText} label="Course Code" value={resource.courseCode} />}
            {resource.author && <DetailRow icon={HiOutlineUser} label="Author" value={resource.author} />}
            {resource.academicYear && <DetailRow icon={HiOutlineClock} label="Academic Year" value={resource.academicYear} />}
          </div>

          {/* Tags */}
          {resource.tags?.length > 0 && (
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#a0aec0' }}>
                <HiOutlineTag className="w-3.5 h-3.5" /> Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {resource.tags.map((tag) => (
                  <span key={tag} className="badge" style={{ background: '#1a365d08', color: '#1a365d' }}>#{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Uploader Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: '#f7fafc' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: '#1a365d15', color: '#1a365d' }}>
              {resource.uploadedBy?.firstName?.[0] || resource.uploadedBy?.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-[13px] font-semibold" style={{ color: '#2d3748' }}>
                {resource.uploadedBy?.firstName
                  ? `${resource.uploadedBy.firstName} ${resource.uploadedBy.lastName || ''}`
                  : resource.uploadedBy?.email}
              </p>
              <p className="text-[11px] capitalize" style={{ color: '#a0aec0' }}>{resource.uploadedBy?.role}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleDownload} className="btn-primary flex-1">
              <HiOutlineDownload className="w-5 h-5" /> Download
            </button>
            {canEdit && (
              <>
                <Link
                  to={`/resources/${id}/edit`}
                  className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ border: '1px solid #e2e8f0', color: '#3182ce' }}
                >
                  <HiOutlinePencil className="w-4 h-4" /> Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-lg text-[13px] font-medium transition-colors"
                  style={{ border: '1px solid #e53e3e20', color: '#e53e3e' }}
                >
                  <HiOutlineTrash className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resource Preview */}
      <div className="card overflow-hidden border-none shadow-sm bg-white" style={{ borderRadius: '10px' }}>
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-[13px] font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
            <HiOutlineEye className="w-4 h-4 text-nitj-gold" /> In-Browser Preview
          </h3>
        </div>
        <div className="bg-slate-50 relative" style={{ minHeight: '400px' }}>
          {['pdf'].includes(resource.fileType) ? (
            <iframe 
              src={`/uploads/${resource.storedFilename}`} 
              className="w-full"
              style={{ height: '70vh', minHeight: '600px', border: 'none' }}
              title="PDF Preview"
            />
          ) : ['png', 'jpg', 'jpeg'].includes(resource.fileType) ? (
            <div className="p-8 flex justify-center bg-slate-100/50">
               <img src={`/uploads/${resource.storedFilename}`} alt="Resource Preview" className="max-w-full rounded-lg shadow-xl" />
            </div>
          ) : ['txt'].includes(resource.fileType) ? (
             <iframe 
              src={`/uploads/${resource.storedFilename}`} 
              className="w-full bg-white p-6 font-mono text-sm leading-relaxed"
              style={{ height: '500px', border: 'none' }}
              title="Text Preview"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center px-6">
               <div className="w-20 h-20 rounded-2xl bg-white shadow-inner flex items-center justify-center mb-6">
                  {FILE_ICONS[resource.fileType] || '📄'}
               </div>
               <h4 className="text-xl font-black text-slate-800 tracking-tight uppercase">Native Preview Unavailable</h4>
               <p className="text-sm font-medium text-slate-500 max-w-sm mt-3 leading-relaxed">
                 The verification portal cannot natively render <strong className="text-slate-700">.{resource.fileType.toUpperCase()}</strong> binary files. Please download the resource to view its contents securely.
               </p>
               <button onClick={handleDownload} className="mt-8 btn-accent flex items-center gap-3 px-8 h-12 text-sm shadow-xl shadow-accent/20">
                 <HiOutlineDownload className="w-5 h-5" /> Execute Download
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Rejection Reason */}
      {resource.status === 'rejected' && resource.rejectionReason && (
        <div className="card p-5" style={{ borderLeft: '4px solid #e53e3e' }}>
          <h3 className="text-[13px] font-bold mb-1" style={{ color: '#e53e3e' }}>Rejection Reason</h3>
          <p className="text-[13px]" style={{ color: '#4a5568' }}>{resource.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }) {
  return (
    <div className="p-3 rounded-lg text-center" style={{ background: `${color}08` }}>
      <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
      <p className="text-[15px] font-bold" style={{ color: '#1a202c' }}>{value}</p>
      <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#a0aec0' }}>{label}</p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg" style={{ background: '#f7fafc' }}>
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: '#718096' }} />
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#a0aec0' }}>{label}</p>
        <p className="text-[13px] font-medium" style={{ color: '#2d3748' }}>{value}</p>
      </div>
    </div>
  );
}
