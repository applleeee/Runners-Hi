"use client";

import { BottomButton } from "@/components/common/BottomButton";
import { Header } from "@/components/common/Header";
import { Input } from "@/components/ui/input";
import { useLogin } from "@/lib/hooks/useLogin";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { handleLogin, loading, error } = useLogin();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleLogin(email, password);
  };

  return (
    <div className="flex min-h-screen flex-col bg-(--bg)">
      <Header variant="back" title="로그인" />

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center px-6">
          {/* Logo Section */}
          <div className="mb-12 flex flex-col items-center justify-center space-y-2">
            <p className="text-sm font-semibold text-(--sub-text)">
              당신의 러닝의 일상으로
            </p>
            <h2 className="text-2xl font-bold text-(--black)">
              Runner&apos;s Hi
            </h2>
          </div>

          {/* Form Inputs */}
          <div className="space-y-4">
            <Input
              id="email"
              type="email"
              placeholder="이메일 아이디 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 border-none bg-white px-4 text-center text-base placeholder:text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl"
            />

            <Input
              id="password"
              type="password"
              placeholder="비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-14 border-none bg-white px-4 text-center text-base placeholder:text-(--sub-text) shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] rounded-xl"
            />

            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            <div className="pt-2 text-center">
              <Link
                href="/signup"
                className="text-xs text-(--sub-text) underline"
              >
                러너스 하이 회원가입 &gt;
              </Link>
            </div>
          </div>

          {/* Password Reset Info */}
          <div className="mt-8 space-y-1 text-center text-xs text-(--sub-text)">
            <p>비밀번호를 잊으셨다면</p>
            <p>본인 이메일 계정을 사용하여</p>
            <p>메일을 보내주세요.</p>
            <p className="pt-2 font-medium text-(--black)">
              runnershiho21@gmail.com
            </p>
          </div>
        </div>

        {/* Submit Button - Fixed at Bottom */}
        <form onSubmit={onSubmit}>
          <BottomButton type="submit" disabled={loading} variant="unselect">
            {loading ? "처리중..." : "로그인"}
          </BottomButton>
        </form>
      </main>
    </div>
  );
}
