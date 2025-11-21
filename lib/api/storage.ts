import { createClient } from "@/lib/supabase/client";

/**
 * 이미지를 Supabase Storage에 업로드합니다.
 * @param file 업로드할 이미지 파일
 * @param userId 사용자 ID
 * @returns 업로드된 이미지의 public URL
 */
export async function uploadImage(
  file: File,
  userId: string
): Promise<string> {
  const supabase = createClient();

  // 파일 확장자 추출
  const fileExt = file.name.split(".").pop();
  // 고유한 파일명 생성 (타임스탬프 + 랜덤 문자열)
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  // 사용자별 폴더 구조: userId/fileName
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("content-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) throw error;

  // Public URL 생성
  const {
    data: { publicUrl },
  } = supabase.storage.from("content-images").getPublicUrl(filePath);

  return publicUrl;
}

/**
 * Supabase Storage에서 이미지를 삭제합니다.
 * @param imageUrl 삭제할 이미지의 URL
 */
export async function deleteImage(imageUrl: string): Promise<void> {
  const supabase = createClient();

  // URL에서 파일 경로 추출
  const url = new URL(imageUrl);
  const pathParts = url.pathname.split("/");
  const bucketIndex = pathParts.indexOf("content-images");
  const filePath = pathParts.slice(bucketIndex + 1).join("/");

  const { error } = await supabase.storage
    .from("content-images")
    .remove([filePath]);

  if (error) throw error;
}

/**
 * 이미지 파일인지 검증합니다.
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // 파일 타입 검증
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "JPG, PNG 형식의 이미지만 업로드 가능합니다.",
    };
  }

  // 파일 크기 검증 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "이미지 크기는 10MB 이하여야 합니다.",
    };
  }

  return { valid: true };
}

