"use client";

import { FloatingButton } from "@/components/common/FloatingButton";
import { Header } from "@/components/common/Header";
import { FeedCardOverlay } from "@/components/features/feed/FeedCardOverlay";
import { FilterDropdown } from "@/components/features/feed/FilterDropdown";
import { TypeFilter } from "@/components/features/feed/TypeFilter";
import { ViewTabs } from "@/components/features/feed/ViewTabs";
import { MultiRouteMap } from "@/components/features/running/MultiRouteMap";
import { DISTANCE_OPTIONS, useFeed } from "@/lib/hooks/feed/useFeed";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";

export default function Home() {
  const {
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
    // MAP/CARD 뷰 모드
    viewMode,
    setViewMode,
    mapContents,
    isLoadingMap,
  } = useFeed();

  const loadMoreRef = useInfiniteScroll({
    hasMore,
    isLoadingMore,
    loadMore,
  });

  // 위치 드롭다운 옵션 생성
  const locationOptions = [
    { label: "러닝 위치", value: null },
    ...locations.map((loc) => ({ label: loc.name, value: loc.id })),
  ];

  // 거리 드롭다운 옵션 생성
  const distanceOptions = DISTANCE_OPTIONS.map((opt) => ({
    label: opt.label,
    value: opt.value,
  }));

  return (
    <div className="flex flex-1 flex-col bg-(--bg)">
      {/* 헤더 */}
      <Header variant="main" />

      {/* 필터 영역 */}
      <div className="sticky top-0 z-30 bg-(--bg) px-4 pb-2 pt-3">
        {/* 위치 드롭다운 - 중앙 정렬 */}
        <div className="mb-3 flex justify-center">
          <div className="w-full max-w-xs">
            <FilterDropdown
              label="러닝 위치"
              options={locationOptions}
              value={filter.locationId}
              onChange={(value) => setLocationId(value as number | null)}
              placeholder="러닝 위치"
            />
          </div>
        </div>

        {/* 타입 필터 - 중앙 정렬 */}
        <div className="mb-3 flex justify-center">
          <TypeFilter
            types={types}
            selectedIds={filter.typeIds}
            onChange={setTypeIds}
          />
        </div>

        {/* 거리 드롭다운 - 중앙 정렬 */}
        <div className="flex justify-center">
          <FilterDropdown
            label="거리"
            options={distanceOptions}
            value={filter.distanceValue}
            onChange={(value) => setDistanceValue(value as string | null)}
            placeholder="모든 거리"
            variant="compact"
          />
        </div>

        {/* MAP/CARD 탭 */}
        <div className="mt-3">
          <ViewTabs viewMode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* 콘텐츠 영역 - 뷰 모드에 따라 분기 */}
      <div className="flex-1">
        {viewMode === "map" ? (
          // MAP 뷰
          isLoadingMap ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-(--sub-text)">지도를 불러오는 중...</p>
            </div>
          ) : mapContents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-(--sub-text)">등록된 러닝 기록이 없습니다.</p>
              <p className="mt-1 text-sm text-(--sub-text)">
                첫 번째 러닝 기록을 등록해보세요!
              </p>
            </div>
          ) : (
            <div className="h-[calc(100dvh-280px)]">
              <MultiRouteMap contents={mapContents} className="h-full w-full" />
            </div>
          )
        ) : (
          // CARD 뷰
          <>
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <p className="text-(--sub-text)">불러오는 중...</p>
              </div>
            ) : contents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <p className="text-(--sub-text)">등록된 러닝 기록이 없습니다.</p>
                <p className="mt-1 text-sm text-(--sub-text)">
                  첫 번째 러닝 기록을 등록해보세요!
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 p-4">
                {contents.map((content) => (
                  <FeedCardOverlay key={content.id} content={content} />
                ))}
              </div>
            )}

            {/* 무한 스크롤 트리거 (CARD 뷰에서만) */}
            <div ref={loadMoreRef} className="h-10">
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                  <p className="text-sm text-(--sub-text)">더 불러오는 중...</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FAB 버튼 */}
      <FloatingButton href="/posts/new" label="러닝 기록 등록하기" />
    </div>
  );
}
