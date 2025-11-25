"use client";

import Image from "next/image";
import { useState } from "react";

interface PostImagesProps {
  images: string[];
}

export function PostImages({ images }: PostImagesProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* 이미지 슬라이더 */}
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-(--bg) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)]">
        <div
          className="flex h-full transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div key={index} className="relative h-full min-w-full">
              <Image
                src={image}
                alt={`사진 ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot 인디케이터 */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5">
          {images.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
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
