import { useEffect, useRef } from 'react';

/**
 * Observes a sentinel element and calls onLoadMore when it enters the viewport.
 */
export default function useInfiniteScroll({
  enabled = true,
  hasMore = false,
  loading = false,
  onLoadMore,
  rootMargin = '280px',
}) {
  const sentinelRef = useRef(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !enabled || !hasMore || loading) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMoreRef.current?.();
        }
      },
      { root: null, rootMargin, threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, hasMore, loading, rootMargin]);

  return sentinelRef;
}
