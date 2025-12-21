import { ProfileContent } from "@/components/features/profile/ProfileContent";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;

  try {
    const supabase = await createClient();

    const { data } = await supabase
      .from("User")
      .select("nickname")
      .eq("id", userId)
      .single();

    if (data) {
      return {
        title: `${data.nickname}님의 프로필 | 러너스하이`,
        description: `${data.nickname}님의 러닝 기록을 확인해보세요.`,
      };
    }
  } catch {
    // 에러 시 기본 메타데이터 반환
  }

  return {
    title: "프로필 | 러너스하이",
    description: "러닝 기록을 공유하는 다이어리형 SNS",
  };
}

export default async function ProfilePage({ params }: Props) {
  const { userId } = await params;

  return <ProfileContent userId={userId} />;
}
