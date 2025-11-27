"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { PresetImageGrid } from "./PresetImageGrid";

interface ProfileImagePresetModalProps {
  currentImageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string) => Promise<void>;
}

export function ProfileImagePresetModal({
  currentImageUrl,
  isOpen,
  onClose,
  onSubmit,
}: ProfileImagePresetModalProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
    currentImageUrl
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedImageUrl) {
      alert("프로필 이미지를 선택해주세요.");
      return;
    }

    if (selectedImageUrl === currentImageUrl) {
      alert("현재 프로필 이미지와 동일합니다.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedImageUrl);
      // Parent handles closing
    } catch (error) {
      console.error("프로필 이미지 변경 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setSelectedImageUrl(currentImageUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm max-h-[80vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader className="bg-(--sub-color) -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
          <DialogTitle className="text-base font-bold text-(--black)">
            캐릭터 이미지 선택
          </DialogTitle>
        </DialogHeader>

        {/* 프리셋 이미지 그리드 */}
        <div className="py-3">
          <PresetImageGrid
            selectedImageUrl={selectedImageUrl}
            onSelect={setSelectedImageUrl}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 cursor-pointer rounded-lg bg-(--unselect) py-2.5 text-sm font-semibold text-white"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 cursor-pointer rounded-lg bg-(--key-color) py-2.5 text-sm font-semibold text-(--black) disabled:opacity-50"
            disabled={loading || !selectedImageUrl}
          >
            {loading ? "변경 중..." : "변경"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
