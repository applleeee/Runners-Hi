import { type ContentDetail } from "@/lib/api/content";
import { formatDuration } from "@/lib/utils/gpx-parser";

interface PostSummaryProps {
  content: ContentDetail;
  showFull?: boolean; // 중간 snap 이상일 때 전체 표시
}

// 날짜를 "YYYY.MM.DD HH:mm" 형식으로 포맷
function formatShortDateTime(date: Date | null): string {
  if (!date) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${mins}`;
}

export function PostSummary({ content, showFull = true }: PostSummaryProps) {
  const { hours, mins } = formatDuration(content.gpxData.duration);
  const startLocationName =
    content.startLocation?.name || content.mainLocation.name;
  const endLocationName =
    content.endLocation?.name || content.mainLocation.name;

  return (
    <div className="space-y-4 pt-2 text-center">
      {/* 타입 태그 */}
      <div className="flex justify-center">
        <span className="rounded-full bg-(--black) px-4 py-1.5 text-sm font-medium text-white">
          {content.typeName}
        </span>
      </div>

      {showFull && (
        <>
          {/* 장소명 */}
          <h2 className="text-lg font-bold text-(--black)">
            {content.mainLocation.name}
          </h2>

          {/* 거리 */}
          <div className="text-3xl font-bold text-(--black)">
            {content.totalDistance.toFixed(2)}
            <span className="ml-1 text-xl font-medium">km</span>
          </div>

          {/* 페이스 & 시간 */}
          <div className="flex items-center justify-center gap-6">
            <div className="text-xl font-bold text-(--black)">
              {content.pace.toFixed(2)}
              <span className="ml-1 text-base font-medium">pace</span>
            </div>
            <div className="text-xl font-bold text-(--black)">
              {hours}
              <span className="text-base font-medium">h </span>
              {mins}
              <span className="text-base font-medium">m</span>
            </div>
          </div>

          {/* 출발/도착 정보 */}
          <div className="flex gap-4 pt-2">
            {/* 출발 */}
            <div className="flex-1 text-center">
              <p className="text-xs text-(--sub-text)">출발</p>
              <p className="text-xs text-(--sub-text)">
                {formatShortDateTime(content.startTime)}
              </p>
              <p className="mt-1 text-sm font-medium text-(--black)">
                {startLocationName}
              </p>
            </div>

            {/* 도착 */}
            <div className="flex-1 text-center">
              <p className="text-xs text-(--sub-text)">도착</p>
              <p className="text-xs text-(--sub-text)">
                {formatShortDateTime(content.endTime)}
              </p>
              <p className="mt-1 text-sm font-medium text-(--black)">
                {endLocationName}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
