import { PlaceResult } from "@/components/features/running/PlaceSearch";
import { getCurrentUser } from "@/lib/api/auth";
import {
  ContentType,
  createContent,
  getContentTypesByParentId,
} from "@/lib/api/content";
import { uploadImage } from "@/lib/api/storage";
import { GpxData } from "@/lib/utils/gpx-parser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type LocationType = "main" | "start" | "end";

export interface LocationState {
  main: PlaceResult | null;
  start: PlaceResult | null;
  end: PlaceResult | null;
}

export interface NewPostFormData {
  gpxData: GpxData | null;
  title: string;
  images: string[];
  memo: string;
  selectedTypeId: number | null;
  locations: LocationState;
  useMainForStart: boolean;
  useMainForEnd: boolean;
}

export function useNewPostForm() {
  const router = useRouter();

  // Form states
  const [gpxData, setGpxData] = useState<GpxData | null>(null);
  const [title, setTitle] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); // 실제 파일 저장
  const [memo, setMemo] = useState("");
  const [runningTypes, setRunningTypes] = useState<ContentType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Location states
  const [locations, setLocations] = useState<LocationState>({
    main: null,
    start: null,
    end: null,
  });
  const [useMainForStart, setUseMainForStart] = useState(true);
  const [useMainForEnd, setUseMainForEnd] = useState(true);
  const [isPlaceSearchOpen, setIsPlaceSearchOpen] = useState(false);
  const [currentLocationType, setCurrentLocationType] =
    useState<LocationType>("main");

  // ContentType 로드 (러닝 타입의 하위 타입들)
  useEffect(() => {
    const fetchRunningTypes = async () => {
      try {
        const data = await getContentTypesByParentId(1); // 러닝(id:1)의 하위 타입
        setRunningTypes(data);
        if (data.length > 0) {
          setSelectedTypeId(data[0].id);
        }
      } catch {
        // 에러 발생 시 빈 배열 유지
      }
    };

    fetchRunningTypes();
  }, []);

  // sessionStorage에서 GPX 데이터 로드
  useEffect(() => {
    const loadGpxData = () => {
      const stored = sessionStorage.getItem("gpxData");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.startTime = parsed.startTime
            ? new Date(parsed.startTime)
            : null;
          parsed.endTime = parsed.endTime ? new Date(parsed.endTime) : null;
          parsed.points = parsed.points.map(
            (p: {
              lat: number;
              lng: number;
              time?: string;
              elevation?: number;
            }) => ({
              ...p,
              time: p.time ? new Date(p.time) : undefined,
            })
          );
          return parsed;
        } catch {
          return null;
        }
      }
      return null;
    };

    const data = loadGpxData();
    if (data) {
      setGpxData(data);
    } else {
      router.replace("/posts/new");
    }
  }, [router]);

  // 폼 검증 함수
  const validateForm = (): boolean => {
    // 제목 미입력 검증
    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return false;
    }

    // 제목 길이 검증
    if (title.length > 30) {
      alert("30자 이내 등록 가능합니다.");
      return false;
    }

    // 대표위치 선택 검증
    if (!locations.main) {
      alert("대표위치를 선택해 주세요.");
      return false;
    }

    // 이미지 선택 검증
    if (images.length === 0) {
      alert("이미지를 1개 이상 선택해 주세요.");
      return false;
    }

    return true;
  };

  // 장소 검색 핸들러
  const handleOpenPlaceSearch = (type: LocationType) => {
    setCurrentLocationType(type);
    setIsPlaceSearchOpen(true);
  };

  const handleSelectPlace = (place: PlaceResult) => {
    setLocations((prev) => ({
      ...prev,
      [currentLocationType]: place,
    }));
    setIsPlaceSearchOpen(false);
  };

  // 제출 핸들러
  const handleSubmit = async (onSuccess?: () => void) => {
    // 폼 검증
    if (!validateForm()) {
      return;
    }
    console.log(gpxData, selectedTypeId, locations.main);

    if (!gpxData || !selectedTypeId || !locations.main) {
      alert("러닝 기록 등록에 실패했습니다. 다시 시도해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("sdfsdfgsdgsdg");
      // 1. 현재 로그인한 사용자 확인
      const user = await getCurrentUser();
      if (!user) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      // 2. 이미지 업로드
      const uploadedImageUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await uploadImage(file, user.id);
        uploadedImageUrls.push(url);
      }

      // 3. 콘텐츠 생성
      await createContent({
        userId: user.id,
        title,
        typeId: selectedTypeId,
        mainLocation: locations.main,
        startLocation: useMainForStart ? locations.main : locations.start,
        endLocation: useMainForEnd ? locations.main : locations.end,
        gpxData,
        imageUrls: uploadedImageUrls,
        comment: memo,
      });

      // 4. 성공 처리
      sessionStorage.removeItem("gpxData");

      // 성공 콜백 실행 (토스트 표시)
      if (onSuccess) {
        onSuccess();
      }

      // 페이지 이동
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("콘텐츠 저장 실패:", error);
      alert("러닝 기록 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 닫기 핸들러
  const handleClose = () => {
    sessionStorage.removeItem("gpxData");
    router.push("/");
  };

  // 이미지 변경 핸들러 (파일도 함께 저장)
  const handleImagesChange = (newImages: string[], files?: File[]) => {
    setImages(newImages);
    if (files) {
      setImageFiles(files);
    }
  };

  return {
    // States
    gpxData,
    title,
    setTitle,
    images,
    setImages: handleImagesChange,
    memo,
    setMemo,
    runningTypes,
    selectedTypeId,
    setSelectedTypeId,
    locations,
    useMainForStart,
    setUseMainForStart,
    useMainForEnd,
    setUseMainForEnd,
    isPlaceSearchOpen,
    setIsPlaceSearchOpen,
    isSubmitting,

    // Handlers
    handleOpenPlaceSearch,
    handleSelectPlace,
    handleSubmit,
    handleClose,
  };
}
