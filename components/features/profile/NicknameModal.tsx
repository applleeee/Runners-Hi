"use client";

import { Modal } from "@/components/common/Modal";
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header="닉네임 변경"
      confirmText="변경"
      onConfirm={handleSubmit}
      isLoading={loading}
    >
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
        className="w-full rounded-lg px-3 py-2.5 text-sm text-(--black) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] placeholder:text-(--unselect) focus:outline-none"
        disabled={loading}
        maxLength={20}
      />
      <p className="mt-1.5 text-xs text-(--sub-text)">{nickname.length}/20자</p>
    </Modal>
  );
}
