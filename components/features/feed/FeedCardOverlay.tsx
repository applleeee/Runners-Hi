"use client";

import { FeedContent } from "@/lib/api/content";
import Image from "next/image";
import Link from "next/link";

interface FeedCardOverlayProps {
  content: FeedContent;
}

export function FeedCardOverlay({ content }: FeedCardOverlayProps) {
  const { id, title, totalDistance, pace, imageUrl, typeName, locationName } =
    content;

  // 거리 포맷: 10.26 K
  const formattedDistance = `${totalDistance.toFixed(2)} K`;

  // 페이스 포맷: 6.30 P
  const paceMinutes = Math.floor(pace);
  const paceSeconds = Math.round((pace - paceMinutes) * 60);
  const formattedPace = `${paceMinutes}.${paceSeconds.toString().padStart(2, "0")} P`;

  return (
    <Link
      href={`/posts/${id}`}
      className="relative block aspect-[4/3] w-full overflow-hidden rounded-2xl"
    >
      {/* 배경 이미지 */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 720px) 100vw, 720px"
        />
      ) : (
        <div className="absolute inset-0 bg-gray-300 flex items-center justify-center">
          <span className="text-(--sub-text)">이미지</span>
        </div>
      )}

      {/* 하단 그라데이션 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* 하단 정보 */}
      <div className="absolute bottom-4 left-4 right-4">
        {/* 태그 (타입, 위치) */}
        <div className="mb-2 flex gap-2">
          <span className="rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-black">
            {typeName}
          </span>
          {locationName && (
            <span className="truncate rounded bg-white/90 px-2 py-0.5 text-xs font-medium text-black">
              {locationName}
            </span>
          )}
        </div>

        {/* 거리 & 페이스 */}
        <div className="mb-1 flex items-baseline gap-4">
          <span className="text-2xl font-bold text-white">
            {formattedDistance}
          </span>
          <span className="text-2xl font-bold text-white">{formattedPace}</span>
        </div>

        {/* 제목 */}
        <p className="truncate text-sm text-white/90">{title}</p>
      </div>
    </Link>
  );
}
