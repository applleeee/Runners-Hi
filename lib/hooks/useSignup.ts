"use client";

import { signUp } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (
    email: string,
    password: string,
    nickname: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      // 닉네임 검증
      if (!nickname) {
        throw new Error("닉네임을 입력해주세요.");
      }
      if (nickname.length < 2 || nickname.length > 20) {
        throw new Error("닉네임은 2~20자여야 합니다.");
      }
      if (!/^[가-힣a-zA-Z0-9_-]+$/.test(nickname)) {
        throw new Error("닉네임은 한글, 영문, 숫자, _, - 만 사용 가능합니다.");
      }

      // 이메일 검증
      if (!email) {
        throw new Error("이메일을 입력해주세요.");
      }

      // 비밀번호 검증
      if (!password) {
        throw new Error("비밀번호를 입력해주세요.");
      }
      if (password.length < 6) {
        throw new Error("비밀번호는 최소 6자 이상이어야 합니다.");
      }

      await signUp(email, password, nickname);

      // 회원가입 성공
      alert("회원가입이 완료되었습니다.");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleSignup, loading, error };
}
