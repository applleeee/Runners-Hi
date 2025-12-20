"use client";

import { signOut, updatePassword } from "@/lib/api/auth";
import { AuthApiError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleResetPassword = async (password: string) => {
    setLoading(true);
    setError(null);

    try {
      // 비밀번호 검증
      const passwordSchema = z
        .string()
        .min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." });
      const result = passwordSchema.safeParse(password);

      if (!result.success) {
        throw new Error(result.error.issues[0].message);
      }

      await updatePassword(password);

      alert("비밀번호가 재설정 되었습니다.");

      await signOut();
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        if (err.code === "same_password") {
          // 동일 비밀번호도 허용 - 에러 대신 성공 처리
          alert("비밀번호가 재설정 되었습니다.");
          await signOut();
          router.push("/login");
          return;
        } else {
          setError("비밀번호 변경에 실패했습니다.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleResetPassword, loading, error };
}
