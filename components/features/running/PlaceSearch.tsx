"use client";

import { useEffect, useRef, useState } from "react";

interface PlaceSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (place: PlaceResult) => void;
}

export interface PlaceResult {
  placeName: string;
}

// 카카오맵 SDK가 이미 로드되었는지 확인
function isKakaoLoaded(): boolean {
  return (
    typeof window !== "undefined" &&
    window.kakao !== undefined &&
    window.kakao.maps !== undefined &&
    window.kakao.maps.services !== undefined
  );
}

export function PlaceSearch({ isOpen, onClose, onSelect }: PlaceSearchProps) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<
    kakao.maps.services.PlaceSearchResult[]
  >([]);
  const [isLoaded, setIsLoaded] = useState(isKakaoLoaded);
  const [isSearching, setIsSearching] = useState(false);
  const [noResult, setNoResult] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);

  // SDK 로드
  useEffect(() => {
    if (isLoaded) return;

    const kakaoMapKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

    if (!kakaoMapKey) {
      console.error("카카오맵 API 키가 설정되지 않았습니다.");
      return;
    }

    const existingScript = document.querySelector(
      'script[src*="dapi.kakao.com"]'
    );

    if (existingScript) {
      const checkLoaded = setInterval(() => {
        if (isKakaoLoaded()) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
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

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !isOpen) return;
    if (mapInstanceRef.current) return; // 이미 초기화됨

    const { kakao } = window;

    // 서울 중심 좌표
    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978),
      level: 5,
    });

    mapInstanceRef.current = map;
  }, [isLoaded, isOpen]);

  // 모달 닫기 핸들러
  const handleClose = () => {
    // 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
    // 지도 인스턴스 초기화
    mapInstanceRef.current = null;
    // 상태 초기화
    setResults([]);
    setKeyword("");
    setNoResult(false);
    // 부모 콜백 호출
    onClose();
  };

  // 마커 표시
  const displayMarkers = (places: kakao.maps.services.PlaceSearchResult[]) => {
    if (!mapInstanceRef.current) return;

    const { kakao } = window;
    const map = mapInstanceRef.current;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    const bounds = new kakao.maps.LatLngBounds();

    places.forEach((place) => {
      const position = new kakao.maps.LatLng(
        parseFloat(place.y),
        parseFloat(place.x)
      );

      const marker = new kakao.maps.Marker({
        map,
        position,
      });

      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, "click", () => {
        handleSelectPlace(place);
      });

      markersRef.current.push(marker);
      bounds.extend(position);
    });

    // 모든 마커가 보이도록 지도 범위 조정
    if (places.length > 0) {
      map.setBounds(bounds);
    }
  };

  const handleSearch = () => {
    if (!keyword.trim() || !isLoaded) return;

    setIsSearching(true);
    setNoResult(false);
    setResults([]);

    const places = new window.kakao.maps.services.Places();

    places.keywordSearch(keyword, (result, status) => {
      setIsSearching(false);

      if (status === "OK") {
        setResults(result);
        displayMarkers(result);
      } else if (status === "ZERO_RESULT") {
        setNoResult(true);
        // 마커 제거
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSelectPlace = (place: kakao.maps.services.PlaceSearchResult) => {
    onSelect({
      placeName: place.place_name,
    });
  };

  // 목록 항목 클릭 시 지도 중심 이동
  const handleListItemClick = (
    place: kakao.maps.services.PlaceSearchResult
  ) => {
    if (mapInstanceRef.current) {
      const { kakao } = window;
      const position = new kakao.maps.LatLng(
        parseFloat(place.y),
        parseFloat(place.x)
      );
      mapInstanceRef.current.setCenter(position);
      mapInstanceRef.current.setLevel(3);
    }
    handleSelectPlace(place);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* 헤더 */}
      <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-bold">장소 검색</h2>
        <button
          type="button"
          onClick={handleClose}
          className="text-2xl text-(--sub-text)"
        >
          ✕
        </button>
      </div>

      {/* 검색 입력 */}
      <div className="shrink-0 border-b p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="장소를 입력하세요"
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-(--key-color) focus:outline-none"
            autoFocus
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={!isLoaded || isSearching}
            className="rounded-lg bg-(--key-color) px-6 py-3 font-semibold text-(--black) disabled:opacity-50"
          >
            검색
          </button>
        </div>
        {!isLoaded && (
          <p className="mt-2 text-sm text-(--sub-text)">
            카카오맵을 로드하는 중...
          </p>
        )}
      </div>

      {/* 지도 영역 */}
      <div className="h-[40%] shrink-0 border-b">
        <div ref={mapRef} className="h-full w-full">
          {!isLoaded && (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <p className="text-sm text-(--sub-text)">지도를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>

      {/* 검색 결과 목록 */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isSearching && (
          <div className="flex items-center justify-center py-8">
            <p className="text-(--sub-text)">검색 중...</p>
          </div>
        )}

        {noResult && (
          <div className="flex items-center justify-center py-8">
            <p className="text-(--sub-text)">검색 결과가 없습니다.</p>
          </div>
        )}

        {results.length > 0 && (
          <ul>
            {results.map((place, index) => (
              <li key={place.id} className="border-b">
                <button
                  type="button"
                  onClick={() => handleListItemClick(place)}
                  className="flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-gray-50"
                >
                  {/* 번호 표시 */}
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-(--key-color) text-sm font-bold text-(--black)">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-(--black)">
                      {place.place_name}
                    </p>
                    <p className="mt-1 text-sm text-(--sub-text)">
                      {place.road_address_name || place.address_name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {place.category_name}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
