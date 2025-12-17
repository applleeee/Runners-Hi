export interface ImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

/**
 * 이미지 URL로부터 원본 크기를 로드합니다.
 */
export function loadImageDimensions(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error("이미지를 로드할 수 없습니다."));
    img.crossOrigin = "anonymous";
    img.src = url;
  });
}

/**
 * 다운로드용 파일명을 생성합니다.
 * 형식: runnershi_yyyy-mm-dd-hh-mm-ss.png
 */
export function generateDownloadFilename(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `runnershi_${year}-${month}-${day}-${hours}-${minutes}-${seconds}.png`;
}
