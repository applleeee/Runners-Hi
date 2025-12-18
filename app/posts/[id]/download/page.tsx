"use client";

import { useRef, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { toPng } from "html-to-image";
import { Header } from "@/components/common/Header";
import { BottomButton } from "@/components/common/BottomButton";
import { DownloadPreview } from "@/components/features/download/DownloadPreview";
import { ScaledPreview } from "@/components/features/download/ScaledPreview";
import { generateDownloadFilename } from "@/lib/utils/image-utils";
import { usePostDetail } from "@/lib/hooks/post/usePostDetail";

export default function DownloadPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params.id as string;
  const imageUrl = searchParams.get("image") || "";

  const { content, isLoading, error: fetchError } = usePostDetail(id);

  const downloadRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 다운로드 핸들러
  const handleDownload = async () => {
    if (!downloadRef.current) return;

    setIsDownloading(true);
    setError(null);

    try {
      const dataUrl = await toPng(downloadRef.current, {
        pixelRatio: 1,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = generateDownloadFilename();
      link.href = dataUrl;
      link.click();

      // 성공 후 뒤로 이동
      router.back();
    } catch (err) {
      console.error("다운로드 실패:", err);
      setError("이미지 생성에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex h-dvh flex-col bg-(--bg)">
        <Header variant="back" title="러닝 인증샷 생성" />
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-(--key-color) border-t-transparent" />
            <p className="text-sm text-(--sub-text)">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (fetchError || !content || !imageUrl) {
    return (
      <div className="flex h-dvh flex-col bg-(--bg)">
        <Header variant="back" title="러닝 인증샷 생성" />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <p className="mb-4 text-lg font-semibold text-(--black)">
              이미지를 불러올 수 없습니다
            </p>
            <p className="text-sm text-(--sub-text)">
              {fetchError?.message || "컨텐츠가 존재하지 않거나 삭제되었습니다."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col bg-(--bg)">
      {/* 헤더 */}
      <Header variant="back" title="러닝 인증샷 생성" />

      {/* 프리뷰 영역 - 비율 유지하며 중앙 정렬 */}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-4">
        {error ? (
          <div className="flex flex-col items-center gap-4">
            <p className="text-sm text-red-500">{error}</p>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-(--sub-text) px-4 py-2 text-sm text-white"
            >
              닫기
            </button>
          </div>
        ) : (
          <ScaledPreview>
            <DownloadPreview imageUrl={imageUrl} content={content} />
          </ScaledPreview>
        )}
      </div>

      {/* 다운로드 버튼 */}
      <BottomButton
        onClick={handleDownload}
        variant="primary"
        disabled={isDownloading || !!error}
      >
        {isDownloading ? "다운로드 중..." : "다운로드"}
      </BottomButton>

      {/* 다운로드용 숨겨진 원본 해상도 컴포넌트 */}
      <div className="pointer-events-none fixed -left-[9999px] -top-[9999px]">
        <DownloadPreview
          ref={downloadRef}
          imageUrl={imageUrl}
          content={content}
        />
      </div>
    </div>
  );
}
