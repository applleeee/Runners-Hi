"use client";

import { BottomButton } from "@/components/common/BottomButton";
import { Header } from "@/components/common/Header";
import { ImageUploader } from "@/components/features/running/ImageUploader";
import { PlaceSearch } from "@/components/features/running/PlaceSearch";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useNewPostForm } from "@/lib/hooks/post/useNewPostForm";
import { formatDistance, formatPace } from "@/lib/utils/gpx-parser";
import { Check } from "lucide-react";

export default function NewPostDetailPage() {
  const { showToast, ToastComponent } = useToast();

  const {
    gpxData,
    title,
    setTitle,
    images,
    setImages,
    memo,
    setMemo,
    runningTypes,
    selectedTypeId,
    setSelectedTypeId,
    locations,
    useMainForStart,
    setUseMainForStart,
    useMainForEnd,
    setUseMainForEnd,
    isPlaceSearchOpen,
    setIsPlaceSearchOpen,
    isSubmitting,
    handleOpenPlaceSearch,
    handleSelectPlace,
    handleSubmit,
    handleClose,
  } = useNewPostForm();

  const onSubmit = () => {
    handleSubmit(() => {
      showToast("러닝 기록이 등록되었습니다.");
    });
  };

  // 시작 시간 포맷 (YYYY.MM.DD HH:mm)
  const formatStartTime = (date: Date | null): string => {
    if (!date) return "-";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const mins = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${mins}`;
  };

  if (!gpxData) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-(--sub-text)">로딩 중...</p>
      </div>
    );
  }

  const inputStyle =
    "h-12 border-none bg-white px-3 text-center text-sm font-normal placeholder:text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-(--bg)">
      <Header
        variant="close"
        title="러닝 기록 등록하기"
        onClose={handleClose}
      />

      <main className="flex-1 overflow-y-auto px-4 py-4">
        {/* 러닝 요약 정보 */}
        <div className="flex flex-col items-center gap-0.5 rounded-xl bg-(--sub-color) px-3 py-2.5 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          <span className="text-xs text-(--black)">
            {formatStartTime(gpxData.startTime)}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-(--black)">
              {formatDistance(gpxData.totalDistance)} km
            </span>
            <span className="text-sm font-bold text-(--black)">
              {formatPace(gpxData.pace)} pace
            </span>
          </div>
        </div>

        {/* 제목 입력 */}
        <div className="mt-4">
          <Input
            type="text"
            placeholder="제목 입력 (30자 이내)"
            value={title}
            onChange={(e) => setTitle(e.target.value.slice(0, 30))}
            className={inputStyle}
          />
        </div>

        {/* 러닝 타입 선택 */}
        <div className="mt-3 flex gap-2">
          {runningTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedTypeId(type.id)}
              className={`min-w-0 flex-1 rounded-full px-2 py-2 text-xs font-bold transition-colors ${
                selectedTypeId === type.id
                  ? "bg-(--key-color) text-(--black) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                  : "bg-white text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              }`}
            >
              {type.name}
            </button>
          ))}
        </div>

        {/* 대표위치 선택 */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => handleOpenPlaceSearch("main")}
            className={`w-full ${inputStyle} flex items-center justify-center`}
          >
            {locations.main ? (
              <span className="truncate text-sm font-normal text-(--black)">
                {locations.main.placeName}
              </span>
            ) : (
              <span className="text-sm font-normal text-(--sub-text)">
                대표위치 선택
              </span>
            )}
          </button>
        </div>

        {/* 출발/도착 위치 */}
        <div className="mt-3 flex items-center gap-2">
          {/* 출발위치 */}
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                if (!useMainForStart) {
                  handleOpenPlaceSearch("start");
                }
              }}
              className={`w-full ${inputStyle} flex items-center justify-center ${
                useMainForStart
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {useMainForStart && locations.main ? (
                <span className="truncate text-sm font-normal text-(--black)">
                  {locations.main.placeName}
                </span>
              ) : useMainForStart ? (
                <span className="text-sm font-normal text-(--sub-text)">
                  출발위치 선택
                </span>
              ) : locations.start ? (
                <span className="truncate text-sm font-normal text-(--black)">
                  {locations.start.placeName}
                </span>
              ) : (
                <span className="text-sm font-normal text-(--sub-text)">
                  출발위치 선택
                </span>
              )}
            </button>
          </div>

          {/* 물결 표시 */}
          <span className="shrink-0 text-(--sub-text)">~</span>

          {/* 도착위치 */}
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={() => {
                if (!useMainForEnd) {
                  handleOpenPlaceSearch("end");
                }
              }}
              className={`w-full ${inputStyle} flex items-center justify-center ${
                useMainForEnd
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              {useMainForEnd && locations.main ? (
                <span className="truncate text-sm font-normal text-(--black)">
                  {locations.main.placeName}
                </span>
              ) : useMainForEnd ? (
                <span className="text-sm font-normal text-(--sub-text)">
                  도착위치 선택
                </span>
              ) : locations.end ? (
                <span className="truncate text-sm font-normal text-(--black)">
                  {locations.end.placeName}
                </span>
              ) : (
                <span className="text-sm font-normal text-(--sub-text)">
                  도착위치 선택
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 대표위치 사용 체크박스 */}
        <div className="mt-3 flex justify-between px-2">
          <button
            type="button"
            onClick={() => setUseMainForStart(!useMainForStart)}
            className="flex items-center gap-2 text-xs text-(--key-color)"
          >
            <Check
              className={`h-4 w-4 ${
                useMainForStart ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className="text-(--sub-text)">대표위치 사용</span>
          </button>
          <button
            type="button"
            onClick={() => setUseMainForEnd(!useMainForEnd)}
            className="flex items-center gap-2 text-xs text-(--key-color)"
          >
            <Check
              className={`h-4 w-4 ${
                useMainForEnd ? "opacity-100" : "opacity-0"
              }`}
            />
            <span className="text-(--sub-text)">대표위치 사용</span>
          </button>
        </div>

        {/* 이미지 업로더 */}
        <div className="mt-4">
          <ImageUploader images={images} onImagesChange={setImages} />
        </div>

        {/* 추가 내용 입력 */}
        <div className="mt-3">
          <textarea
            placeholder="추가로 쓰고 싶은 내용을 편하게 작성하세요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="min-h-[100px] w-full resize-none rounded-2xl border-none bg-white px-3 py-2.5 text-sm text-(--black) placeholder:text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus:outline-none focus:ring-2 focus:ring-(--key-color)"
          />
        </div>
      </main>

      {/* 하단 버튼 */}
      <BottomButton
        onClick={onSubmit}
        variant="primary"
        disabled={isSubmitting}
      >
        {isSubmitting ? "등록 중..." : "러닝 등록하기"}
      </BottomButton>

      {/* 장소 검색 모달 */}
      <PlaceSearch
        isOpen={isPlaceSearchOpen}
        onClose={() => setIsPlaceSearchOpen(false)}
        onSelect={handleSelectPlace}
      />

      {/* 토스트 */}
      {ToastComponent}
    </div>
  );
}
