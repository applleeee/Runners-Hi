"use client";

import { BottomButton } from "@/components/common/BottomButton";
import { Header } from "@/components/common/Header";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createClient();

  const isFormValid = newPassword.length >= 6;

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert("비밀번호가 변경되었습니다.");
      router.push("/");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("비밀번호 변경에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--bg)">
      <Header variant="back" title="비밀번호 재설정" />

      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center px-4">
          {/* Logo Section */}
          <div className="mb-10 flex flex-col items-center justify-center space-y-1">
            <h2 className="text-xl font-bold text-(--black)">
              비밀번호 재설정
            </h2>
            <p className="text-xs text-(--sub-text)">
              로그인 시 사용할 비밀번호를 재설정 하세요.
            </p>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12 border-none bg-white px-3 text-center text-sm placeholder:text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl"
            />

            {error && (
              <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-800">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button - Fixed at Bottom */}
        <form onSubmit={handleResetPassword}>
          <BottomButton
            type="submit"
            disabled={loading || !isFormValid}
            variant={isFormValid ? "primary" : "unselect"}
          >
            {loading ? "처리중..." : "비밀번호 재설정"}
          </BottomButton>
        </form>
      </main>
    </div>
  );
}
