"use client";

import { type ContentDetail } from "@/lib/api/content";
import { cn } from "@/lib/utils/index";
import { useState } from "react";
import { Drawer as DrawerPrimitive } from "vaul";
import { PostDetails } from "./PostDetails";
import { PostImages } from "./PostImages";
import { PostSummary } from "./PostSummary";

interface PostBottomSheetProps {
  content: ContentDetail;
}

// 스냅 포인트: 고정 픽셀값 사용
// 환경별 차이는 있지만, 컨텐츠를 상단 정렬하여 여백 문제 해결
const SNAP_MIN = "50px"; // 드래그 핸들만
const SNAP_MID = "320px"; // 요약 정보
const SNAP_MAX = 0.95; // 전체 (비율)

const snapPoints: (number | string)[] = [SNAP_MIN, SNAP_MID, SNAP_MAX];

export function PostBottomSheet({ content }: PostBottomSheetProps) {
  const [snap, setSnap] = useState<number | string | null>(SNAP_MID);

  // 현재 snap 상태 판별
  const isMinSnap = snap === SNAP_MIN;
  const isMaxSnap = snap === SNAP_MAX;

  return (
    <DrawerPrimitive.Root
      open={true}
      modal={false}
      dismissible={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <DrawerPrimitive.Portal>
        <DrawerPrimitive.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-[720px] flex-col rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.1)]"
          )}
          style={{
            height: "100dvh",
          }}
        >
          {/* 드래그 핸들 */}
          <div
            className="mx-auto mt-4 h-2 w-[100px] shrink-0 cursor-grab rounded-full bg-(--unselect) active:cursor-grabbing"
            data-vaul-drag-handle
          />

          {/* 접근성을 위한 숨겨진 제목 */}
          <DrawerPrimitive.Title className="sr-only">
            러닝 기록 상세
          </DrawerPrimitive.Title>

          {/* 컨텐츠 영역 - flex-1 제거하고 컨텐츠 크기에 맞춤 */}
          <div
            className={cn(
              "px-6",
              isMaxSnap ? "flex-1 overflow-y-auto" : "overflow-hidden"
            )}
          >
            <div className="space-y-5 pb-20">
              {/* 최소 snap에서는 아무것도 표시 안함 */}
              {!isMinSnap && <PostSummary content={content} showFull />}

              {/* 최대 snap에서만 표시: 이미지, 코멘트, 프로필 */}
              {isMaxSnap && (
                <>
                  {content.imageUrls.length > 0 && (
                    <PostImages images={content.imageUrls} />
                  )}
                  <PostDetails content={content} />
                </>
              )}
            </div>
          </div>
        </DrawerPrimitive.Content>
      </DrawerPrimitive.Portal>
    </DrawerPrimitive.Root>
  );
}
