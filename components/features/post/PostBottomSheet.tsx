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

// 스냅 포인트: 모두 비율로 정의하여 PC/모바일 환경에서 일관된 UI 제공
// 픽셀 단위는 모바일 브라우저의 동적 뷰포트(주소창 숨김 등)로 인해 차이 발생
const SNAP_MIN = 0.1; // ~10% - 드래그 핸들만
const SNAP_MID = 0.55; // ~55% - 요약 정보 전체(사진 제외)
const SNAP_MAX = 0.95; // 95% - 전체 컨텐츠

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
            height: `${(snapPoints[snapPoints.length - 1] as number) * 100}vh`,
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

          {/* 스크롤 가능한 콘텐츠 */}
          <div
            className={cn(
              "flex-1 px-6",
              // 최대 스냅 포인트에서만 스크롤 가능
              isMaxSnap ? "overflow-y-auto" : "overflow-hidden"
            )}
          >
            <div className="space-y-5 pb-20">
              {/* 항상 표시: 타입 태그 (최소 snap에서는 태그만) */}
              <PostSummary content={content} showFull={!isMinSnap} />

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
