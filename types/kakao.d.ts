declare namespace kakao.maps {
  class Map {
    constructor(container: HTMLElement, options: MapOptions);
    setCenter(latlng: LatLng): void;
    setBounds(bounds: LatLngBounds): void;
    getCenter(): LatLng;
    getLevel(): number;
    setLevel(level: number): void;
  }

  interface MapOptions {
    center: LatLng;
    level?: number;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    getLat(): number;
    getLng(): number;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
  }

  interface PolylineOptions {
    map?: Map;
    path: LatLng[];
    strokeWeight?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeStyle?: string;
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
  }

  interface MarkerOptions {
    map?: Map;
    position: LatLng;
    image?: MarkerImage;
  }

  class MarkerImage {
    constructor(
      src: string,
      size: Size,
      options?: { offset?: Point; alt?: string }
    );
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Point {
    constructor(x: number, y: number);
  }

  function load(callback: () => void): void;

  // 이벤트 관련
  namespace event {
    function addListener(
      target: object,
      type: string,
      callback: () => void
    ): void;
    function removeListener(
      target: object,
      type: string,
      callback: () => void
    ): void;
  }

  // Places API (services 라이브러리 필요)
  namespace services {
    type PlacesSearchStatus = "OK" | "ZERO_RESULT" | "ERROR";

    interface PlaceSearchResult {
      id: string;
      place_name: string;
      category_name: string;
      category_group_code: string;
      category_group_name: string;
      phone: string;
      address_name: string;
      road_address_name: string;
      x: string; // longitude
      y: string; // latitude
      place_url: string;
      distance: string;
    }

    interface Pagination {
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      current: number;
      gotoPage(page: number): void;
      gotoFirst(): void;
      gotoLast(): void;
      nextPage(): void;
      prevPage(): void;
    }

    type PlacesSearchCallback = (
      result: PlaceSearchResult[],
      status: PlacesSearchStatus,
      pagination: Pagination
    ) => void;

    class Places {
      constructor();
      keywordSearch(
        keyword: string,
        callback: PlacesSearchCallback,
        options?: {
          category_group_code?: string;
          x?: number;
          y?: number;
          radius?: number;
          rect?: string;
          page?: number;
          size?: number;
          sort?: "accuracy" | "distance";
        }
      ): void;
    }
  }
}

interface Window {
  kakao: typeof kakao;
}
