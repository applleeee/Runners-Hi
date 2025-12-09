"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 에러 로깅 (필요시 외부 서비스 연동)
    console.error("에러 발생:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-(--bg) px-4">
      <div className="text-center">
        <h2 className="mb-4 text-lg font-bold text-(--black)">
          문제가 발생했습니다
        </h2>
        <p className="mb-6 text-sm text-(--sub-text)">
          일시적인 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-(--key-color) px-6 py-2.5 text-sm font-semibold text-(--black)"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
