"use client";

import { Header } from "@/components/common/Header";
import { ProfileImage } from "@/components/common/ProfileImage";
import { NicknameModal } from "@/components/features/profile/NicknameModal";
import { ProfileImagePresetModal } from "@/components/features/profile/ProfileImagePresetModal";
import { ProfileImageSelectionModal } from "@/components/features/profile/ProfileImageSelectionModal";
import { ProfileImageUploadModal } from "@/components/features/profile/ProfileImageUploadModal";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "@/lib/api/profile";
import { getCurrentUserProfile } from "@/lib/api/profile";
import { useNicknameChange } from "@/lib/hooks/useNicknameChange";
import { useProfileImage } from "@/lib/hooks/useProfileImage";
import { createClient } from "@/lib/supabase/client";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MyPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<
    "closed" | "selection" | "upload" | "preset"
  >("closed");
  const { changeNickname } = useNicknameChange();
  const { changeProfileImage } = useProfileImage();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserEmail(user?.email || "");

      const data = await getCurrentUserProfile();
      setProfile(data);
    } catch (error) {
      console.error("프로필 조회 실패:", error);
      alert("프로필을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleNicknameChange = async (newNickname: string) => {
    await changeNickname(newNickname);
    await loadProfile();
  };

  const handleProfileImageChange = async (imageUrlOrFile: string | File) => {
    await changeProfileImage(imageUrlOrFile);
    await loadProfile();
  };

  const handleGoToProfile = () => {
    if (profile) {
      router.push(`/profile/${profile.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-(--sub-text)">로딩 중...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-(--sub-text)">프로필을 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-(--bg)">
      <Header variant="main" />

      <main className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col px-4 py-4">
          {/* 프로필 이미지 영역 */}
          <div className="mb-4 flex flex-col items-center">
            <ProfileImage
              src={profile.profile_image_url}
              size={120}
              fallbackText={profile.nickname}
              className="mb-3"
            />
            <Button
              variant="link"
              onClick={() => setModalStep("selection")}
              className="cursor-pointer text-xs text-(--sub-text) underline"
            >
              프로필 이미지 변경
            </Button>
          </div>

          {/* 닉네임 카드 */}
          <div className="mb-3">
            <div className="flex items-center justify-between rounded-xl border-none bg-white px-3 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <p className="min-w-0 flex-1 truncate text-sm font-medium text-(--black)">
                {profile.nickname}
              </p>
              <Button
                variant="link"
                onClick={() => setIsNicknameModalOpen(true)}
                className="h-auto shrink-0 cursor-pointer p-0 text-xs text-(--sub-text) underline"
              >
                닉네임 변경
              </Button>
            </div>
          </div>

          {/* 이메일 영역 */}
          <div className="mb-3">
            <div className="rounded-xl border-none bg-(--sub-color) px-3 py-3 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <p className="truncate text-sm font-medium text-(--black)">
                {userEmail}
              </p>
            </div>
          </div>

          {/* 하단 영역 - 버튼 + 문의 안내 */}
          <div className="mt-auto flex flex-col gap-6 pb-4">
            {/* 내 프로필 보러가기 버튼 */}
            <button
              onClick={handleGoToProfile}
              className="flex w-full cursor-pointer items-center justify-center gap-1 rounded-full bg-(--key-color) px-4 py-2.5 text-sm font-semibold text-(--black) shadow-lg"
            >
              <span>내 프로필 보러가기</span>
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* 문의 안내 */}
            <div className="text-center">
              <p className="mb-1 text-xs text-(--sub-text)">
                문의는 아래로 해주세요.
              </p>
              <p className="text-xs font-medium text-(--black)">
                {process.env.NEXT_PUBLIC_CONTACT_EMAIL}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 닉네임 변경 모달 */}
      <NicknameModal
        currentNickname={profile.nickname}
        isOpen={isNicknameModalOpen}
        onClose={() => setIsNicknameModalOpen(false)}
        onSubmit={handleNicknameChange}
      />

      {/* 프로필 이미지 변경 모달 - 1단계: 선택 */}
      <ProfileImageSelectionModal
        isOpen={modalStep === "selection"}
        onClose={() => setModalStep("closed")}
        onSelectUpload={() => setModalStep("upload")}
        onSelectPreset={() => setModalStep("preset")}
      />

      {/* 프로필 이미지 변경 모달 - 2단계: 업로드 */}
      <ProfileImageUploadModal
        currentImageUrl={profile.profile_image_url}
        isOpen={modalStep === "upload"}
        onClose={() => setModalStep("closed")}
        onSubmit={async (file) => {
          await handleProfileImageChange(file);
          setModalStep("closed");
        }}
      />

      {/* 프로필 이미지 변경 모달 - 2단계: 프리셋 */}
      <ProfileImagePresetModal
        currentImageUrl={profile.profile_image_url}
        isOpen={modalStep === "preset"}
        onClose={() => setModalStep("closed")}
        onSubmit={async (imageUrl) => {
          await handleProfileImageChange(imageUrl);
          setModalStep("closed");
        }}
      />
    </div>
  );
}
