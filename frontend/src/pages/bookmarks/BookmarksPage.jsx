import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { ResourceCardSkeletonGrid } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import InfiniteScrollFooter from '../../components/shared/InfiniteScrollFooter';
import {
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

export default function BookmarksPage() {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: PAGE_SIZE });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const requestIdRef = useRef(0);

  const fetchBookmarks = useCallback(async (page = 1, { append = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else setInitialLoading(true);

    try {
      const res = await api.get('/bookmarks', { params: { page, limit: PAGE_SIZE } });
      if (requestId !== requestIdRef.current) return;

      const next = res.data.data || [];
      const nextPagination = res.data.pagination || {
        total: 0,
        page: 1,
        pages: 1,
        limit: PAGE_SIZE,
      };

      setResources((prev) => {
        if (!append) return next;
        const seen = new Set(prev.map((r) => r._id));
        return [...prev, ...next.filter((r) => r && !seen.has(r._id))];
      });
      setPagination(nextPagination);
    } catch {
      if (requestId === requestIdRef.current) {
        toast.error('Failed to load bookmarks');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchBookmarks(1, { append: false });
  }, [fetchBookmarks]);

  const hasMore = pagination.page < pagination.pages;
  const loadMore = useCallback(() => {
    if (initialLoading || loadingMore || !hasMore) return;
    fetchBookmarks(pagination.page + 1, { append: true });
  }, [fetchBookmarks, hasMore, initialLoading, loadingMore, pagination.page]);

  const sentinelRef = useInfiniteScroll({
    enabled: !initialLoading && resources.length > 0,
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMore,
  });

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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">My Bookmarks</h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Saved intelligence ready for quick access and reference.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-5 py-2.5 bg-white rounded-lg border border-slate-200 shadow-sm text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d69e2e] shadow-[0_0_8px_rgba(214,158,46,0.4)]" />
            {initialLoading && resources.length === 0 ? '…' : pagination.total} Saved
          </div>
        </div>
      </div>

      <section className="min-h-[500px]">
        {initialLoading && resources.length === 0 ? (
          <ResourceCardSkeletonGrid count={4} />
        ) : resources.length === 0 ? (
          <EmptyState
            icon="🔖"
            title="Bookmarks Empty"
            description="You haven't bookmarked any resources yet. Browse the repository to save useful materials for later context."
            action={
              <Link
                to="/resources"
                className="inline-block text-nitj-gold font-black text-[11px] uppercase tracking-[0.3em] hover:underline"
              >
                [ Open Repository ]
              </Link>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {resources.map((resource, i) => (
                <Link
                  key={resource._id || i}
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
              endLabel="All bookmarks loaded"
            />
          </>
        )}
      </section>
    </div>
  );
}
