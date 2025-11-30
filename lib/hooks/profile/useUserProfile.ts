"use client";

import { useCallback, useEffect, useState } from "react";
import { getUserProfile, type UserProfile } from "@/lib/api/profile";
import {
  getUserStats,
  getUserContents,
  getContentTypesByParentId,
  getMainLocations,
  type UserStats,
  type FeedContent,
  type ContentType,
  type Location,
} from "@/lib/api/content";
import { DISTANCE_OPTIONS } from "@/lib/hooks/feed/useFeed";

interface UserProfileFilter {
  locationId: string | number | null;
  typeIds: number[];
  distanceValue: string | number | null;
}

interface UseUserProfileReturn {
  // 데이터
  user: UserProfile | null;
  stats: UserStats | null;
  contents: FeedContent[];
  locations: Location[];
  types: ContentType[];

  // 필터 상태
  filter: UserProfileFilter;
  setLocationId: (id: string | number | null) => void;
  setTypeIds: (ids: number[]) => void;
  setDistanceValue: (value: string | number | null) => void;

  // 로딩 상태
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;

  // 액션
  loadMore: () => void;
}

const ITEMS_PER_PAGE = 10;

export function useUserProfile(userId: string): UseUserProfileReturn {
  // 필터 상태
  const [filter, setFilter] = useState<UserProfileFilter>({
    locationId: null,
    typeIds: [],
    distanceValue: null,
  });

  // 데이터 상태
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [contents, setContents] = useState<FeedContent[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [types, setTypes] = useState<ContentType[]>([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // 거리 필터에서 min/max 추출
  const getDistanceRange = useCallback((value: string | number | null) => {
    const option = DISTANCE_OPTIONS.find((opt) => opt.value === value);
    return {
      min: option?.min ?? null,
      max: option?.max ?? null,
    };
  }, []);

  // 초기 데이터 로드 (사용자, 통계, 위치, 타입)
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [userData, statsData, locationsData, typesData] = await Promise.all([
          getUserProfile(userId),
          getUserStats(userId),
          getMainLocations(),
          getContentTypesByParentId(1), // 러닝(1)의 하위 타입
        ]);
        setUser(userData);
        setStats(statsData);
        setLocations(locationsData);
        setTypes(typesData);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    }
    loadInitialData();
  }, [userId]);

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

        // locationId를 number로 변환 (string이면 parseInt)
        const locationId =
          typeof filter.locationId === "string"
            ? parseInt(filter.locationId, 10)
            : filter.locationId;

        const data = await getUserContents({
          userId,
          locationId,
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
    [userId, filter, offset, getDistanceRange]
  );

  // 필터 변경 시 새로고침
  useEffect(() => {
    loadContents(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.locationId, filter.typeIds, filter.distanceValue]);

  // 필터 설정 함수들
  const setLocationId = useCallback((id: string | number | null) => {
    setFilter((prev) => ({ ...prev, locationId: id }));
  }, []);

  const setTypeIds = useCallback((ids: number[]) => {
    setFilter((prev) => ({ ...prev, typeIds: ids }));
  }, []);

  const setDistanceValue = useCallback((value: string | number | null) => {
    setFilter((prev) => ({ ...prev, distanceValue: value }));
  }, []);

  // 더 불러오기
  const loadMore = useCallback(() => {
    if (!isLoading && !isLoadingMore && hasMore) {
      loadContents(false);
    }
  }, [isLoading, isLoadingMore, hasMore, loadContents]);

  return {
    user,
    stats,
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
  };
}
