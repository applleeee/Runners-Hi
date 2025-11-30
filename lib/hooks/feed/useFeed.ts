"use client";

import {
  ContentType,
  FeedContent,
  Location,
  getContentTypesByParentId,
  getContents,
  getMainLocations,
} from "@/lib/api/content";
import { useCallback, useEffect, useRef, useState } from "react";

// 거리 필터 옵션 (하드코딩)
export const DISTANCE_OPTIONS = [
  { label: "모든 거리", value: null, min: null, max: null },
  { label: "5km 이내", value: "0-5", min: 0, max: 5 },
  { label: "5km 이상", value: "5-10", min: 5, max: 10 },
  { label: "10km 이상", value: "10-20", min: 10, max: 20 },
  { label: "20km 이상", value: "20-30", min: 20, max: 30 },
  { label: "30km 이상", value: "30-40", min: 30, max: 40 },
  { label: "40km 이상", value: "40-50", min: 40, max: 50 },
  { label: "50km 이상", value: "50-100", min: 50, max: 100 },
  { label: "100km 이상", value: "100-", min: 100, max: null },
] as const;

export interface FeedFilter {
  locationId: number | null;
  typeIds: number[];
  distanceValue: string | null;
}

interface UseFeedReturn {
  // 데이터
  contents: FeedContent[];
  locations: Location[];
  types: ContentType[];

  // 필터 상태
  filter: FeedFilter;
  setLocationId: (id: number | null) => void;
  setTypeIds: (ids: number[]) => void;
  setDistanceValue: (value: string | null) => void;

  // 로딩 상태
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;

  // 액션
  loadMore: () => void;
  refresh: () => void;
}

const ITEMS_PER_PAGE = 10;

export function useFeed(): UseFeedReturn {
  // 필터 상태
  const [filter, setFilter] = useState<FeedFilter>({
    locationId: null,
    typeIds: [],
    distanceValue: null,
  });

  // 데이터 상태
  const [contents, setContents] = useState<FeedContent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [types, setTypes] = useState<ContentType[]>([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // 거리 필터에서 min/max 추출
  const getDistanceRange = useCallback((value: string | null) => {
    const option = DISTANCE_OPTIONS.find((opt) => opt.value === value);
    return {
      min: option?.min ?? null,
      max: option?.max ?? null,
    };
  }, []);

  // 초기 데이터 로드 (위치, 타입)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [locationsData, typesData] = await Promise.all([
          getMainLocations(),
          getContentTypesByParentId(1), // 러닝(1)의 하위 타입
        ]);
        setLocations(locationsData);
        setTypes(typesData);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }
    loadInitialData();
  }, []);

  // 콘텐츠 로드
  const loadContents = useCallback(
    async (isRefresh = false) => {
      const currentOffset = isRefresh ? 0 : offset;

      if (isRefresh) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      try {
        const { min, max } = getDistanceRange(filter.distanceValue);

        const data = await getContents({
          locationId: filter.locationId,
          typeIds: filter.typeIds.length > 0 ? filter.typeIds : undefined,
          distanceMin: min,
          distanceMax: max,
          limit: ITEMS_PER_PAGE,
          offset: currentOffset,
        });

        if (isRefresh) {
          setContents(data);
          setOffset(ITEMS_PER_PAGE);
        } else {
          setContents((prev) => [...prev, ...data]);
          setOffset((prev) => prev + ITEMS_PER_PAGE);
        }

        setHasMore(data.length === ITEMS_PER_PAGE);
      } catch (error) {
        console.error("Failed to load contents:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [filter, offset, getDistanceRange]
  );

  // loadContents의 최신 참조 유지 (의존성 배열 문제 해결)
  const loadContentsRef = useRef(loadContents);
  loadContentsRef.current = loadContents;

  // 필터 변경 시 새로고침
  useEffect(() => {
    loadContentsRef.current(true);
  }, [filter.locationId, filter.typeIds, filter.distanceValue]);

  // 필터 설정 함수들
  const setLocationId = useCallback((id: number | null) => {
    setFilter((prev) => ({ ...prev, locationId: id }));
  }, []);

  const setTypeIds = useCallback((ids: number[]) => {
    setFilter((prev) => ({ ...prev, typeIds: ids }));
  }, []);

  const setDistanceValue = useCallback((value: string | null) => {
    setFilter((prev) => ({ ...prev, distanceValue: value }));
  }, []);

  // 더 불러오기
  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      loadContents(false);
    }
  }, [isLoading, isLoadingMore, hasMore, loadContents]);

  // 새로고침
  const refresh = useCallback(() => {
    loadContents(true);
  }, [loadContents]);

  return {
    contents,
    locations,
    types,
    filter,
    setLocationId,
    setTypeIds,
    setDistanceValue,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh,
  };
}
