import { type UserStats } from "@/lib/api/content";

interface ProfileStatsProps {
  stats: UserStats | null;
  isLoading?: boolean;
}

export function ProfileStats({ stats, isLoading }: ProfileStatsProps) {
  if (isLoading || !stats) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-end">
          <span className="text-lg font-bold text-(--black)">...</span>
          <span className="text-lg text-(--black)"> km</span>
        </div>
        <div className="text-end">
          <span className="text-lg font-bold text-(--black)">...</span>
          <span className="text-lg text-(--black)"> h </span>
          <span className="text-lg font-bold text-(--black)">...</span>
          <span className="text-lg text-(--black)"> m</span>
        </div>
        <div className="text-end">
          <span className="text-lg font-bold text-(--black)">...</span>
          <span className="text-lg text-(--black)"> race</span>
        </div>
      </div>
    );
  }

  // 시간 포맷팅: 분 → "h m" 형식
  const hours = Math.floor(stats.totalDuration / 60);
  const minutes = stats.totalDuration % 60;

  return (
    <div className="flex flex-col gap-2">
      {/* 총 거리 */}
      <div className="text-end">
        <span className="text-lg font-bold text-(--black)">
          {stats.totalDistance.toFixed(2)}
        </span>
        <span className="text-lg text-(--black)"> km</span>
      </div>

      {/* 총 시간 */}
      <div className="text-end">
        <span className="text-lg font-bold text-(--black)">{hours}</span>
        <span className="text-lg text-(--black)"> h </span>
        <span className="text-lg font-bold text-(--black)">{minutes}</span>
        <span className="text-lg text-(--black)"> m</span>
      </div>

      {/* 총 러닝 횟수 */}
      <div className="text-end">
        <span className="text-lg font-bold text-(--black)">
          {stats.totalCount}
        </span>
        <span className="text-lg text-(--black)"> race</span>
      </div>
    </div>
  );
}
