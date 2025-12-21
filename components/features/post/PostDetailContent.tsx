"use client";

import { Header } from "@/components/common/Header";
import { Modal } from "@/components/common/Modal";
import { PostBottomSheet } from "@/components/features/post/PostBottomSheet";
import { KakaoMap } from "@/components/features/running/KakaoMap";
import { usePostDetail } from "@/lib/hooks/post/usePostDetail";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PostDetailContentProps {
  id: string;
}

export function PostDetailContent({ id }: PostDetailContentProps) {
  const router = useRouter();
  const { content, isLoading, error, isOwner, isDeleting, handleDelete } =
    usePostDetail(id);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const onEditClick = () => {
    router.push(`/posts/new/detail?contentId=${id}`);
  };

  const onDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const onDeleteConfirm = () => {
    setShowDeleteDialog(false);
    handleDelete();
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col bg-(--bg)">
        <Header variant="back" title="러닝 기록" />
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
  if (error || !content) {
    return (
      <div className="flex flex-1 flex-col bg-(--bg)">
        <Header variant="back" title="러닝 기록" />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center">
            <p className="mb-4 text-lg font-semibold text-(--black)">
              컨텐츠를 불러올 수 없습니다
            </p>
            <p className="text-sm text-(--sub-text)">
              {error?.message || "컨텐츠가 존재하지 않거나 삭제되었습니다."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 정상 상태
  return (
    <div className="relative h-dvh overflow-hidden">
      {/* 상단 헤더 - 반투명 배경 */}
      <div className="absolute left-0 right-0 top-0 z-40">
        {isOwner ? (
          <Header
            variant="back-more"
            title={content.title}
            className="bg-white/80 backdrop-blur-sm"
            onEdit={onEditClick}
            onDelete={onDeleteClick}
          />
        ) : (
          <Header
            variant="back"
            title={content.title}
            className="bg-white/80 backdrop-blur-sm"
          />
        )}
      </div>

      {/* 지도 배경 */}
      <div className="h-full w-full">
        <KakaoMap points={content.gpxData.points} />
      </div>

      {/* Bottom Sheet */}
      <PostBottomSheet content={content} isOwner={isOwner} />

      {/* 삭제 확인 모달 */}
      <Modal
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        confirmText="삭제"
        onConfirm={onDeleteConfirm}
        isLoading={isDeleting}
      >
        <div className="flex justify-center">
          <p className="text-sm font-bold text-(--black)">
            해당 콘텐츠를 삭제하시겠습니까?
          </p>
        </div>
      </Modal>
    </div>
  );
}
