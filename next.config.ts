import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  images: {
    // 개발 환경에서는 이미지 최적화 비활성화 (로컬 Supabase 호환)
    unoptimized: isDev,
    remotePatterns: [
      {
        // Supabase Cloud (프로덕션용)
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
