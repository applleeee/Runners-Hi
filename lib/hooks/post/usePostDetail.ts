import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getContentById,
  deleteContent,
  type ContentDetail,
} from "@/lib/api/content";
import { getCurrentUser } from "@/lib/api/auth";

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
        const [data, currentUser] = await Promise.all([
          getContentById(id),
          getCurrentUser(),
        ]);
        setContent(data);
        setIsOwner(currentUser?.id === data.user.id);
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
      router.replace("/");
    } catch (err) {
      setError(err as Error);
      setIsDeleting(false);
    }
  };

  return { content, isLoading, error, isOwner, isDeleting, handleDelete };
}
