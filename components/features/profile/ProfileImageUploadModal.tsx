"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ProfileImageUploadModalProps {
  currentImageUrl: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<void>;
}

export function ProfileImageUploadModal({
  currentImageUrl,
  isOpen,
  onClose,
  onSubmit,
}: ProfileImageUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      alert("JPG, PNG 형식의 이미지만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    setUploadedFile(file);
  };

  const handleSubmit = async () => {
    if (!uploadedFile) {
      alert("이미지를 선택해주세요.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(uploadedFile);
      // Parent handles closing
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset state when modal closes
  const handleClose = () => {
    setUploadedFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm" showCloseButton={false}>
        <DialogHeader className="bg-(--sub-color) -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
          <DialogTitle className="text-base font-bold text-(--black)">
            내 사진 업로드
          </DialogTitle>
        </DialogHeader>

        {/* 파일 업로드 영역 */}
        <div className="py-3">
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            onChange={handleFileChange}
            className="hidden"
            id="profile-image-upload"
            disabled={loading}
          />
          <label
            htmlFor="profile-image-upload"
            className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-(--unselect) bg-white px-3 py-6 text-center hover:border-(--key-color) hover:bg-(--sub-color) transition-colors"
          >
            <div className="flex flex-col items-center gap-1.5">
              <svg
                className="h-10 w-10 text-(--sub-text)"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-xs font-medium text-(--sub-text)">
                {uploadedFile ? uploadedFile.name : "이미지 선택 (JPG, PNG)"}
              </span>
            </div>
          </label>

          {/* 미리보기 */}
          {uploadedFile && (
            <div className="mt-3 flex justify-center">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-(--key-color) bg-white">
                <img
                  src={URL.createObjectURL(uploadedFile)}
                  alt="미리보기"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-lg bg-(--unselect) py-2.5 text-sm font-semibold text-white"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-(--key-color) py-2.5 text-sm font-semibold text-(--black) disabled:opacity-50"
            disabled={loading || !uploadedFile}
          >
            {loading ? "업로드 중..." : "변경"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
