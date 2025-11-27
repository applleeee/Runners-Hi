"use client";

import { updateNickname } from "@/lib/api/profile";
import { useState } from "react";

export function useNicknameChange() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeNickname = async (nickname: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await updateNickname(nickname);
      alert("닉네임이 변경되었습니다.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        alert(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
        alert("알 수 없는 오류가 발생했습니다.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changeNickname, loading, error };
}
