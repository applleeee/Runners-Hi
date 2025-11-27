"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";

interface ProfileImageSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUpload: () => void;
  onSelectPreset: () => void;
}

export function ProfileImageSelectionModal({
  isOpen,
  onClose,
  onSelectUpload,
  onSelectPreset,
}: ProfileImageSelectionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="w-[calc(100%-2rem)] max-w-sm"
        showCloseButton={false}
      >
        <DialogHeader className="bg-(--sub-color) -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
          <DialogTitle className="text-base font-bold text-(--black)">
            프로필 이미지 변경
          </DialogTitle>
        </DialogHeader>

        {/* 질문 텍스트 */}
        <div className="pt-3 pb-1">
          <p className="text-center text-sm font-bold text-(--black)">
            프로필 이미지를 어떻게 변경할까요?
          </p>
        </div>

        {/* 선택 버튼들 */}
        <div className="flex flex-col gap-3 pb-3">
          <button
            onClick={onSelectPreset}
            className="flex cursor-pointer items-center justify-between rounded-2xl bg-(--key-color) px-4 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90"
          >
            <span className="text-sm font-semibold text-(--black)">
              캐릭터 이미지에서 선택
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-(--black)" />
          </button>

          <button
            onClick={onSelectUpload}
            className="flex cursor-pointer items-center justify-between rounded-2xl bg-(--key-color) px-4 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] transition-opacity hover:opacity-90"
          >
            <span className="text-sm font-semibold text-(--black)">
              내 사진에서 선택
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-(--black)" />
          </button>
        </div>

        {/* 취소 버튼 */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded-lg bg-(--unselect) py-2.5 text-sm font-semibold text-white"
          >
            취소
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
