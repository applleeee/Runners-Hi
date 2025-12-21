import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Runner's Hi",
  description: "러닝 기록을 공유하는 다이어리형 SNS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="mx-auto flex max-w-[720px] min-h-dvh flex-col overflow-x-hidden">
          {children}
        </div>

        {/* 카카오맵 SDK - 전역 로드 */}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false&libraries=services`}
          strategy="afterInteractive"
        />

        {/* Analytics Scripts - 프로덕션 환경에서만 로드 */}
        {process.env.NODE_ENV === "production" && (
          <>
            {/* Google Analytics */}
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-YNXLDLYEEE"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-YNXLDLYEEE');
              `}
            </Script>

            {/* 뷰저블(Beusable) */}
            <Script id="beusable" strategy="afterInteractive">
              {`
                (function(w, d, a){
                  w.__beusablerumclient__ = {
                    load : function(src){
                      var b = d.createElement("script");
                      b.src = src; b.async=true; b.type = "text/javascript";
                      d.getElementsByTagName("head")[0].appendChild(b);
                    }
                  };w.__beusablerumclient__.load(a + "?url=" + encodeURIComponent(d.URL));
                })(window, document, "//rum.beusable.net/load/b251219e074853u702");
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
