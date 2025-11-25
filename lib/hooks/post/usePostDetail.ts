import { useState, useEffect } from "react";
import { getContentById, type ContentDetail } from "@/lib/api/content";

export function usePostDetail(id: string) {
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setIsLoading(true);
        const data = await getContentById(id);
        setContent(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchContent();
  }, [id]);

  return { content, isLoading, error };
}
