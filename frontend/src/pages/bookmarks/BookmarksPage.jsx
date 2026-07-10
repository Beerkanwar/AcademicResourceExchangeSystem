import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import {
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

export default function BookmarksPage() {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchBookmarks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/bookmarks', { params: { page, limit: 12 } });
      setResources(res.data.data || []);
      setPagination(res.data.pagination || { total: 0, page: 1, pages: 1 });
    } catch {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookmarks(); }, [fetchBookmarks]);

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
            {pagination.total} Saved
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <section className="min-h-[500px]">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
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
               <span className="text-5xl">🔖</span>
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Bookmarks Empty</h3>
            <p className="text-base text-slate-500 mt-3 max-w-md mx-auto leading-relaxed font-medium">
              You haven't bookmarked any resources yet. Browse the repository to save useful materials for later context.
            </p>
            <Link to="/resources" className="mt-10 inline-block text-nitj-gold font-black text-[11px] uppercase tracking-[0.3em] hover:underline">
              [ Open Repository ]
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {resources.map((resource, i) => (
              <Link
                key={resource._id || i}
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
            ))}
          </div>
        )}
      </section>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-12">
          <button
            disabled={pagination.page <= 1}
            onClick={() => fetchBookmarks(pagination.page - 1)}
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
                      onClick={() => fetchBookmarks(pageNum)}
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
            onClick={() => fetchBookmarks(pagination.page + 1)}
            className="w-12 h-12 rounded-lg flex items-center justify-center bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:border-nitj-gold hover:text-nitj-gold transition-all shadow-sm"
          >
            <HiOutlineChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
