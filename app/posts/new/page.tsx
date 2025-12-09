"use client";

import { BottomButton } from "@/components/common/BottomButton";
import { Header } from "@/components/common/Header";
import { KakaoMap } from "@/components/features/running/KakaoMap";
import { RunningStats } from "@/components/features/running/RunningStats";
import { GpxData, parseGpxFile } from "@/lib/utils/gpx-parser";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function NewPostPage() {
  const router = useRouter();
  const [gpxData, setGpxData] = useState<GpxData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".gpx")) {
        alert("GPX 파일만 선택할 수 있습니다.");
        e.target.value = "";
        return;
      }

      setIsLoading(true);
      try {
        const data = await parseGpxFile(file);
        setGpxData(data);
      } catch {
        alert("GPX 파일을 읽는 중 오류가 발생했습니다.");
        e.target.value = "";
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleNext = () => {
    if (!gpxData) return;
    // GPX 데이터를 sessionStorage에 저장
    sessionStorage.setItem("gpxData", JSON.stringify(gpxData));
    router.push("/posts/new/detail");
  };

  const handleResetFile = () => {
    setGpxData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-(--bg)">
      <Header
        variant="close"
        title="러닝 기록 등록하기"
        onClose={handleClose}
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".gpx"
        onChange={handleFileChange}
        className="hidden"
      />

      <main className="flex min-h-0 flex-1 flex-col">
        {/* GPX 파일 선택 전 화면 */}
        {!gpxData && (
          <div className="flex flex-1 flex-col items-center justify-center px-4">
            <button
              type="button"
              onClick={handleFileSelect}
              disabled={isLoading}
              className="rounded-full bg-(--key-color) px-6 py-2.5 text-sm font-semibold text-(--black) disabled:opacity-50"
            >
              {isLoading ? "파일 처리 중..." : "GPX 파일 선택"}
            </button>

            <p className="mt-4 text-center text-xs text-(--sub-text)">
              러닝 기록이 담긴 GPX 데이터를 선택하시면
              <br />
              러닝 데이터가 표시됩니다.
            </p>
          </div>
        )}

        {/* GPX 파일 선택 후 화면 */}
        {gpxData && (
          <div className="flex min-h-0 flex-1 flex-col">
            {/* 카카오맵 - 남은 공간 모두 채움 */}
            <div className="min-h-0 flex-1">
              <KakaoMap points={gpxData.points} className="h-full w-full" />
            </div>

            {/* 러닝 통계 - 하단에 고정 */}
            <div className="shrink-0 bg-white">
              <RunningStats gpxData={gpxData} />

              {/* 다른 파일 선택 링크 */}
              <div className="pb-4 text-center">
                <button
                  type="button"
                  onClick={handleResetFile}
                  className="text-xs text-(--sub-text) underline"
                >
                  다른 파일 선택
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <BottomButton
          onClick={handleNext}
          disabled={!gpxData}
          variant={gpxData ? "primary" : "unselect"}
        >
          다음
        </BottomButton>
      </main>
    </div>
  );
}
