"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

interface PostImagesProps {
  images: string[];
}

export function PostImages({ images }: PostImagesProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);

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
