import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api, { downloadResourceBlob } from '../../api/axios';
import ResourcePreview from '../../components/resources/ResourcePreview';
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
  HiOutlineUpload,
  HiOutlineBookmark,
  HiBookmark
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
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [hoverStars, setHoverStars] = useState(0);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const res = await api.get(`/resources/${id}`);
        if (res.data.success) {
          setResource(res.data.data);
        }
      } catch (err) {
        toast.error('Resource not found');
        navigate('/resources');
      } finally {
        setLoading(false);
      }
    };

    const fetchBookmarkStatus = async () => {
      try {
        const res = await api.get(`/bookmarks/${id}/status`);
        if (res.data.success) {
          setIsBookmarked(res.data.data.bookmarked);
        }
      } catch { /* ignore */ }
    };

    const fetchRatings = async () => {
      try {
        const res = await api.get(`/ratings/resource/${id}`);
        if (res.data.success) {
          const { averageRating, totalRatings, userRating: mine } = res.data.data;
          setUserRating(mine);
          setResource((prev) =>
            prev
              ? { ...prev, averageRating, totalRatings }
              : prev
          );
        }
      } catch { /* ignore */ }
    };

    fetchResource();
    fetchBookmarkStatus();
    fetchRatings();
  }, [id, navigate]);

  const handleDownload = async () => {
    try {
      const { blob } = await downloadResourceBlob(id);
      const url = window.URL.createObjectURL(blob);
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

  const handleBookmarkToggle = async () => {
    try {
      const res = await api.post(`/bookmarks/${id}`);
      if (res.data.success) {
        setIsBookmarked(res.data.data.bookmarked);
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Failed to toggle bookmark');
    }
  };

  const handleVersionUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const toastId = toast.loading('Uploading structural payload...');
    try {
      const response = await api.post(`/resources/${id}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(response.data.message || 'Version appended natively!', { id: toastId });
      fetchResource();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Version overwrite failed', { id: toastId });
    }
  };

  const downloadOldVersion = async (version) => {
    try {
      const { blob } = await downloadResourceBlob(id, { versionId: version._id });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', version.originalFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Legacy [v${version.version}] accessed`);
    } catch {
      toast.error('Failed to parse secure legacy payload');
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

  const handleRate = async (stars) => {
    if (!user) {
      toast.error('Please log in to rate this resource');
      return;
    }
    if (resource.status !== 'approved') {
      toast.error('Only approved resources can be rated');
      return;
    }
    if (ratingSubmitting) return;

    setRatingSubmitting(true);
    try {
      let res;
      if (userRating?._id) {
        res = await api.put(`/ratings/${userRating._id}`, { stars });
      } else {
        res = await api.post(`/ratings/resource/${id}`, { stars });
      }

      if (res.data.success) {
        const { rating, averageRating, totalRatings } = res.data.data;
        setUserRating(rating);
        setResource((prev) =>
          prev ? { ...prev, averageRating, totalRatings } : prev
        );
        toast.success(res.data.message || 'Rating saved');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleClearRating = async () => {
    if (!userRating?._id || ratingSubmitting) return;
    setRatingSubmitting(true);
    try {
      const res = await api.delete(`/ratings/${userRating._id}`);
      if (res.data.success) {
        const { averageRating, totalRatings } = res.data.data;
        setUserRating(null);
        setResource((prev) =>
          prev ? { ...prev, averageRating, totalRatings } : prev
        );
        toast.success('Rating removed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove rating');
    } finally {
      setRatingSubmitting(false);
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
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      {/* Back link */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-[13px] font-medium transition-colors" style={{ color: '#718096' }}>
        <HiOutlineArrowLeft className="w-4 h-4" /> Back to Resources
      </button>

      {/* Main Card */}
      <section className="panel mb-6">
        <div className="content-card-header flex justify-between items-center">
          <div className="flex items-center"><HiOutlineDocumentText className="w-5 h-5 mr-2" /> Detail View</div>
          <button onClick={handleBookmarkToggle} className="text-white hover:text-[#d69e2e] transition-colors" title={isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}>
            {isBookmarked ? <HiBookmark className="w-5 h-5 text-[#d69e2e]" /> : <HiOutlineBookmark className="w-5 h-5" />}
          </button>
        </div>
        <div className="content-card-body p-6">
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-[#e8eef5]">
            <div className="text-4xl">{FILE_ICONS[resource.fileType] || '📄'}</div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[#1a3a6e] break-words">
                {resource.title}
                <span className="ml-3 text-xs bg-[#fffaf0] text-[#e8a020] border border-[#f3e5c9] px-2 py-0.5 rounded font-bold uppercase">
                  Version {resource.currentVersion || 1}
                </span>
              </h1>
              <p className="text-xs text-[#6c7a8e] mt-2 font-mono">
                {resource.originalFilename} • {formatSize(resource.fileSize)}
              </p>
            </div>
            <div className="badge" style={{ background: status.bg, color: status.color }}>
              {status.label}
            </div>
          </div>

          <div className="space-y-6">
            {resource.description && (
              <div>
                <h3 className="nitj-label">Description</h3>
                <p className="text-sm text-[#4a5568]">{resource.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatBox icon={HiOutlineEye} label="Views" value={resource.views} />
              <StatBox icon={HiOutlineDownload} label="Downloads" value={resource.downloads} />
              <StatBox
                icon={HiOutlineStar}
                label="Rating"
                value={
                  resource.averageRating > 0
                    ? `${Number(resource.averageRating).toFixed(1)}${resource.totalRatings ? ` (${resource.totalRatings})` : ''}`
                    : '—'
                }
              />
              <StatBox icon={HiOutlineClock} label="Uploaded" value={new Date(resource.createdAt).toLocaleDateString()} />
            </div>

            {resource.status === 'approved' && (
              <div className="bg-[#f8fbff] border border-[#c5d8ed] rounded px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[#6c7a8e] uppercase mb-1">
                      {userRating ? 'Your Rating' : 'Rate this Resource'}
                    </p>
                    <div
                      className="flex items-center gap-1"
                      onMouseLeave={() => setHoverStars(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverStars || userRating?.stars || 0) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            disabled={ratingSubmitting || !user}
                            onClick={() => handleRate(star)}
                            onMouseEnter={() => setHoverStars(star)}
                            className="p-0.5 disabled:cursor-not-allowed transition-transform hover:scale-110"
                            title={user ? `Rate ${star} star${star > 1 ? 's' : ''}` : 'Log in to rate'}
                            aria-label={`Rate ${star} stars`}
                          >
                            <HiOutlineStar
                              className="w-6 h-6"
                              style={{
                                color: active ? '#e8a020' : '#c5d8ed',
                                fill: active ? '#e8a020' : 'transparent',
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {!user && (
                      <p className="text-[11px] text-[#6c7a8e] mt-1">
                        <Link to="/login" className="text-[#1a3a6e] font-semibold hover:underline">
                          Log in
                        </Link>
                        {' '}to submit a rating
                      </p>
                    )}
                  </div>
                  {user && userRating && (
                    <button
                      type="button"
                      onClick={handleClearRating}
                      disabled={ratingSubmitting}
                      className="text-xs font-semibold text-[#dc3545] hover:underline disabled:opacity-50"
                    >
                      Clear rating
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resource.department && <DetailRow icon={HiOutlineAcademicCap} label="Department" value={`${resource.department.name} (${resource.department.code})`} />}
              {resource.semester && <DetailRow icon={HiOutlineDocumentText} label="Semester" value={`Semester ${resource.semester}`} />}
              {resource.subject && <DetailRow icon={HiOutlineDocumentText} label="Subject" value={`${resource.subject.name} (${resource.subject.code})`} />}
              {resource.courseCode && <DetailRow icon={HiOutlineDocumentText} label="Course Code" value={resource.courseCode} />}
              {resource.author && <DetailRow icon={HiOutlineUser} label="Author" value={resource.author} />}
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={handleDownload} className="btn-nitj-primary flex-1 py-2 flex justify-center items-center gap-2">
                <HiOutlineDownload className="w-5 h-5" /> Download Native File
              </button>
              {canEdit && (
                <>
                  <button onClick={() => document.getElementById('version-upload').click()} className="btn-nitj-submit flex-1 py-2 flex justify-center items-center gap-2">
                    <HiOutlineUpload className="w-5 h-5" /> Record New Version
                  </button>
                  <input type="file" id="version-upload" className="hidden" onChange={handleVersionUpload} />
                  <Link to={`/resources/${id}/edit`} className="btn-nitj-secondary flex justify-center items-center gap-2 px-6">
                    <HiOutlinePencil className="w-4 h-4" /> Edit
                  </Link>
                  <button onClick={handleDelete} className="text-[#dc3545] border border-[#dc3545] hover:bg-[#ffebeb] px-4 rounded-md">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Resource Preview — PDFs/images via signed URL; others download-only */}
      <section className="panel mb-6">
        <div className="content-card-header flex items-center justify-between">
          <span className="flex items-center">
            <HiOutlineEye className="w-5 h-5 mr-2" /> Content Preview
          </span>
          {(resource.mimeType || resource.fileType) && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              {resource.mimeType || `.${resource.fileType}`}
            </span>
          )}
        </div>
        <div className="content-card-body p-0 overflow-hidden">
          <ResourcePreview
            resourceId={resource._id}
            mimeType={resource.mimeType}
            fileType={resource.fileType}
            previewable={resource.previewable}
            previewKind={resource.previewKind}
            fileIcon={FILE_ICONS[resource.fileType] || '📄'}
            onDownload={handleDownload}
          />
        </div>
      </section>

      {/* Version History Table */}
      {resource.versions && resource.versions.length > 0 && (
        <section className="panel mb-6">
          <div className="content-card-header">
            <HiOutlineClock className="w-5 h-5 mr-2" /> Version Archives
          </div>
          <div className="content-card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#f8fbff] text-[#1a3a6e] font-bold border-b border-[#c5d8ed]">
                  <tr>
                    <th className="px-6 py-3">Version</th>
                    <th className="px-6 py-3">Filename Bound</th>
                    <th className="px-6 py-3">Archived On</th>
                    <th className="px-6 py-3 text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e8eef5]">
                  {resource.versions.map(v => (
                    <tr key={v._id} className="hover:bg-[#f8fbff]">
                      <td className="px-6 py-3 font-bold">v{v.version}</td>
                      <td className="px-6 py-3 text-[#6c7a8e]">{v.originalFilename}</td>
                      <td className="px-6 py-3 text-[#6c7a8e]">
                        {new Date(v.uploadedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => downloadOldVersion(v)} className="text-[#1a3a6e] hover:underline font-bold text-xs uppercase">
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

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

function StatBox({ icon: Icon, label, value }) {
  return (
    <div className="bg-[#f8fbff] border border-[#c5d8ed] rounded px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-[#1a3a6e]" />
        <span className="text-xs font-bold text-[#6c7a8e] uppercase">{label}</span>
      </div>
      <p className="text-lg font-bold text-[#1a1a2e]">{value}</p>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-l-2 border-[#1a3a6e] bg-[#f8fbff]">
      <Icon className="w-4 h-4 text-[#1a3a6e]" />
      <div>
        <p className="text-[10px] font-bold text-[#6c7a8e] uppercase">{label}</p>
        <p className="text-sm font-semibold text-[#1a1a2e]">{value}</p>
      </div>
    </div>
  );
}
