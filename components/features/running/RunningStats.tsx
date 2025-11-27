import {
  formatDistance,
  formatDuration,
  formatPace,
  GpxData,
} from "@/lib/utils/gpx-parser";

interface RunningStatsProps {
  gpxData: GpxData;
}

/**
 * 날짜와 시간을 분리해서 반환
 */
function splitDateTime(date: Date | null): { date: string; time: string } {
  if (!date) return { date: "-", time: "-" };
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  const secs = String(date.getSeconds()).padStart(2, "0");
  return {
    date: `${year}.${month}.${day}`,
    time: `${hours}:${mins}:${secs}`,
  };
}

export function RunningStats({ gpxData }: RunningStatsProps) {
  const { hours, mins } = formatDuration(gpxData.duration);
  const startDateTime = splitDateTime(gpxData.startTime);
  const endDateTime = splitDateTime(gpxData.endTime);

  return (
    <div className="flex flex-col items-center px-4 py-6">
      {/* 거리 */}
      <div className="mb-4 flex items-baseline">
        <span className="text-4xl font-bold text-(--black)">
          {formatDistance(gpxData.totalDistance)}
        </span>
        <span className="ml-1 text-lg font-medium text-(--black)">KM</span>
      </div>

      {/* 페이스 & 시간 */}
      <div className="flex items-center gap-8">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-(--black)">
            {formatPace(gpxData.pace)}
          </span>
          <span className="ml-1 text-sm font-medium text-(--sub-text)">
            PACE
          </span>
        </div>
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-(--black)">{hours}</span>
          <span className="text-sm font-medium text-(--sub-text)">h</span>
          <span className="ml-1 text-2xl font-bold text-(--black)">{mins}</span>
          <span className="text-sm font-medium text-(--sub-text)">m</span>
        </div>
      </div>

      {/* 출발/도착 시간 - 모바일 친화적 레이아웃 */}
      <div className="mt-4 flex w-full max-w-xs items-center justify-center gap-18 text-xs text-(--sub-text)">
        <div className="flex flex-col items-center">
          <span className="font-medium">출발</span>
          <span>{startDateTime.date}</span>
          <span>{startDateTime.time}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="font-medium">도착</span>
          <span>{endDateTime.date}</span>
          <span>{endDateTime.time}</span>
        </div>
      </div>
    </div>
  );
}
