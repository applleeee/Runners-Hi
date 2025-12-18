"use client";

import { ContentDetail } from "@/lib/api/content";
import {
  formatDateTime,
  formatDistance,
  formatPace,
} from "@/lib/utils/gpx-parser";
import { forwardRef } from "react";
import { RoutePathSvg } from "./RoutePathSvg";

// 인스타그램 피드 최적화 해상도 (4:5 비율)
export const OUTPUT_WIDTH = 1080;
export const OUTPUT_HEIGHT = 1350;

interface DownloadPreviewProps {
  imageUrl: string;
  content: ContentDetail;
}

/**
 * 다운로드용 이미지 프리뷰 컴포넌트
 * html-to-image로 캡처할 대상
 * 고정 해상도: 1080 x 1350 (인스타그램 피드 4:5)
 * 프리뷰에서는 ScaledPreview로 감싸서 축소 표시
 */
export const DownloadPreview = forwardRef<HTMLDivElement, DownloadPreviewProps>(
  function DownloadPreview({ imageUrl, content }, ref) {
    // 시간 포맷: h:mm:ss
    const totalSeconds = Math.round(content.gpxData.duration * 60);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const timeString = `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(
      2,
      "0"
    )}`;

    return (
      <div
        ref={ref}
        className="relative overflow-hidden bg-black"
        style={{ width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT }}
      >
        {/* 배경 이미지 - 전체가 보이도록, 남는 영역은 검정 배경 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="러닝 인증샷"
          className="absolute inset-0 h-full w-full object-contain"
          crossOrigin="anonymous"
        />

        {/* 오버레이 정보들 - 흰색 텍스트 */}
        <div className="absolute inset-0 flex flex-col text-white">
          {/* 타이틀 - 상단 10% */}
          <div
            className="absolute left-0 right-0 text-center"
            style={{ top: "10%" }}
          >
            <span className="text-3xl font-bold">{content.title}</span>
          </div>

          {/* 중앙 정보: 거리, 페이스, 시간, 경로 */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center gap-2"
            style={{ top: "40%" }}
          >
            {/* 거리 */}
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-bold">
                {formatDistance(content.totalDistance)}
              </span>
              <span className="text-2xl">km</span>
            </div>

            {/* 페이스 */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">
                {formatPace(content.pace)}
              </span>
              <span className="text-xl">pace</span>
            </div>

            {/* 총 시간 */}
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{timeString}</span>
              <span className="text-xl">h</span>
            </div>

            {/* 경로 SVG */}
            <div className="mt-4">
              <RoutePathSvg
                points={content.gpxData.points}
                size={180}
                strokeColor="#FFFFFF"
                strokeWidth={3}
              />
            </div>
          </div>

          {/* 하단 정보: 주요위치, 시작일시 */}
          <div
            className="absolute left-0 right-0 flex flex-col items-center gap-2"
            style={{ bottom: "7%" }}
          >
            <span className="text-xl">{content.mainLocation.name}</span>
            <span className="text-lg">
              {formatDateTime(content.startTime)}
            </span>
          </div>
        </div>
      </div>
    );
  }
);
