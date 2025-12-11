"use client";

import { signOut } from "@/lib/api/auth";
import { AuthApiError } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function useLogout() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);

    try {
      await signOut();

      // 로그아웃 성공
      router.push("/login");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof AuthApiError) {
        alert("로그아웃 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return { handleLogout, loading };
}
