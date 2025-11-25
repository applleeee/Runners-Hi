"use client";

import { FeedContent } from "@/lib/api/content";
import Image from "next/image";
import Link from "next/link";

interface FeedCardProps {
  content: FeedContent;
}

export function FeedCard({ content }: FeedCardProps) {
  const { id, title, totalDistance, pace, imageUrl, typeName, locationName } =
    content;

  // 거리 포맷: 10.26 K
  const formattedDistance = totalDistance.toFixed(2);

  // 페이스 포맷: 6.30 P (분.초 형식)
  const paceMinutes = Math.floor(pace);
  const paceSeconds = Math.round((pace - paceMinutes) * 60);
  const formattedPace = `${paceMinutes}.${paceSeconds
    .toString()
    .padStart(2, "0")}`;

  return (
    <Link
      href={`/posts/${id}`}
      className="flex overflow-hidden rounded-2xl bg-white"
    >
      {/* 이미지 영역 */}
      <div className="relative w-[100px] shrink-0 overflow-hidden rounded-2xl bg-gray-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="100px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-(--sub-text)">
            이미지
          </div>
        )}
      </div>

      {/* 콘텐츠 영역 */}
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-3">
        {/* 태그 영역 */}
        <div className="mb-1 flex gap-1">
          <span className="shrink-0 whitespace-nowrap rounded bg-(--black) px-2 py-0.5 text-xs text-white">
            {typeName}
          </span>
          <span className="truncate rounded bg-(--black) px-2 py-0.5 text-xs text-white">
            {locationName}
          </span>
        </div>

        {/* 거리 & 페이스 */}
        <div className="mb-1 flex items-baseline gap-2">
          <span className="shrink-0 whitespace-nowrap text-xl font-bold text-(--black)">
            {formattedDistance}
            <span className="ml-0.5 text-xl font-normal">K</span>
          </span>
          <span className="shrink-0 whitespace-nowrap text-xl font-bold text-(--black)">
            {formattedPace}
            <span className="ml-0.5 text-xl font-normal">P</span>
          </span>
        </div>

        {/* 제목 */}
        <p className="truncate text-xs text-(--black)">{title}</p>
      </div>
    </Link>
  );
}
