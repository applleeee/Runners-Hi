import { PostDetailContent } from "@/components/features/post/PostDetailContent";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

/** Supabase User 조인 결과 타입 */
interface UserNicknameRow {
  nickname: string;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    // 서버에서 Supabase 클라이언트 생성
    const supabase = await createClient();

    const { data } = await supabase
      .from("Content")
      .select(
        `
        title,
        User!inner (nickname)
      `
      )
      .eq("id", id)
      .single();

    if (data) {
      // Supabase 관계 쿼리 결과 타입 단언 (1:1 관계이지만 배열로 추론될 수 있음)
      const user = data.User as unknown as UserNicknameRow;
      return {
        title: `${data.title} | 러너스하이`,
        description: `${user.nickname}님의 러닝 기록`,
      };
    }
  } catch {
    // 에러 시 기본 메타데이터 반환
  }

  return {
    title: "러닝 기록 | 러너스하이",
    description: "러닝 기록을 공유하는 다이어리형 SNS",
  };
}

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;

  return <PostDetailContent id={id} />;
}
