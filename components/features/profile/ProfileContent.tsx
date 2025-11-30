"use client";

import { Header } from "@/components/common/Header";
import { ProfileImage } from "@/components/common/ProfileImage";
import { FeedCard } from "@/components/features/feed/FeedCard";
import { FilterDropdown } from "@/components/features/feed/FilterDropdown";
import { TypeFilter } from "@/components/features/feed/TypeFilter";
import { ProfileStats } from "@/components/features/profile/ProfileStats";
import { DISTANCE_OPTIONS } from "@/lib/hooks/feed/useFeed";
import { useUserProfile } from "@/lib/hooks/profile/useUserProfile";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";

interface ProfileContentProps {
  userId: string;
}

export function ProfileContent({ userId }: ProfileContentProps) {
  const {
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
  } = useUserProfile(userId);

  const loadMoreRef = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    loadMore,
  });

  // 위치 옵션 변환
  const locationOptions = [
    { label: "러닝 위치", value: null },
    ...locations.map((loc) => ({
      label: loc.name,
      value: loc.id,
    })),
  ];

  // 거리 옵션 변환
  const distanceOptions = DISTANCE_OPTIONS.map((opt) => ({
    label: opt.label,
    value: opt.value,
  }));

  // 로딩 상태
  if (isLoading && !user) {
    return (
      <div className="flex h-screen flex-col bg-(--bg)">
        <Header variant="back" title="프로필" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-(--key-color) border-t-transparent" />
            <p className="text-sm text-(--sub-text)">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태 (사용자 없음)
  if (!user) {
    return (
      <div className="flex h-screen flex-col bg-(--bg)">
        <Header variant="back" title="프로필" />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <p className="mb-4 text-lg font-semibold text-(--black)">
              사용자를 찾을 수 없습니다
            </p>
            <p className="text-sm text-(--sub-text)">
              존재하지 않거나 삭제된 사용자입니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-(--bg)">
      {/* 헤더 */}
      <Header variant="back" title={user.nickname} />

      {/* 프로필 영역: 이미지(좌) + 누적 통계(우) */}
      <div className="flex justify-center px-4 pt-4 mb-4">
        <div className="flex gap-12 items-center">
          {/* 프로필 이미지 */}
          <div className="shrink-0">
            <ProfileImage
              src={user.profile_image_url}
              fallbackText={user.nickname}
              size={150}
            />
          </div>

          {/* 누적 통계 */}
          <div className="shrink-0">
            <ProfileStats stats={stats} isLoading={isLoading && !stats} />
          </div>
        </div>
      </div>

      {/* 필터 영역 (sticky) */}
      <div className="sticky top-0 z-30 bg-(--bg) px-4 pb-2 pt-3">
        {/* 러닝 위치 필터 */}
        <div className="mb-3 flex justify-center">
          <div className="w-full max-w-xs">
            <FilterDropdown
              label="러닝 위치"
              options={locationOptions}
              value={filter.locationId}
              onChange={setLocationId}
              placeholder="러닝 위치"
            />
          </div>
        </div>

        {/* 러닝 타입 필터 */}
        <div className="mb-3 flex justify-center">
          <TypeFilter
            types={types}
            selectedIds={filter.typeIds}
            onChange={setTypeIds}
          />
        </div>

        {/* 거리 드롭다운 */}
        <div className="mb-3 flex justify-center">
          <FilterDropdown
            label="거리"
            options={distanceOptions}
            value={filter.distanceValue}
            onChange={setDistanceValue}
            placeholder="모든 거리"
            variant="compact"
          />
        </div>
      </div>

      {/* 콘텐츠 목록 */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {isLoading && contents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-(--sub-text)">콘텐츠를 불러오는 중...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-(--sub-text)">
              등록된 콘텐츠가 없습니다.
            </p>
          </div>
        ) : (
          contents.map((content) => (
            <FeedCard key={content.id} content={content} />
          ))
        )}

        {/* 무한 스크롤 트리거 */}
        {hasMore && (
          <div ref={loadMoreRef} className="h-10 py-4">
            {isLoadingMore && (
              <p className="text-center text-sm text-(--sub-text)">
                더 불러오는 중...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
