"use client";

import { signUp } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // 이메일 검증
      const emailSchema = z.string().email({ message: "이메일 형식이 맞지 않습니다." });
      const emailResult = emailSchema.safeParse(email);
      if (!emailResult.success) {
        alert(emailResult.error.issues[0].message);
        setLoading(false);
        return;
      }

      // 비밀번호 검증
      const passwordSchema = z
        .string()
        .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." });
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        alert(passwordResult.error.issues[0].message);
        setLoading(false);
        return;
      }

      await signUp(email, password);

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
