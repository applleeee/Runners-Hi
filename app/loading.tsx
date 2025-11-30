export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-(--bg)">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-(--key-color) border-t-transparent" />
        <p className="text-sm text-(--sub-text)">로딩 중...</p>
      </div>
    </div>
  );
}
