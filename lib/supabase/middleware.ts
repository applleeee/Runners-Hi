import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 명확하게 공개되어야 하는 경로들
const publicPaths = {
  // 정확히 일치해야 하는 경로
  exact: ["/login", "/signup", "/", "/resetPassword"],
  // 패턴 매칭이 필요한 경로 (동적 라우트)
  patterns: [
    /^\/posts\/(?!new)[^/]+$/, // /posts/123 형태만 (컨텐츠 상세), /posts/new 제외
    /^\/profile\/[^/]+$/, // /profile/[userId] (유저 프로필)
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 새로고침 (중요: 서버 컴포넌트에서 사용자 정보를 가져오기 전에 필수)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 공개 경로 체크
  const isExactPublicPath = publicPaths.exact.includes(pathname);
  const isPatternPublicPath = publicPaths.patterns.some((pattern) =>
    pattern.test(pathname)
  );
  const isPublicRoute = isExactPublicPath || isPatternPublicPath;

  // 공개 경로가 아니고 로그인 안된 경우 → 로그인 페이지로 리다이렉트
  if (!isPublicRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 이미 로그인된 상태에서 로그인/회원가입 페이지 접근 → 메인으로 리다이렉트
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage && user) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return supabaseResponse;
}
