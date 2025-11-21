import {
  formatDateTime,
  formatDistance,
  formatDuration,
  formatPace,
  GpxData,
} from "@/lib/utils/gpx-parser";

interface RunningStatsProps {
  gpxData: GpxData;
}

export function RunningStats({ gpxData }: RunningStatsProps) {
  const { hours, mins } = formatDuration(gpxData.duration);

  return (
    <div className="flex flex-col items-center py-6">
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

      {/* 출발/도착 시간 */}
      <div className="mt-4 flex items-center gap-8 text-xs text-(--sub-text)">
        <div>
          <span className="mr-2">출발</span>
          <span>{formatDateTime(gpxData.startTime)}</span>
        </div>
        <div>
          <span className="mr-2">도착</span>
          <span>{formatDateTime(gpxData.endTime)}</span>
        </div>
      </div>
    </div>
  );
}
