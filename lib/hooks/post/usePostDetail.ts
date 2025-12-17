import { getCurrentUser } from "@/lib/api/auth";
import {
  deleteContent,
  getContentById,
  type ContentDetail,
} from "@/lib/api/content";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function usePostDetail(id: string) {
  const router = useRouter();
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      try {
        setIsLoading(true);

        // 콘텐츠는 반드시 가져오고
        const data = await getContentById(id);
        setContent(data);

        // 현재 사용자는 실패해도 무시 (소유자 판단용일 뿐)
        try {
          const currentUser = await getCurrentUser();
          setIsOwner(currentUser?.id === data.user.id);
        } catch {
          setIsOwner(false);
        }

        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [id]);

  const handleDelete = async () => {
    if (!content) return;

    try {
      setIsDeleting(true);

      await deleteContent(content.id);
      alert("삭제되었습니다.");

      router.replace("/");
    } catch (err) {
      setError(err as Error);
      setIsDeleting(false);
    }
  };

  return { content, isLoading, error, isOwner, isDeleting, handleDelete };
}
