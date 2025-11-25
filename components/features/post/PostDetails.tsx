import { type ContentDetail } from "@/lib/api/content";

interface PostDetailsProps {
  content: ContentDetail;
}

export function PostDetails({ content }: PostDetailsProps) {
  return (
    <div className="space-y-4">
      {/* 코멘트 */}
      {content.comment && (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed text-(--black) whitespace-pre-wrap">
            {content.comment}
          </p>
        </div>
      )}

      {/* 작성자 정보 - 가운데 정렬, 세로 배치 */}
      <div className="flex flex-col items-center gap-2 pt-4">
        <div className="h-14 w-14 rounded-full bg-(--sub-color) flex items-center justify-center">
          <span className="text-lg font-semibold text-(--black)">
            {content.user.nickname[0]}
          </span>
        </div>
        <span className="text-sm font-semibold text-(--black)">
          {content.user.nickname}
        </span>
      </div>
    </div>
  );
}
