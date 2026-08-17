import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import {
  ResourceCardSkeletonGrid,
} from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import InfiniteScrollFooter from '../../components/shared/InfiniteScrollFooter';
import {
  HiOutlineFilter,
  HiOutlineDownload,
  HiOutlineStar,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const FILE_ICONS = {
  pdf: '📄', ppt: '📊', pptx: '📊', doc: '📝', docx: '📝',
  txt: '📃', zip: '📦', rar: '📦', xls: '📈', xlsx: '📈', csv: '📈',
  png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
};

const PAGE_SIZE = 12;

export default function BrowseResourcesPage() {
  const [searchParams] = useSearchParams();
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: PAGE_SIZE });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const requestIdRef = useRef(0);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || '',
    semester: searchParams.get('semester') || '',
    subject: searchParams.get('subject') || '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== filters.search) {
      setSearchInput(q);
      setFilters((prev) => ({ ...prev, search: q }));
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchResources = useCallback(async (page = 1, { append = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else setInitialLoading(true);

    try {
      const params = { page, limit: PAGE_SIZE };
      if (filters.search) params.search = filters.search;
      if (filters.department) params.department = filters.department;
      if (filters.semester) params.semester = filters.semester;
      if (filters.subject) params.subject = filters.subject;
      params.sortBy = filters.sortBy;
      params.sortOrder = filters.sortOrder;

      const res = await api.get('/resources', { params });
      if (requestId !== requestIdRef.current) return;

      const next = res.data.data.resources || [];
      const nextPagination = res.data.data.pagination || {
        total: 0,
        page: 1,
        pages: 1,
        limit: PAGE_SIZE,
      };

      setResources((prev) => {
        if (!append) return next;
        const seen = new Set(prev.map((r) => r._id));
        return [...prev, ...next.filter((r) => !seen.has(r._id))];
      });
      setPagination(nextPagination);
    } catch {
      if (requestId === requestIdRef.current) {
        toast.error('Failed to load resources');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    }
  }, [filters]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const r = await api.get('/departments');
        setDepartments(r.data.data || []);
      } catch { /* ignore */ }
    };
    fetchDepts();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const params = {};
        if (filters.department) params.department = filters.department;
        if (filters.semester) params.semester = filters.semester;
        if (!params.department && !params.semester) {
          setSubjects([]);
          return;
        }
        const res = await api.get('/subjects', { params });
        setSubjects(res.data.data || []);
      } catch {
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [filters.department, filters.semester]);

  useEffect(() => {
    setResources([]);
    setInitialLoading(true);
    fetchResources(1, { append: false });
  }, [fetchResources]);

  const hasMore = pagination.page < pagination.pages;
  const loadMore = useCallback(() => {
    if (initialLoading || loadingMore || !hasMore) return;
    fetchResources(pagination.page + 1, { append: true });
  }, [fetchResources, hasMore, initialLoading, loadingMore, pagination.page]);

  const sentinelRef = useInfiniteScroll({
    enabled: !initialLoading && resources.length > 0,
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMore,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  };

  const resetFilters = () => {
    setSearchInput('');
    setFilters({
      search: '',
      department: '',
      semester: '',
      subject: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

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
            {initialLoading && resources.length === 0 ? '…' : pagination.total} Records Online
          </div>
          <Link to="/upload" className="btn-accent flex items-center gap-3 px-8 h-12 text-sm shadow-xl shadow-accent/20">
            + DEPLOY NEW
          </Link>
        </div>
      </div>

      <section className="panel mb-6">
        <div className="content-card-body p-4">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
            <div className="flex-[2]">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
              <select
                value={filters.semester}
                onChange={(e) => setFilters({ ...filters, semester: e.target.value, subject: '' })}
                className="form-select nitj-select flex-1"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>Semester {s}</option>
                ))}
              </select>
              <select
                value={filters.subject}
                onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
                disabled={!filters.department && !filters.semester}
                className="form-select nitj-select flex-[1.5]"
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
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
              <button type="submit" className="btn-nitj-submit px-4" disabled={initialLoading}>
                <HiOutlineFilter className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="min-h-[500px]">
        {initialLoading && resources.length === 0 ? (
          <ResourceCardSkeletonGrid count={8} />
        ) : resources.length === 0 ? (
          <EmptyState
            icon="🔎"
            title="No intelligence found"
            description={
              filters.search
                ? 'The specified query yielded zero results within the current filtration parameters.'
                : 'The central repository is currently void of records in this classification.'
            }
            action={
              filters.search || filters.department || filters.semester || filters.subject ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-nitj-gold font-black text-[11px] uppercase tracking-[0.3em] hover:underline"
                >
                  [ Reset System Filters ]
                </button>
              ) : null
            }
          />
        ) : (
          <>
            {/* Soft overlay when filters refetch from scratch with existing cards cleared */}
            {initialLoading && (
              <div className="mb-6 text-center text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                Refreshing results…
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {resources.map((resource) => (
                <Link
                  key={resource._id}
                  to={`/resources/${resource._id}`}
                  className="bg-white border border-[#c5d8ed] rounded-md p-5 block hover:border-[#1a3a6e] hover:shadow-md transition-all relative"
                >
                  <div className="relative z-10">
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

                    <div className="flex flex-wrap gap-1 mb-4">
                      <span className="px-2 py-0.5 rounded bg-[#e8eef5] text-[9px] font-bold text-[#1a3a6e] uppercase">
                        {resource.fileType}
                      </span>
                      {resource.tags?.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-[#fffaf0] text-[9px] font-bold text-[#e8a020] border border-[#f3e5c9] uppercase"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-[#e8eef5]">
                      <div className="flex items-center gap-4 text-xs text-[#6c7a8e] font-bold">
                        <span className="flex items-center gap-1">
                          <HiOutlineDownload className="w-3.5 h-3.5" />
                          {resource.downloads}
                        </span>
                        <span className="flex items-center gap-1">
                          <HiOutlineStar className="w-3.5 h-3.5 text-[#e8a020]" />
                          {resource.averageRating > 0 ? resource.averageRating.toFixed(1) : '—'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#9ca3af]">
                        {timeAgo(resource.createdAt)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <InfiniteScrollFooter
              sentinelRef={sentinelRef}
              hasMore={hasMore}
              loadingMore={loadingMore}
              loadedCount={resources.length}
              total={pagination.total}
              loadingMoreContent={<ResourceCardSkeletonGrid count={4} />}
              endLabel="End of repository"
            />
          </>
        )}
      </section>
    </div>
  );
}
