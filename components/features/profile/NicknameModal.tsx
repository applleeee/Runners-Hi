"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface NicknameModalProps {
  currentNickname: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nickname: string) => Promise<void>;
}

export function NicknameModal({
  currentNickname,
  isOpen,
  onClose,
  onSubmit,
}: NicknameModalProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 앞뒤 공백 제거
    const trimmedNickname = nickname.trim();

    if (!trimmedNickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    if (trimmedNickname === currentNickname) {
      alert("현재 닉네임과 동일합니다.");
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      alert("닉네임은 2~20자 이내로 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(trimmedNickname);
      onClose();
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm" showCloseButton={false}>
        <DialogHeader className="bg-(--sub-color) -mx-6 -mt-6 px-6 py-3 rounded-t-lg">
          <DialogTitle className="text-base font-bold text-(--black)">
            닉네임 변경
          </DialogTitle>
        </DialogHeader>

        {/* 입력 필드 */}
        <div>
          <div className="flex justify-center">
            <label className="mb-2 block text-xs font-bold text-(--black)">
              변경할 닉네임을 입력해 주세요.
            </label>
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="2~20자 이내로 입력해주세요"
            className="w-full rounded-lg px-3 py-2.5 text-sm text-(--black) placeholder:text-(--unselect) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] focus:outline-none"
            disabled={loading}
            maxLength={20}
          />
          <p className="mt-1.5 text-xs text-(--sub-text)">
            {nickname.length}/20자
          </p>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-lg bg-(--unselect) py-2.5 text-sm font-semibold text-white"
            disabled={loading}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 cursor-pointer rounded-lg bg-(--key-color) py-2.5 text-sm font-semibold text-(--black) disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "변경 중..." : "변경"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
