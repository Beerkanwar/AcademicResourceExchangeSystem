/**
 * Footer for infinite lists: sentinel trigger, loading-more skeletons, end-of-list note.
 */
export default function InfiniteScrollFooter({
  sentinelRef,
  hasMore,
  loadingMore,
  loadingMoreContent = null,
  loadedCount = 0,
  total = 0,
  endLabel = 'You have reached the end',
}) {
  return (
    <div className="pt-10 space-y-6">
      {loadingMore && (
        <div className="animate-fade-in">
          {loadingMoreContent}
        </div>
      )}

      {hasMore && !loadingMore && (
        <div ref={sentinelRef} className="h-8 w-full" aria-hidden="true" />
      )}

      {!hasMore && loadedCount > 0 && (
        <p className="text-center text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 py-4">
          {endLabel}
          {total > 0 ? ` · ${loadedCount} of ${total}` : ''}
        </p>
      )}
    </div>
  );
}
