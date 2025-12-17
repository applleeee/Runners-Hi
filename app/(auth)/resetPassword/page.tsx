"use client";

import { BottomButton } from "@/components/common/BottomButton";
import { Header } from "@/components/common/Header";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/lib/hooks/useResetPassword";
import { useVerifyRecoveryToken } from "@/lib/hooks/useVerifyRecoveryToken";
import { Suspense, useState } from "react";

function ResetPasswordContent() {
  const [newPassword, setNewPassword] = useState("");

  const {
    isVerified,
    isVerifying,
    error: verifyError,
  } = useVerifyRecoveryToken();

  const { handleResetPassword, loading, error } = useResetPassword();

  const isFormValid = newPassword.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    await handleResetPassword(newPassword);
  };

  // 검증 중일 때 로딩 표시
  if (isVerifying) {
    return (
      <div className="flex flex-1 flex-col bg-(--bg)">
        <Header variant="back" title="비밀번호 재설정" />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-sm text-(--sub-text)">확인 중...</p>
        </main>
      </div>
    );
  }

  // 검증 실패 시 에러 표시
  if (verifyError || !isVerified) {
    return (
      <div className="flex flex-1 flex-col bg-(--bg)">
        <Header variant="back" title="비밀번호 재설정" />
        <main className="flex flex-1 flex-col items-center justify-center px-4">
          <p className="text-sm text-red-600">{verifyError}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-(--bg)">
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
        <form onSubmit={handleSubmit}>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center">
          로딩 중...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
