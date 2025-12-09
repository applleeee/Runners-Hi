import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-(--bg) px-4">
      <div className="text-center">
        <h1 className="mb-2 text-4xl font-bold text-(--black)">404</h1>
        <h2 className="mb-4 text-lg font-bold text-(--black)">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="mb-6 text-sm text-(--sub-text)">
          요청하신 페이지가 존재하지 않거나
          <br />
          삭제되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-(--key-color) px-6 py-2.5 text-sm font-semibold text-(--black)"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
