"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Camera, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[], files?: File[]) => void;
  maxImages?: number;
}

export function ImageUploader({
  images,
  onImagesChange,
  maxImages = 10,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [files, setFiles] = useState<File[]>([]); // 실제 파일 저장

  useEffect(() => {
    if (!api) return;

    const handleSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", handleSelect);
    api.on("reInit", handleSelect);

    return () => {
      api.off("select", handleSelect);
      api.off("reInit", handleSelect);
    };
  }, [api]);

  const handleFileSelect = () => {
    // 이미 최대 개수에 도달했으면 alert
    if (images.length >= maxImages) {
      alert("이미지는 10개까지 선택 가능합니다.");
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    // 최대 개수 체크
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      alert(`최대 ${maxImages}장까지 등록 가능합니다.`);
      e.target.value = "";
      return;
    }

    // 파일 검증
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of selectedFiles) {
      // 파일 타입 검증
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: JPG, PNG 형식만 업로드 가능합니다.`);
        continue;
      }

      // 파일 크기 검증
      if (file.size > maxSize) {
        errors.push(
          `${file.name}: 파일 크기는 10MB 이하여야 합니다. (현재: ${(
            file.size /
            1024 /
            1024
          ).toFixed(1)}MB)`
        );
        continue;
      }

      validFiles.push(file);
    }

    // 에러 메시지 표시
    if (errors.length > 0) {
      alert(errors.join("\n"));
    }

    // 유효한 파일이 없으면 종료
    if (validFiles.length === 0) {
      e.target.value = "";
      return;
    }

    // 남은 슬롯만큼만 추가
    const filesToAdd = validFiles.slice(0, remainingSlots);

    // 선택한 파일이 남은 슬롯보다 많으면 alert
    if (validFiles.length > remainingSlots) {
      alert("이미지는 10개까지 선택 가능합니다.");
      return;
    }

    // 파일을 임시 URL로 변환 (실제 업로드는 submit 시)
    const newImageUrls = filesToAdd.map((file) => URL.createObjectURL(file));
    const newFiles = [...files, ...filesToAdd];

    setFiles(newFiles);
    onImagesChange([...images, ...newImageUrls], newFiles);

    // input 초기화
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newFiles = files.filter((_, i) => i !== index);

    setFiles(newFiles);
    onImagesChange(newImages, newFiles);

    // 현재 보고 있는 이미지가 삭제되면 인덱스 조정
    if (currentIndex >= newImages.length && newImages.length > 0) {
      setCurrentIndex(newImages.length - 1);
      api?.scrollTo(newImages.length - 1);
    } else if (newImages.length === 0) {
      setCurrentIndex(0);
    }
  };

  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
  };

  // 총 아이템 개수 계산 (추가 카드 항상 표시)
  const totalItems = images.length + 1;

  return (
    <div className="space-y-3">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 이미지 안내 텍스트 */}
      <p className="text-center text-xs font-medium text-(--black)">
        러닝 기록에 이미지를 1장 이상 등록해주세요 (최대 {maxImages}장)
      </p>

      {/* 이미지 프리뷰 영역 - 항상 캐러셀 사용 */}
      <Carousel
        opts={{
          align: "center",
          loop: totalItems > 1,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent
          className={totalItems === 1 ? "ml-0 justify-center" : ""}
        >
          {/* 업로드된 이미지들 */}
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-[85%]">
              <div className="relative aspect-square overflow-hidden rounded-3xl border border-dashed border-(--unselect) bg-background">
                <Image
                  src={image}
                  alt={`업로드 이미지 ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* 삭제 버튼 */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </CarouselItem>
          ))}

          {/* 이미지 추가 카드 (항상 표시, 클릭 시 최대 개수 체크) */}
          <CarouselItem className="basis-[85%]">
            <div className="relative aspect-square overflow-hidden rounded-3xl border border-dashed border-(--unselect) bg-background">
              <button
                type="button"
                onClick={handleFileSelect}
                className="flex h-full w-full flex-col items-center justify-center gap-3 text-(--sub-text) transition-colors hover:text-(--black)"
              >
                <Camera className="h-12 w-12" />
              </button>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      {/* Dot 인디케이터 - 총 아이템 2개 이상일 때만 표시 */}
      {totalItems > 1 && (
        <div className="flex justify-center gap-1.5">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleDotClick(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-(--key-color)" : "bg-(--unselect)"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
