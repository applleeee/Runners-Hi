"use client";

import { signIn } from "@/lib/api/auth";
import { AuthApiError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);

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
      if (err instanceof AuthApiError) {
        if (err.code === "invalid_credentials") {
          // 정상적인 로그인 실패 (이메일/비밀번호 불일치)
          alert("이메일 또는 비밀번호가 맞지 않습니다. 다시 확인해 주세요.");
        } else {
          // 기타 Auth API 에러 (서버 이슈 등)
          alert("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
      } else if (err instanceof Error) {
        // 클라이언트 측 검증 에러 (Zod 등)
        alert(err.message);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading };
}
