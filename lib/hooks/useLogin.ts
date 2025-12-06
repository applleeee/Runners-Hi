"use client";

import { signIn } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // 이메일 형식 검증
      const emailSchema = z.email({ message: "이메일 형식이 맞지 않습니다." });
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        throw new Error(emailResult.error.issues[0].message);
      }

      // 비밀번호 검증
      if (!password) {
        throw new Error("비밀번호를 입력해주세요.");
      }

      await signIn(email, password);

      // 로그인 성공
      router.push("/");
      router.refresh();
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

  return { handleLogin, loading, error };
}
