"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
  rootMargin?: string;
  threshold?: number;
}

/**
 * 무한 스크롤을 위한 IntersectionObserver 훅
 * @param options.hasMore - 더 불러올 데이터가 있는지 여부
 * @param options.isLoadingMore - 현재 로딩 중인지 여부
 * @param options.loadMore - 더 불러오기 함수
 * @param options.rootMargin - IntersectionObserver rootMargin (기본값: "100px")
 * @param options.threshold - IntersectionObserver threshold (기본값: 0)
 * @returns ref를 설정하는 콜백 함수 (트리거 요소에 연결)
 */
export function useInfiniteScroll({
  hasMore,
  isLoadingMore,
  loadMore,
  rootMargin = "100px",
  threshold = 0,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        loadMore();
      }
    },
    [hasMore, isLoadingMore, loadMore]
  );

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin,
      threshold,
    });

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver, rootMargin, threshold]);

  // ref 콜백 함수 - 요소가 마운트/언마운트될 때 호출됨
  const setTargetRef = useCallback((node: HTMLDivElement | null) => {
    if (targetRef.current && observerRef.current) {
      observerRef.current.unobserve(targetRef.current);
    }

    targetRef.current = node;

    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  return setTargetRef;
}
