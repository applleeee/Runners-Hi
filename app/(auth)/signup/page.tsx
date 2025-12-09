"use client";

import { BottomButton } from "@/components/common/BottomButton";
import { Header } from "@/components/common/Header";
import { Input } from "@/components/ui/input";
import { useSignup } from "@/lib/hooks/useSignup";
import { useState } from "react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleSignup, loading, error } = useSignup();

  // 필수값 검증: 이메일과 비밀번호가 모두 입력되어야 활성화
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    await handleSignup(email, password);
  };

  return (
    <div className="flex flex-1 flex-col bg-(--bg)">
      <Header variant="back" title="회원가입" />

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

            {error && (
              <div className="rounded-md bg-red-50 p-2.5 text-xs text-red-800">
                {error}
              </div>
            )}
          </div>

          {/* Info Text */}
          <div className="mt-6 space-y-0.5 text-center text-xs text-(--sub-text)">
            <p>러너스하이에 회원가입하여</p>
            <p>당신의 러닝을 일상에 기록해 보세요.</p>
          </div>
        </div>

        {/* Submit Button - Fixed at Bottom */}
        <form onSubmit={onSubmit}>
          <BottomButton
            type="submit"
            disabled={loading || !isFormValid}
            variant={isFormValid ? "primary" : "unselect"}
          >
            {loading ? "처리중..." : "회원가입"}
          </BottomButton>
        </form>
      </main>
    </div>
  );
}
