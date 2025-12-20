import { type ContentDetail } from "@/lib/api/content";
import Link from "next/link";
import { ProfileImage } from "@/components/common/ProfileImage";

interface PostDetailsProps {
  content: ContentDetail;
}

export function PostDetails({ content }: PostDetailsProps) {
  return (
    <div className="space-y-4">
      {/* 컨텐츠 제목 */}
      <h2 className="text-base font-bold text-(--black)">{content.title}</h2>

      {/* 코멘트 */}
      {content.comment && (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-(--black) whitespace-pre-wrap">
            {content.comment}
          </p>
        </div>
      )}

      {/* 작성자 정보 - 가운데 정렬, 세로 배치 */}
      <Link
        href={`/profile/${content.user.id}`}
        className="flex flex-col items-center gap-2 pt-4 cursor-pointer hover:opacity-80 transition-opacity"
      >
        <ProfileImage
          src={content.user.profile_image_url}
          fallbackText={content.user.nickname}
          size={56}
        />
        <span className="text-sm font-semibold text-(--black)">
          {content.user.nickname}
        </span>
      </Link>
    </div>
  );
}
