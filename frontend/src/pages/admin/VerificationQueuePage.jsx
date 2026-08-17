import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { QueueRowSkeletonList } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import InfiniteScrollFooter from '../../components/shared/InfiniteScrollFooter';
import {
  HiOutlineShieldCheck,
  HiOutlineCheck,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineEye,
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export default function VerificationQueuePage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: PAGE_SIZE });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [rejectMode, setRejectMode] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const requestIdRef = useRef(0);

  const fetchPending = useCallback(async (page = 1, { append = false } = {}) => {
    const requestId = ++requestIdRef.current;
    if (append) setLoadingMore(true);
    else setInitialLoading(true);

    try {
      const res = await api.get('/verification/pending', {
        params: { page, limit: PAGE_SIZE },
      });
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

      if (!append) {
        setSelectedIds(new Set());
      }
    } catch {
      if (requestId === requestIdRef.current) {
        toast.error('Failed to load pending resources');
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setInitialLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPending(1, { append: false });
  }, [fetchPending]);

  const hasMore = pagination.page < pagination.pages;
  const loadMore = useCallback(() => {
    if (initialLoading || loadingMore || !hasMore) return;
    fetchPending(pagination.page + 1, { append: true });
  }, [fetchPending, hasMore, initialLoading, loadingMore, pagination.page]);

  const sentinelRef = useInfiniteScroll({
    enabled: !initialLoading && resources.length > 0,
    hasMore,
    loading: loadingMore,
    onLoadMore: loadMore,
  });

  const allSelected = useMemo(
    () => resources.length > 0 && selectedIds.size === resources.length,
    [resources, selectedIds]
  );

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(resources.map((r) => r._id)));
  };

  const removeFromQueue = (ids) => {
    const idSet = new Set(ids.map(String));
    setResources((prev) => prev.filter((r) => !idSet.has(String(r._id))));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      idSet.forEach((id) => next.delete(id));
      return next;
    });
    setPagination((prev) => ({
      ...prev,
      total: Math.max(0, (prev.total || 0) - idSet.size),
    }));
  };

  const handleApprove = async (id) => {
    try {
      await api.post(`/verification/${id}/approve`);
      toast.success('Resource approved successfully');
      removeFromQueue([id]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve resource');
    }
  };

  const runBulkAction = async (action, reason = '') => {
    const resourceIds = [...selectedIds];
    if (resourceIds.length === 0) {
      toast.error('Select at least one resource');
      return;
    }

    setBulkSubmitting(true);
    try {
      const res = await api.post('/admin/resources/bulk-action', {
        resourceIds,
        action,
        ...(action === 'reject' ? { reason } : {}),
      });

      const { succeeded = [], failed = [], succeededCount = 0, failedCount = 0 } =
        res.data.data || {};

      if (succeeded.length > 0) {
        removeFromQueue(succeeded);
      }

      if (failedCount === 0) {
        toast.success(
          action === 'approve'
            ? `Approved ${succeededCount} resource(s)`
            : `Rejected ${succeededCount} resource(s)`
        );
      } else {
        toast.error(
          `${succeededCount} succeeded, ${failedCount} failed. ${
            failed[0]?.reason ? `First error: ${failed[0].reason}` : ''
          }`
        );
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Bulk ${action} failed`);
    } finally {
      setBulkSubmitting(false);
    }
  };

  const handleBulkApprove = () => runBulkAction('approve');

  const openBulkReject = () => {
    if (selectedIds.size === 0) {
      toast.error('Select at least one resource');
      return;
    }
    setRejectMode('bulk');
    setRejectReason('');
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    if (rejectMode === 'bulk') {
      await runBulkAction('reject', rejectReason.trim());
      setRejectMode(null);
      setRejectReason('');
      return;
    }

    try {
      await api.post(`/verification/${rejectMode}/reject`, { reason: rejectReason });
      toast.success('Resource rejected');
      removeFromQueue([rejectMode]);
      setRejectMode(null);
      setRejectReason('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject resource');
    }
  };

  const closeRejectModal = () => {
    setRejectMode(null);
    setRejectReason('');
  };

  const pendingTotal = pagination.total || resources.length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fade-in pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Verification Queue</h1>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Review and approve student-uploaded academic resources.
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 bg-white px-5 py-2.5 rounded-lg border border-slate-200 shadow-sm">
          <HiOutlineShieldCheck className="w-4 h-4 text-nitj-gold" />
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {initialLoading && resources.length === 0 ? '…' : pendingTotal}
          </span>{' '}
          Pending
        </div>
      </div>

      {!initialLoading && resources.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-4 shadow-sm">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-slate-300 text-nitj-navy focus:ring-nitj-gold"
            />
            <span className="text-xs font-black uppercase tracking-[0.15em] text-slate-600">
              {selectedIds.size > 0
                ? `${selectedIds.size} selected`
                : 'Select all loaded'}
            </span>
          </label>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={selectedIds.size === 0 || bulkSubmitting}
              onClick={handleBulkApprove}
              className="h-10 px-4 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HiOutlineCheck className="w-4 h-4" />
              Approve Selected
            </button>
            <button
              type="button"
              disabled={selectedIds.size === 0 || bulkSubmitting}
              onClick={openBulkReject}
              className="h-10 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <HiOutlineX className="w-4 h-4" />
              Reject Selected
            </button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {initialLoading && resources.length === 0 ? (
          <QueueRowSkeletonList count={4} />
        ) : resources.length === 0 ? (
          <EmptyState
            icon={<HiOutlineShieldCheck className="w-10 h-10 text-nitj-gold/40" />}
            title="Queue Clear"
            description="All student uploads have been reviewed."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {resources.map((resource) => {
                const isSelected = selectedIds.has(resource._id);
                return (
                  <div
                    key={resource._id}
                    className={`card p-6 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow ${
                      isSelected ? 'ring-2 ring-nitj-gold/40 border-nitj-gold/30' : ''
                    }`}
                  >
                    <label className="shrink-0 cursor-pointer self-start md:self-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(resource._id)}
                        className="w-4 h-4 rounded border-slate-300 text-nitj-navy focus:ring-nitj-gold"
                        aria-label={`Select ${resource.title}`}
                      />
                    </label>

                    <div className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 shadow-inner">
                      <HiOutlineDocumentText className="w-8 h-8 text-slate-400" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black text-slate-800 truncate">{resource.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                        <span>{resource.department?.code || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{resource.subject?.code || 'N/A'}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>
                          By: {resource.uploadedBy?.firstName} {resource.uploadedBy?.lastName} ({resource.uploadedBy?.role})
                        </span>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-slate-500 mt-3 line-clamp-2 pr-4">{resource.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                      <button
                        onClick={() => navigate(`/resources/${resource._id}`)}
                        className="flex-1 md:flex-none h-11 px-4 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
                      >
                        <HiOutlineEye className="w-4 h-4" /> View
                      </button>
                      <button
                        onClick={() => handleApprove(resource._id)}
                        className="flex-1 md:flex-none h-11 px-4 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
                      >
                        <HiOutlineCheck className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectMode(resource._id);
                          setRejectReason('');
                        }}
                        className="flex-1 md:flex-none h-11 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-black text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-colors"
                      >
                        <HiOutlineX className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <InfiniteScrollFooter
              sentinelRef={sentinelRef}
              hasMore={hasMore}
              loadingMore={loadingMore}
              loadedCount={resources.length}
              total={pagination.total}
              loadingMoreContent={<QueueRowSkeletonList count={2} />}
              endLabel="End of verification queue"
            />
          </>
        )}
      </div>

      {rejectMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeRejectModal} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-fade-in">
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-2">
              {rejectMode === 'bulk'
                ? `Reject ${selectedIds.size} Resource${selectedIds.size === 1 ? '' : 's'}`
                : 'Reject Resource'}
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-6">
              {rejectMode === 'bulk'
                ? 'Provide one shared reason applied to all selected documents. Uploaders will see this reason.'
                : 'Please provide a reason for rejecting this document. This will be visible to the uploader.'}
            </p>
            <form onSubmit={handleRejectSubmit}>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Incomplete notes, irrelevant material..."
                className="w-full h-32 p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-nitj-gold focus:ring-4 focus:ring-nitj-gold/20 outline-none transition-all resize-none text-sm font-medium"
                autoFocus
              />
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={closeRejectModal}
                  className="flex-1 h-12 rounded-xl text-xs font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkSubmitting}
                  className="flex-1 h-12 rounded-xl bg-danger text-black text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-danger/20 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
