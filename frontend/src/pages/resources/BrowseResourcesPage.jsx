import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || '',
    semester: searchParams.get('semester') || '',
    subject: searchParams.get('subject') || '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Listen to external URL query updates (e.g. from global search bar)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== filters.search) {
      setFilters(prev => ({...prev, search: q}));
    }
  }, [searchParams]);

  const fetchResources = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.department) params.department = filters.department;
      if (filters.semester) params.semester = filters.semester;
      if (filters.subject) params.subject = filters.subject;
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

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const params = {};
        if (filters.department) params.department = filters.department;
        if (filters.semester) params.semester = filters.semester;
        if (!params.department && !params.semester) { setSubjects([]); return; }
        const res = await api.get('/subjects', { params });
        setSubjects(res.data.data || []);
      } catch { setSubjects([]); }
    };
    fetchSubjects();
  }, [filters.department, filters.semester]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const handleSearch = (e) => { e.preventDefault(); fetchResources(1); };
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
    <div className="w-full space-y-10 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Resource Repository</h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Explore verified academic intelligence across all NITJ departments.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-white rounded-lg border border-slate-200 shadow-sm text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_8px_rgba(56,161,105,0.4)]" />
            {pagination.total} Records Online
          </div>
          <Link to="/upload" className="btn-accent flex items-center gap-3 px-8 h-12 text-sm shadow-xl shadow-accent/20">
            + DEPLOY NEW
          </Link>
        </div>
      </div>

      {/* Modern Filter Bar */}
      <section className="panel mb-6">
        <div className="content-card-body p-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-[2]">
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Query by subject code, title, or keywords..."
                className="form-control nitj-input w-full"
              />
            </div>
            <div className="flex flex-1 gap-2">
              <select
                value={filters.department}
                onChange={(e) => setFilters({ ...filters, department: e.target.value, subject: '' })}
                className="form-select nitj-select flex-1"
              >
                <option value="">All Departments</option>
                {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value, subject: '' })}
                className="form-select nitj-select flex-1"
              >
                <option value="">All Semesters</option>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                disabled={!filters.department && !filters.semester}
                className="form-select nitj-select flex-[1.5]"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters({ ...filters, sortBy, sortOrder });
                }}
                className="form-select nitj-select min-w-[160px]"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="downloads-desc">High Usage</option>
                <option value="averageRating-desc">Top Rated</option>
              </select>
              <button type="submit" className="btn-nitj-submit px-4">
                <HiOutlineFilter className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Content Grid */}
      <section className="min-h-[500px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card p-8 animate-pulse border-none shadow-sm bg-white" style={{ borderRadius: '10px' }}>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-xl bg-slate-100" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 rounded bg-slate-100 w-3/4" />
                    <div className="h-4 rounded bg-slate-100 w-1/2" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 rounded bg-slate-100 w-full" />
                  <div className="h-4 rounded bg-slate-100 w-full" />
                  <div className="h-4 rounded bg-slate-100 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : resources.length === 0 ? (
          <div className="card p-24 text-center border-none shadow-sm bg-white" style={{ borderRadius: '10px' }}>
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
               <span className="text-5xl">🔎</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">No intelligence found</h3>
            <p className="text-base text-slate-500 mt-3 max-w-md mx-auto leading-relaxed font-medium">
              {filters.search 
                ? "The specified query yielded zero results within the current filtration parameters." 
                : "The central repository is currently void of records in this classification."}
            </p>
            {filters.search && (
               <button 
                onClick={() => setFilters({ search: '', department: '', semester: '', subject: '', sortBy: 'createdAt', sortOrder: 'desc' })}
                className="mt-10 text-nitj-gold font-black text-[11px] uppercase tracking-[0.3em] hover:underline"
               >
                 [ Reset System Filters ]
               </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {resources.map((resource, i) => {
              return (
                <Link
                  key={resource._id}
                  to={`/resources/${resource._id}`}
                  className="bg-white border border-[#c5d8ed] rounded-md p-5 block hover:border-[#1a3a6e] hover:shadow-md transition-all relative"
                >
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-3xl flex-shrink-0">
                        {FILE_ICONS[resource.fileType] || '📄'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-bold text-[#1a3a6e] truncate">
                          {resource.title}
                        </h3>
                        <p className="text-[10px] text-[#6c7a8e] mt-1 uppercase">
                           {resource.department?.code || 'GEN'} • SEM 0{resource.semester}
                        </p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="px-2 py-0.5 rounded bg-[#e8eef5] text-[9px] font-bold text-[#1a3a6e] uppercase">
                        {resource.fileType}
                      </span>
                      {resource.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-2 py-0.5 rounded bg-[#fffaf0] text-[9px] font-bold text-[#e8a020] border border-[#f3e5c9] uppercase">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#e8eef5]">
                      <div className="flex items-center gap-4 text-xs text-[#6c7a8e] font-bold">
                        <span className="flex items-center gap-1"><HiOutlineDownload className="w-3.5 h-3.5" />{resource.downloads}</span>
                        <span className="flex items-center gap-1"><HiOutlineStar className="w-3.5 h-3.5 text-[#e8a020]" />{resource.averageRating > 0 ? resource.averageRating.toFixed(1) : '—'}</span>
                      </div>
                      <span className="text-[10px] text-[#9ca3af]">
                        {timeAgo(resource.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Enhanced Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-12">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchResources(pagination.page - 1)}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:border-nitj-gold hover:text-nitj-gold transition-all shadow-sm"
          >
            <HiOutlineChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            {[...Array(pagination.pages)].map((_, i) => {
               const pageNum = i + 1;
               if (pageNum === 1 || pageNum === pagination.pages || Math.abs(pageNum - pagination.page) <= 1) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => fetchResources(pageNum)}
                      className={`w-12 h-12 rounded-lg text-sm font-black transition-all uppercase tracking-widest ${
                        pagination.page === pageNum 
                          ? 'bg-nitj-gold text-white shadow-xl shadow-nitj-gold/30 scale-110' 
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-nitj-gold'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
               }
               if (pageNum === 2 || pageNum === pagination.pages - 1) {
                 return <span key={pageNum} className="text-slate-300 font-black">...</span>;
               }
               return null;
            })}
          </div>

          <button
            disabled={pagination.page >= pagination.pages}
            onClick={() => fetchResources(pagination.page + 1)}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:border-nitj-gold hover:text-nitj-gold transition-all shadow-sm"
          >
            <HiOutlineChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
