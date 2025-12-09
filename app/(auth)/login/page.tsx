"use client";

import { BottomButton } from "@/components/common/BottomButton";
import { Header } from "@/components/common/Header";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { Input } from "@/components/ui/input";
import { sendPasswordResetEmail } from "@/lib/api/auth";
import { useLogin } from "@/lib/hooks/useLogin";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin, loading, error } = useLogin();

  // 필수값 검증: 이메일과 비밀번호가 모두 입력되어야 활성화
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    await handleLogin(email, password);
  };

  const handlePasswordReset = async () => {
    try {
      // Zod를 사용한 이메일 검증
      const emailSchema = z.email({ message: "이메일 형식이 맞지 않습니다." });
      const emailResult = emailSchema.safeParse(email);

      if (!emailResult.success) {
        alert(emailResult.error.issues[0].message);
        return;
      }

      await sendPasswordResetEmail(email);
      alert("비밀번호 재설정 이메일을 발송했습니다.\n메일함을 확인해주세요.");
    } catch (err) {
      alert("메일 발송에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-(--bg)">
      <Header variant="back" title="로그인" />

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center px-4">
          {/* Logo Section */}
          <div className="mb-10 flex flex-col items-center justify-center space-y-1">
            <p className="text-xs font-semibold text-(--sub-text)">
              당신의 러닝의 일상으로
            </p>
            <h2 className="text-xl font-bold text-(--black)">
              Runner&apos;s Hi
            </h2>
          </div>

          {/* Form Inputs */}
          <div className="space-y-3">
            <Input
              id="email"
              type="email"
              placeholder="이메일 아이디 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 border-none bg-white px-3 text-center text-sm placeholder:text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl"
            />

            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-12 border-none bg-white px-3 text-center text-sm placeholder:text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl"
            />

            {/* 에러 메시지 */}
            {error && (
              <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-800">
                이메일 또는 비밀번호가 올바르지 않습니다.
              </div>
            )}

            {/* 비밀번호 재설정 영역 - 회색 박스 */}
            <div className="mt-4 mx-2 rounded-lg bg-[#E9E9E9] py-2 text-center">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="text-xs text-(--black) underline cursor-pointer"
              >
                비밀번호 재설정 메일 발송 &gt;
              </button>
              <p className="mt-2 text-[12px] text-(--sub-text)">
                입력한 이메일로 비밀번호 재설정 메일이 발송됩니다.
              </p>
              <p className="text-[12px] text-(--sub-text)">
                (가입된 이메일 아이디가 아니라면 발송되지 않습니다.)
              </p>
            </div>
          </div>

          {/* Password Reset Info */}
          <div className="mt-8 space-y-0.5 text-center text-xs font-bold">
            <p>로그인에 문제가 있다면</p>
            <p className="pt-2 font-bold">runnershiho21@gmail.com</p>
          </div>

          {/* 회원가입 버튼 */}
          <div className="mt-16 flex justify-center">
            <Link href="/signup">
              <PrimaryButton>러너스 하이 회원가입 &gt;</PrimaryButton>
            </Link>
          </div>
        </div>

        {/* Submit Button - Fixed at Bottom */}
        <form onSubmit={onSubmit}>
          <BottomButton
            type="submit"
            disabled={loading || !isFormValid}
            variant={isFormValid ? "primary" : "unselect"}
          >
            {loading ? "처리중..." : "로그인"}
          </BottomButton>
        </form>
      </main>
    </div>
  );
}
