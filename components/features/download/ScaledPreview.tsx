"use client";

import { useEffect, useRef, useState } from "react";
import { OUTPUT_WIDTH, OUTPUT_HEIGHT } from "./DownloadPreview";

interface ScaledPreviewProps {
  children: React.ReactNode;
}

/**
 * 프리뷰용 스케일 래퍼 컴포넌트
 * 1080x1350 크기의 DownloadPreview를 컨테이너에 맞게 축소해서 표시
 * 프리뷰와 다운로드 결과물의 완벽한 동일성을 보장
 */
export function ScaledPreview({ children }: ScaledPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
      const containerWidth = container.clientWidth;
      // 컨테이너 너비 기준으로 스케일 계산
      const newScale = containerWidth / OUTPUT_WIDTH;
      setScale(newScale);
    };

    // 초기 스케일 설정
    updateScale();

    // 컨테이너 크기 변경 감지
    const observer = new ResizeObserver(updateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // 축소된 높이 계산
  const scaledHeight = OUTPUT_HEIGHT * scale;

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{
        height: scaledHeight || "auto",
        aspectRatio: scale === 0 ? `${OUTPUT_WIDTH} / ${OUTPUT_HEIGHT}` : undefined,
      }}
    >
      {scale > 0 && (
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: OUTPUT_WIDTH,
            height: OUTPUT_HEIGHT,
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
