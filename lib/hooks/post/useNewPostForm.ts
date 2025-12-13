import { PlaceResult } from "@/components/features/running/PlaceSearch";
import { getCurrentUser } from "@/lib/api/auth";
import {
  ContentType,
  createContent,
  getContentById,
  getContentTypesByParentId,
  updateContent,
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

export function useNewPostForm(contentId?: string) {
  const router = useRouter();

  // 수정 모드 여부
  const isEditMode = !!contentId;

  // Form states
  const [gpxData, setGpxData] = useState<GpxData | null>(null);
  const [title, setTitle] = useState("");
  const [memo, setMemo] = useState("");
  const [runningTypes, setRunningTypes] = useState<ContentType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  // 이미지 관리 (기존 URL과 새 파일 분리)
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  // 표시용 이미지 배열 (기존 URL + 새 미리보기)
  const images = [...existingImageUrls, ...newImagePreviews];

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
        // 수정 모드가 아닐 때만 첫 번째 타입을 기본값으로 설정
        if (data.length > 0 && !isEditMode) {
          setSelectedTypeId(data[0].id);
        }
      } catch {
        // 에러 발생 시 빈 배열 유지
      }
    };

    fetchRunningTypes();
  }, [isEditMode]);

  // 수정 모드: 기존 데이터 로드
  useEffect(() => {
    if (!contentId) return;

    const fetchContent = async () => {
      try {
        setIsLoading(true);
        const content = await getContentById(contentId);

        // GPX 데이터 설정
        setGpxData(content.gpxData);

        // 폼 데이터 설정
        setTitle(content.title);
        setMemo(content.comment || "");
        setSelectedTypeId(content.typeId);
        setExistingImageUrls(content.imageUrls);

        // Location 변환 (Location -> PlaceResult)
        const mainPlace: PlaceResult = {
          placeName: content.mainLocation.name,
          address: content.mainLocation.address || "",
          lat: content.mainLocation.lat || 0,
          lng: content.mainLocation.lng || 0,
          kakaoPlaceId: content.mainLocation.kakaoPlaceId || null,
        };

        const startPlace: PlaceResult | null = content.startLocation
          ? {
              placeName: content.startLocation.name,
              address: content.startLocation.address || "",
              lat: content.startLocation.lat || 0,
              lng: content.startLocation.lng || 0,
              kakaoPlaceId: content.startLocation.kakaoPlaceId || null,
            }
          : null;

        const endPlace: PlaceResult | null = content.endLocation
          ? {
              placeName: content.endLocation.name,
              address: content.endLocation.address || "",
              lat: content.endLocation.lat || 0,
              lng: content.endLocation.lng || 0,
              kakaoPlaceId: content.endLocation.kakaoPlaceId || null,
            }
          : null;

        setLocations({
          main: mainPlace,
          start: startPlace,
          end: endPlace,
        });

        // useMainForStart/End 계산
        const isSameLocation = (a: PlaceResult | null, b: PlaceResult | null) => {
          if (!a || !b) return false;
          return a.kakaoPlaceId
            ? a.kakaoPlaceId === b.kakaoPlaceId
            : a.placeName === b.placeName;
        };

        setUseMainForStart(isSameLocation(mainPlace, startPlace));
        setUseMainForEnd(isSameLocation(mainPlace, endPlace));
      } catch (error) {
        console.error("콘텐츠 로드 실패:", error);
        alert("콘텐츠를 불러오는데 실패했습니다.");
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [contentId, router]);

  // 등록 모드: sessionStorage에서 GPX 데이터 로드
  useEffect(() => {
    if (isEditMode) return; // 수정 모드면 스킵

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
  }, [router, isEditMode]);

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

    if (!gpxData || !selectedTypeId || !locations.main) {
      alert(
        isEditMode
          ? "러닝 기록 수정에 실패했습니다. 다시 시도해주세요."
          : "러닝 기록 등록에 실패했습니다. 다시 시도해주세요."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 현재 로그인한 사용자 확인
      const user = await getCurrentUser();
      if (!user) {
        alert("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      // 2. 새 이미지 업로드 (병렬 처리)
      const uploadedNewImageUrls = await Promise.all(
        newImageFiles.map((file) => uploadImage(file, user.id))
      );

      // 3. 최종 이미지 URL 배열 (기존 URL + 새로 업로드된 URL)
      const finalImageUrls = [...existingImageUrls, ...uploadedNewImageUrls];

      if (isEditMode && contentId) {
        // 수정 모드
        await updateContent({
          contentId,
          title,
          typeId: selectedTypeId,
          mainLocation: locations.main,
          startLocation: useMainForStart ? locations.main : locations.start,
          endLocation: useMainForEnd ? locations.main : locations.end,
          imageUrls: finalImageUrls,
          comment: memo,
        });
      } else {
        // 등록 모드
        await createContent({
          userId: user.id,
          title,
          typeId: selectedTypeId,
          mainLocation: locations.main,
          startLocation: useMainForStart ? locations.main : locations.start,
          endLocation: useMainForEnd ? locations.main : locations.end,
          gpxData,
          imageUrls: finalImageUrls,
          comment: memo,
        });

        // 등록 모드에서만 sessionStorage 정리
        sessionStorage.removeItem("gpxData");
      }

      // 성공 콜백 실행 (토스트 표시)
      if (onSuccess) {
        onSuccess();
      }

      // 페이지 이동
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error(isEditMode ? "콘텐츠 수정 실패:" : "콘텐츠 저장 실패:", error);
      alert(
        isEditMode
          ? "러닝 기록 수정에 실패했습니다. 다시 시도해주세요."
          : "러닝 기록 등록에 실패했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 닫기 핸들러
  const handleClose = () => {
    if (!isEditMode) {
      sessionStorage.removeItem("gpxData");
    }
    router.push("/");
  };

  // 이미지 변경 핸들러 (기존 URL과 새 파일 분리 관리)
  const handleImagesChange = (newImages: string[], files?: File[]) => {
    // 기존 URL 개수
    const existingCount = existingImageUrls.length;

    // 새로운 이미지 배열에서 기존 URL과 새 미리보기 분리
    const newExistingUrls = newImages.slice(0, existingCount).filter((url) =>
      existingImageUrls.includes(url)
    );
    const newPreviews = newImages.slice(existingCount);

    setExistingImageUrls(newExistingUrls);
    setNewImagePreviews(newPreviews);

    if (files) {
      // files 배열은 새로 추가된 파일들만 포함
      // 삭제된 이미지에 해당하는 파일도 제거
      const deletedPreviewCount = newImagePreviews.length - newPreviews.length;
      if (deletedPreviewCount > 0) {
        setNewImageFiles((prev) => prev.slice(0, prev.length - deletedPreviewCount));
      } else if (files.length > newImageFiles.length) {
        // 새 파일이 추가된 경우
        setNewImageFiles(files);
      }
    }
  };

  // 이미지 삭제 핸들러 (인덱스 기반)
  const handleRemoveImage = (index: number) => {
    const existingCount = existingImageUrls.length;

    if (index < existingCount) {
      // 기존 URL 삭제
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 새 이미지 삭제
      const newIndex = index - existingCount;
      setNewImagePreviews((prev) => prev.filter((_, i) => i !== newIndex));
      setNewImageFiles((prev) => prev.filter((_, i) => i !== newIndex));
    }
  };

  // 새 이미지 추가 핸들러
  const handleAddImages = (previews: string[], files: File[]) => {
    setNewImagePreviews((prev) => [...prev, ...previews]);
    setNewImageFiles((prev) => [...prev, ...files]);
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
    isLoading,
    isEditMode,

    // Image handlers
    existingImageUrls,
    newImageFiles,
    handleRemoveImage,
    handleAddImages,

    // Handlers
    handleOpenPlaceSearch,
    handleSelectPlace,
    handleSubmit,
    handleClose,
  };
}
