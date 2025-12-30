"use client";

import { MapFeedContent } from "@/lib/api/content";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface MultiRouteMapProps {
  contents: MapFeedContent[];
  className?: string;
}

// 카카오맵 SDK가 완전히 로드되었는지 확인
function isKakaoReady(): boolean {
  return (
    typeof window !== "undefined" &&
    window.kakao !== undefined &&
    window.kakao.maps !== undefined &&
    typeof window.kakao.maps.LatLng === "function"
  );
}

// 줌 레벨 임계값 (이보다 크면 축소 상태로 간주)
const ZOOM_THRESHOLD = 10;

// 디바운스 시간 (ms)
const DEBOUNCE_DELAY = 100;

export function MultiRouteMap({ contents, className }: MultiRouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(isKakaoReady);
  const router = useRouter();

  // 지도 및 오버레이 객체 참조
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const polylinesRef = useRef<kakao.maps.Polyline[]>([]);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 카카오맵 SDK 로드 대기
  useEffect(() => {
    if (isLoaded) return;

    const checkKakaoLoaded = () => {
      if (typeof window.kakao !== "undefined" && window.kakao.maps) {
        window.kakao.maps.load(() => {
          setIsLoaded(true);
        });
      } else {
        setTimeout(checkKakaoLoaded, 100);
      }
    };

    checkKakaoLoaded();
  }, [isLoaded]);

  // 현재 bounds 내 경로만 표시하는 함수
  const updateVisibleRoutes = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bounds = (map as any).getBounds();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const level = (map as any).getLevel();

    // 축소 상태 (level > ZOOM_THRESHOLD): 경로 숨김
    if (level > ZOOM_THRESHOLD) {
      polylinesRef.current.forEach((polyline) => polyline.setMap(null));
      return;
    }

    // 확대 상태: bounds 내 경로만 표시
    contents.forEach((content, index) => {
      const polyline = polylinesRef.current[index];
      if (!polyline) return;

      const startPoint = content.startPoint;
      const startLatLng = new window.kakao.maps.LatLng(
        startPoint.lat,
        startPoint.lng
      );

      const isInBounds = bounds.contain(startLatLng);
      polyline.setMap(isInBounds ? map : null);
    });
  }, [contents]);

  // 디바운스된 업데이트 함수
  const debouncedUpdate = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      updateVisibleRoutes();
    }, DEBOUNCE_DELAY);
  }, [updateVisibleRoutes]);

  // 지도 초기화 및 경로/마커 생성
  useEffect(() => {
    if (!isLoaded || !mapRef.current || contents.length === 0) return;

    const { kakao } = window;

    // 기존 폴리라인/마커 정리
    polylinesRef.current.forEach((p) => p.setMap(null));
    markersRef.current.forEach((m) => m.setMap(null));
    polylinesRef.current = [];
    markersRef.current = [];

    // 지도 생성 (서울 기본 중심)
    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 8,
    });
    mapInstanceRef.current = map;

    const bounds = new kakao.maps.LatLngBounds();

    // RUN 핀 이미지 (한 번만 생성, 모든 마커가 공유)
    const runPinImage = new kakao.maps.MarkerImage(
      "/icons/run-pin.png",
      new kakao.maps.Size(40, 40), // 이미지 크기
      { offset: new kakao.maps.Point(0, 40) } // 앵커 포인트 (핀 끝부분)
    );

    // 각 콘텐츠의 경로와 마커 생성
    contents.forEach((content) => {
      if (content.points.length === 0) return;

      // 폴리라인 좌표 배열
      const path = content.points.map(
        (point) => new kakao.maps.LatLng(point.lat, point.lng)
      );

      // 폴리라인 생성
      const polyline = new kakao.maps.Polyline({
        path,
        strokeWeight: 4,
        strokeColor: "#3396FF",
        strokeOpacity: 0.8,
        strokeStyle: "solid",
      });
      polylinesRef.current.push(polyline);

      // bounds 확장
      path.forEach((latlng) => bounds.extend(latlng));

      // 출발지 마커 (공유 이미지 사용)
      const marker = new kakao.maps.Marker({
        map,
        position: path[0],
        image: runPinImage, // 공유 이미지 객체 재사용
      });
      markersRef.current.push(marker);

      // 마커 클릭 이벤트 - 상세 페이지 이동
      kakao.maps.event.addListener(marker, "click", () => {
        router.push(`/posts/${content.id}`);
      });
    });

    // 모든 경로가 보이도록 bounds 설정
    if (contents.length > 0) {
      map.setBounds(bounds);
    }

    // 초기 경로 표시 상태 업데이트
    updateVisibleRoutes();

    // 줌/이동 이벤트 리스너
    kakao.maps.event.addListener(map, "zoom_changed", debouncedUpdate);
    kakao.maps.event.addListener(map, "bounds_changed", debouncedUpdate);

    // 클린업
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      polylinesRef.current.forEach((p) => p.setMap(null));
      markersRef.current.forEach((m) => m.setMap(null));
      polylinesRef.current = [];
      markersRef.current = [];
    };
  }, [isLoaded, contents, router, updateVisibleRoutes, debouncedUpdate]);

  return (
    <div
      ref={mapRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      {!isLoaded && (
        <div className="flex h-full items-center justify-center bg-gray-100">
          <p className="text-sm text-(--sub-text)">지도를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
}
