"use client";

import Image from "next/image";

interface ProfileImageProps {
  src: string | null;
  alt?: string;
  /** 고정 크기 (className으로 크기 지정 시 생략 가능) */
  size?: number;
  fallbackText?: string;
  className?: string;
  /** 프리셋 이미지 여부 (object-contain + 패딩 적용) */
  isPreset?: boolean;
}

/**
 * 닉네임 기반으로 일관된 배경색 생성
 * - 같은 닉네임은 항상 같은 색상 반환
 * - 키 컬러(#06F712) 계열의 다양한 톤 사용
 */
function getAvatarColor(text: string): string {
  // 러너스 하이 브랜드에 어울리는 색상 팔레트
  const colors = [
    "#06F712", // 키 컬러 (밝은 녹색)
    "#05D410", // 약간 어두운 녹색
    "#04B10D", // 중간 녹색
    "#2ECC71", // 에메랄드
    "#27AE60", // 네프라이트
    "#1ABC9C", // 터콰이즈
    "#16A085", // 그린 씨
    "#3498DB", // 피터 리버
    "#2980B9", // 벨리즈 홀
    "#9B59B6", // 아메시스트
    "#8E44AD", // 위스테리아
    "#E74C3C", // 알리자린
    "#E67E22", // 캐롯
    "#F39C12", // 오렌지
    "#F1C40F", // 선플라워
  ];

  // 문자열을 해시값으로 변환
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // 해시값을 색상 인덱스로 변환
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * 프로필 이미지 공통 컴포넌트
 * - 원형 형태로 이미지 표시
 * - 프리셋 이미지: object-contain으로 원본 비율 유지
 * - 업로드 이미지: object-cover로 꽉 채움
 * - 이미지가 없으면 fallbackText 기반 아바타 표시 (닉네임 앞 2글자 + 랜덤 배경색)
 */
export function ProfileImage({
  src,
  alt = "프로필 이미지",
  size,
  fallbackText = "",
  className = "",
  isPreset,
}: ProfileImageProps) {
  // 프리셋 이미지인지 자동 감지 (preset 경로 포함 여부)
  const isPresetImage = isPreset ?? (src?.includes("/preset/") ?? false);
  
  // 폴백 텍스트 기반 배경색
  const avatarColor = getAvatarColor(fallbackText);

  return (
    <div
      className={`overflow-hidden rounded-full bg-white border-2 border-(--unselect) ${className}`}
      style={size ? { width: size, height: size } : undefined}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          width={size || 150}
          height={size || 150}
          className={`h-full w-full ${
            isPresetImage ? "object-contain p-[15%]" : "object-cover"
          }`}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center text-white font-bold"
          style={{
            backgroundColor: avatarColor,
            fontSize: size ? size * 0.35 : "1.5rem",
          }}
        >
          {fallbackText.slice(0, 2)}
        </div>
      )}
    </div>
  );
}

