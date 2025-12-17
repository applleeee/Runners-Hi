"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ContentDetail } from "@/lib/api/content";
import { Download } from "lucide-react";

interface PostImagesProps {
  images: string[];
  isOwner?: boolean;
  content?: ContentDetail;
}

export function PostImages({ images, isOwner, content }: PostImagesProps) {
  const router = useRouter();
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 다운로드 버튼 클릭 핸들러 - 다운로드 페이지로 이동
  const handleDownloadClick = (imageUrl: string) => {
    if (!content) return;
    router.push(
      `/posts/${content.id}/download?image=${encodeURIComponent(imageUrl)}`
    );
  };

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

  const handleDotClick = (index: number) => {
    api?.scrollTo(index);
  };

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* 캐러셀 슬라이더 */}
      <Carousel
        opts={{
          align: "center",
          loop: images.length > 1,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index} className="basis-[85%]">
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-(--bg) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
                <Image
                  src={image}
                  alt={`사진 ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {/* 다운로드 버튼 - 본인 게시물만 표시 */}
                {isOwner && content && (
                  <button
                    type="button"
                    onClick={() => handleDownloadClick(image)}
                    className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    aria-label="이미지 다운로드"
                  >
                    <Download size={18} />
                  </button>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot 인디케이터 - 2장 이상일 때만 표시 */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {images.map((_, index) => (
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
