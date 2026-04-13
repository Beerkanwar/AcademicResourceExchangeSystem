import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
  HiOutlineSearch,
  HiOutlineFilter,
  HiOutlineEye,
  HiOutlineDownload,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  pdf: '📄', ppt: '📊', pptx: '📊', doc: '📝', docx: '📝',
  txt: '📃', zip: '📦', rar: '📦', xls: '📈', xlsx: '📈', csv: '📈',
  png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
};

const STATUS_BADGE = {
  approved: { bg: '#38a16912', color: '#38a169', label: 'Approved' },
  pending: { bg: '#dd6b2012', color: '#dd6b20', label: 'Pending' },
  rejected: { bg: '#e53e3e12', color: '#e53e3e', label: 'Rejected' },
};

export default function BrowseResourcesPage() {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    semester: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchResources = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.department) params.department = filters.department;
      if (filters.semester) params.semester = filters.semester;
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder;

      const res = await api.get('/resources', { params });
      setResources(res.data.data.resources || []);
      setPagination(res.data.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const fetchDepts = async () => {
      try { const r = await api.get('/departments'); setDepartments(r.data.data || []); } catch {}
    };
    fetchDepts();
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleSearch = (e) => { e.preventDefault(); fetchResources(1); };
  const formatSize = (bytes) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(0)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#1a202c' }}>Browse Resources</h1>
          <p className="text-[13px]" style={{ color: '#a0aec0' }}>
            {pagination.total} resource{pagination.total !== 1 ? 's' : ''} available
          </p>
        </div>
        <Link to="/upload" className="btn-accent flex items-center gap-2 w-fit text-[13px]">
          + Upload Resource
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#a0aec0' }} />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search by title, tags, content..."
              className="input-field"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="input-field !pl-3 !w-auto min-w-[130px]"
            >
              <option value="">All Depts</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.code}</option>)}
            </select>
            <select
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              className="input-field !pl-3 !w-auto min-w-[120px]"
            >
              <option value="">All Sems</option>
              {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
            </select>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters({ ...filters, sortBy, sortOrder });
              }}
              className="input-field !pl-3 !w-auto min-w-[130px]"
            >
              <option value="createdAt-desc">Newest</option>
              <option value="createdAt-asc">Oldest</option>
              <option value="downloads-desc">Most Downloaded</option>
              <option value="averageRating-desc">Top Rated</option>
              <option value="views-desc">Most Viewed</option>
            </select>
            <button type="submit" className="btn-primary !w-auto !px-5">
              <HiOutlineFilter className="w-4 h-4" /> Filter
            </button>
          </div>
        </form>
      </div>

      {/* Resource Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl" style={{ background: '#edf2f7' }} />
                <div className="flex-1"><div className="h-4 rounded w-3/4" style={{ background: '#edf2f7' }} /></div>
              </div>
              <div className="h-3 rounded w-full mb-2" style={{ background: '#edf2f7' }} />
              <div className="h-3 rounded w-2/3" style={{ background: '#edf2f7' }} />
            </div>
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📚</p>
          <h3 className="text-lg font-bold" style={{ color: '#2d3748' }}>No resources found</h3>
          <p className="text-[13px] mt-1" style={{ color: '#a0aec0' }}>
            {filters.search ? 'Try adjusting your search or filters' : 'Be the first to upload a resource!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource, i) => {
            const badge = STATUS_BADGE[resource.status] || STATUS_BADGE.pending;
            return (
              <Link
                key={resource._id}
                to={`/resources/${resource._id}`}
                className="card p-5 group animate-slide-up block"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* File icon + title */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ background: '#1a365d08' }}
                  >
                    {FILE_ICONS[resource.fileType] || '📄'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-semibold truncate group-hover:text-[#d69e2e] transition-colors" style={{ color: '#2d3748' }}>
                      {resource.title}
                    </h3>
                    <p className="text-[11px] truncate" style={{ color: '#a0aec0' }}>
                      {resource.uploadedBy?.firstName || resource.uploadedBy?.email?.split('@')[0] || 'Unknown'}
                      {resource.department ? ` • ${resource.department.code}` : ''}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {resource.description && (
                  <p className="text-[12px] mb-3 line-clamp-2" style={{ color: '#718096' }}>
                    {resource.description}
                  </p>
                )}

                {/* Tags */}
                {resource.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: '#1a365d08', color: '#4a5568' }}>
                        #{tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ color: '#a0aec0' }}>
                        +{resource.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f7fafc' }}>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: '#a0aec0' }}>
                    <span className="flex items-center gap-1"><HiOutlineEye className="w-3.5 h-3.5" />{resource.views}</span>
                    <span className="flex items-center gap-1"><HiOutlineDownload className="w-3.5 h-3.5" />{resource.downloads}</span>
                    {resource.averageRating > 0 && (
                      <span className="flex items-center gap-1"><HiOutlineStar className="w-3.5 h-3.5" />{resource.averageRating.toFixed(1)}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-[11px]" style={{ color: '#a0aec0' }}>
                    <HiOutlineClock className="w-3 h-3" />{timeAgo(resource.createdAt)}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchResources(pagination.page - 1)}
            className="p-2 rounded-lg disabled:opacity-30 transition-colors"
            style={{ border: '1px solid #e2e8f0' }}
          >
            <HiOutlineChevronLeft className="w-4 h-4" style={{ color: '#4a5568' }} />
          </button>
          <span className="text-[13px] font-medium" style={{ color: '#4a5568' }}>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchResources(pagination.page + 1)}
            className="p-2 rounded-lg disabled:opacity-30 transition-colors"
            style={{ border: '1px solid #e2e8f0' }}
          >
            <HiOutlineChevronRight className="w-4 h-4" style={{ color: '#4a5568' }} />
          </button>
        </div>
      )}
    </div>
  );
}
