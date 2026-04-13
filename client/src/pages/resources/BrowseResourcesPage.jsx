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
      <div className="card p-3 md:p-4 overflow-hidden shadow-sm border-none bg-slate-100/50" style={{ borderRadius: '10px' }}>
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-[2.5]">
            <HiOutlineSearch className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Query by subject code, title, or keywords..."
              className="input-field h-14 pl-14 pr-6 bg-white border-none shadow-sm text-base font-medium"
            />
          </div>
          <div className="flex flex-1 gap-3">
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
              className="input-field h-14 !pl-5 flex-1 bg-white border-none shadow-sm text-sm font-bold text-slate-600 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1rem_center] bg-no-repeat"
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            <select
              value={filters.semester}
              onChange={(e) => setFilters({ ...filters, semester: e.target.value })}
              className="input-field h-14 !pl-5 flex-1 bg-white border-none shadow-sm text-sm font-bold text-slate-600 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1rem_center] bg-no-repeat"
            >
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters({ ...filters, sortBy, sortOrder });
              }}
              className="input-field h-14 !pl-5 min-w-[160px] bg-white border-none shadow-sm text-sm font-bold text-slate-600 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.5rem_1.5rem] bg-[right_1rem_center] bg-no-repeat"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="downloads-desc">High Usage</option>
              <option value="averageRating-desc">Top Rated</option>
            </select>
            <button type="submit" className="btn-primary !w-auto h-14 px-8 shadow-xl shadow-primary/20">
              <HiOutlineFilter className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>

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
                onClick={() => setFilters({ search: '', department: '', semester: '', sortBy: 'createdAt', sortOrder: 'desc' })}
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
                  className="card p-8 group animate-slide-up block border-none shadow-sm hover:shadow-2xl transition-all relative overflow-hidden bg-white"
                  style={{ animationDelay: `${i * 30}ms`, borderRadius: '10px' }}
                >
                  <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start gap-5 mb-6">
                      <div
                        className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-500 bg-slate-50 shadow-inner"
                      >
                        {FILE_ICONS[resource.fileType] || '📄'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-slate-800 truncate group-hover:text-nitj-gold transition-colors leading-tight tracking-tight uppercase">
                          {resource.title}
                        </h3>
                        <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em] truncate">
                           {resource.department?.code || 'GEN'} • SEM 0{resource.semester}
                        </p>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="px-3 py-1 rounded-md bg-slate-100 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                        {resource.fileType}
                      </span>
                      {resource.tags?.slice(0, 2).map((tag) => (
                        <span key={tag} className="px-3 py-1 rounded-md bg-nitj-gold/10 text-[9px] font-black text-nitj-gold uppercase tracking-widest border border-nitj-gold/10">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    {resource.description && (
                      <p className="text-sm text-slate-500 line-clamp-3 mb-8 leading-relaxed font-medium">
                        {resource.description}
                      </p>
                    )}

                    {/* Stats Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-5 text-[11px] font-black text-slate-400">
                        <span className="flex items-center gap-2"><HiOutlineDownload className="w-4 h-4" />{resource.downloads}</span>
                        <span className="flex items-center gap-2"><HiOutlineStar className="w-4 h-4 text-nitj-gold" />{resource.averageRating > 0 ? resource.averageRating.toFixed(1) : '—'}</span>
                      </div>
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        {timeAgo(resource.createdAt)}
                      </span>
                    </div>
                  </div>
                  {/* Hover effect decorative element */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-slate-50 rounded-full -mr-20 -mt-20 group-hover:bg-nitj-gold/5 transition-colors duration-500" />
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
