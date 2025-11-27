"use client";

import { ProfileImage } from "@/components/common/ProfileImage";
import { createClient } from "@/lib/supabase/client";

interface PresetImageGridProps {
  selectedImageUrl: string | null;
  onSelect: (imageUrl: string) => void;
}

// preset 폴더의 이미지 15개 (profile image_1.png ~ profile image_15.png)
const PRESET_IMAGE_COUNT = 15;

export function PresetImageGrid({
  selectedImageUrl,
  onSelect,
}: PresetImageGridProps) {
  const supabase = createClient();

  const getPresetImageUrl = (index: number): string => {
    const fileName = `profile image_${index}.png`;
    const { data } = supabase.storage
      .from("profile-images")
      .getPublicUrl(`preset/${fileName}`);
    return data.publicUrl;
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: PRESET_IMAGE_COUNT }, (_, i) => i + 1).map(
        (index) => {
          const imageUrl = getPresetImageUrl(index);
          const isSelected = selectedImageUrl === imageUrl;

          return (
            <button
              key={index}
              type="button"
              onClick={() => onSelect(imageUrl)}
              className="relative aspect-square"
            >
              <ProfileImage
                src={imageUrl}
                alt={`프로필 이미지 ${index}`}
                className={`w-full! h-full! transition-all ${
                  isSelected
                    ? "border-(--key-color)! ring-2 ring-(--key-color) ring-offset-2"
                    : "hover:border-(--key-color)!"
                }`}
                isPreset
              />
              {isSelected && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                  <div className="h-6 w-6 rounded-full bg-(--key-color) flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        }
      )}
    </div>
  );
}
