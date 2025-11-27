"use client";

import { updateProfileImage, uploadProfileImage } from "@/lib/api/profile";
import { useState } from "react";

export function useProfileImage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeProfileImage = async (
    imageUrlOrFile: string | File
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      let imageUrl: string;

      if (typeof imageUrlOrFile === "string") {
        // Preset 이미지 URL을 직접 사용
        imageUrl = imageUrlOrFile;
      } else {
        // 파일 업로드 후 URL 받기
        imageUrl = await uploadProfileImage(imageUrlOrFile);
      }

      // 프로필 이미지 URL 업데이트
      await updateProfileImage(imageUrl);
      alert("프로필 이미지가 변경되었습니다.");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        alert(err.message);
      } else {
        setError("알 수 없는 오류가 발생했습니다.");
        alert("알 수 없는 오류가 발생했습니다.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changeProfileImage, loading, error };
}
