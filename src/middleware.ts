import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/constants";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // icon.png / apple-icon.png are Next's App Router icon-convention routes (src/app/icon.png,
  // apple-icon.png) — browsers/OS request them unauthenticated (tab icon, iOS home-screen icon),
  // same reason favicon.ico is excluded below. Missing this meant both were silently redirected
  // to /login and served the login page's HTML instead of the actual icon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|assets).*)"],
};
