"use client";

import { GpxPoint } from "@/lib/utils/gpx-parser";
import { useEffect, useRef, useState } from "react";

interface KakaoMapProps {
  points: GpxPoint[];
  className?: string;
}

// 카카오맵 SDK가 이미 로드되었는지 확인
function isKakaoLoaded(): boolean {
  return (
    typeof window !== "undefined" &&
    window.kakao !== undefined &&
    window.kakao.maps !== undefined
  );
}

export function KakaoMap({ points, className }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(isKakaoLoaded);

  useEffect(() => {
    // 이미 로드된 경우 스킵
    if (isLoaded) return;

    const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!kakaoMapKey) {
      console.error("카카오맵 API 키가 설정되지 않았습니다.");
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoMapKey}&autoload=false&libraries=services`;
    script.async = true;

    script.onload = () => {
      window.kakao.maps.load(() => {
        setIsLoaded(true);
      });
    };

    document.head.appendChild(script);
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || points.length === 0) return;

    const { kakao } = window;

    // 지도 중심점 (경로의 중간 지점)
    const centerIndex = Math.floor(points.length / 2);
    const centerPoint = points[centerIndex];

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(centerPoint.lat, centerPoint.lng),
      level: 5,
    });

    // 경로 좌표 배열 생성
    const path = points.map(
      (point) => new kakao.maps.LatLng(point.lat, point.lng)
    );

    // 폴리라인 생성
    const polyline = new kakao.maps.Polyline({
      map,
      path,
      strokeWeight: 5,
      strokeColor: "#3396FF",
      strokeOpacity: 1,
      strokeStyle: "solid",
    });

    // 경로가 모두 보이도록 bounds 설정
    const bounds = new kakao.maps.LatLngBounds();
    path.forEach((latlng) => bounds.extend(latlng));
    map.setBounds(bounds);

    // 출발점 마커
    const startMarker = new kakao.maps.Marker({
      map,
      position: path[0],
      image: new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/red_b.png",
        new kakao.maps.Size(50, 45),
        { offset: new kakao.maps.Point(15, 43) }
      ),
    });

    // 도착점 마커
    const endMarker = new kakao.maps.Marker({
      map,
      position: path[path.length - 1],
      image: new kakao.maps.MarkerImage(
        "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/blue_b.png",
        new kakao.maps.Size(50, 45),
        { offset: new kakao.maps.Point(15, 43) }
      ),
    });

    return () => {
      polyline.setMap(null);
      startMarker.setMap(null);
      endMarker.setMap(null);
    };
  }, [isLoaded, points]);

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
