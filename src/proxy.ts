import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE, isValidToken } from "@/lib/auth";

export async function proxy(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const valid = await isValidToken(token);
  const { pathname, search } = req.nextUrl;
  const isLogin = pathname === "/login";

  if (!valid && !isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    if (pathname !== "/") url.searchParams.set("from", pathname + search);
    return NextResponse.redirect(url);
  }

  if (valid && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on everything except Next internals and static asset files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest.webmanifest|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)).*)",
  ],
};
