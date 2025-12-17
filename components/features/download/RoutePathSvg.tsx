import { GpxPoint } from "@/lib/utils/gpx-parser";

interface RoutePathSvgProps {
  points: GpxPoint[];
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

/**
 * GPX 경로를 SVG로 렌더링합니다.
 * 좌표를 정규화하여 지정된 크기 내에 맞춥니다.
 */
export function RoutePathSvg({
  points,
  size = 80,
  strokeColor = "#FFFFFF",
  strokeWidth = 2,
}: RoutePathSvgProps) {
  if (points.length < 2) return null;

  // 1. bounds 계산
  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const bounds = {
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
    minLng: Math.min(...lngs),
    maxLng: Math.max(...lngs),
  };

  // 2. 좌표 범위 계산
  const latRange = bounds.maxLat - bounds.minLat;
  const lngRange = bounds.maxLng - bounds.minLng;

  // 범위가 0인 경우 (직선 경로) 처리
  const effectiveLatRange = latRange || 0.001;
  const effectiveLngRange = lngRange || 0.001;

  // 3. 패딩 및 스케일 계산
  const padding = size * 0.1;
  const availableSize = size - 2 * padding;

  // 종횡비 유지를 위한 스케일 계산
  const scale = Math.min(
    availableSize / effectiveLngRange,
    availableSize / effectiveLatRange
  );

  // 중앙 정렬을 위한 오프셋
  const scaledWidth = effectiveLngRange * scale;
  const scaledHeight = effectiveLatRange * scale;
  const offsetX = padding + (availableSize - scaledWidth) / 2;
  const offsetY = padding + (availableSize - scaledHeight) / 2;

  // 4. 좌표 정규화
  const normalizedPoints = points.map((point) => ({
    x: offsetX + (point.lng - bounds.minLng) * scale,
    // y축 반전: 위도가 클수록 위쪽
    y: offsetY + (bounds.maxLat - point.lat) * scale,
  }));

  // 5. SVG path 생성
  const pathD =
    `M ${normalizedPoints[0].x.toFixed(2)},${normalizedPoints[0].y.toFixed(2)} ` +
    normalizedPoints
      .slice(1)
      .map((p) => `L ${p.x.toFixed(2)},${p.y.toFixed(2)}`)
      .join(" ");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={pathD}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
