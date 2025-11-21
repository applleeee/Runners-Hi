export interface GpxPoint {
  lat: number;
  lng: number;
  time?: Date;
  elevation?: number;
}

export interface GpxData {
  points: GpxPoint[];
  totalDistance: number; // km
  startTime: Date | null;
  endTime: Date | null;
  duration: number; // minutes
  pace: number; // min/km
}

/**
 * GPX 파일을 파싱하여 경로 데이터를 추출합니다.
 */
export async function parseGpxFile(file: File): Promise<GpxData> {
  const text = await file.text();
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");

  const points: GpxPoint[] = [];

  // trkpt (track point) 요소들을 찾습니다
  const trackPoints = xml.querySelectorAll("trkpt");

  trackPoints.forEach((trkpt) => {
    const lat = parseFloat(trkpt.getAttribute("lat") || "0");
    const lng = parseFloat(trkpt.getAttribute("lon") || "0");
    const timeEl = trkpt.querySelector("time");
    const eleEl = trkpt.querySelector("ele");

    const point: GpxPoint = { lat, lng };

    if (timeEl?.textContent) {
      point.time = new Date(timeEl.textContent);
    }

    if (eleEl?.textContent) {
      point.elevation = parseFloat(eleEl.textContent);
    }

    points.push(point);
  });

  // 총 거리 계산 (Haversine formula)
  const totalDistance = calculateTotalDistance(points);

  // 시작/종료 시간
  const startTime = points[0]?.time || null;
  const endTime = points[points.length - 1]?.time || null;

  // 소요 시간 (분)
  let duration = 0;
  if (startTime && endTime) {
    duration = (endTime.getTime() - startTime.getTime()) / 1000 / 60;
  }

  // 페이스 (min/km)
  let pace = 0;
  if (totalDistance > 0 && duration > 0) {
    pace = duration / totalDistance;
  }

  return {
    points,
    totalDistance,
    startTime,
    endTime,
    duration,
    pace,
  };
}

/**
 * Haversine 공식을 사용하여 두 좌표 사이의 거리를 계산합니다 (km)
 */
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * 경로의 총 거리를 계산합니다 (km)
 */
function calculateTotalDistance(points: GpxPoint[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat,
      points[i - 1].lng,
      points[i].lat,
      points[i].lng
    );
  }
  return total;
}

/**
 * 소요 시간을 "Xh Ym" 형식으로 포맷합니다
 */
export function formatDuration(minutes: number): {
  hours: number;
  mins: number;
} {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return { hours, mins };
}

/**
 * 페이스를 "X.XX" 형식으로 포맷합니다
 */
export function formatPace(pace: number): string {
  return pace.toFixed(2);
}

/**
 * 거리를 "XX.XX" 형식으로 포맷합니다
 */
export function formatDistance(km: number): string {
  return km.toFixed(2);
}

/**
 * 날짜를 "YYYY.MM.DD HH:mm:ss" 형식으로 포맷합니다
 */
export function formatDateTime(date: Date | null): string {
  if (!date) return "-";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  const secs = String(date.getSeconds()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${mins}:${secs}`;
}
