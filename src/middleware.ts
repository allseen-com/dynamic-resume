import { NextResponse, type NextRequest } from "next/server";
import {
  TOOLING_COOKIE_NAME,
  hasValidToolingCookie,
  isToolingProtectionEnabled,
} from "./lib/toolingSession";

function isPublicPath(pathname: string, method: string): boolean {
  if (pathname === "/" || pathname === "/unlock") return true;
  if (pathname === "/api/tooling-unlock") return true;
  if (pathname === "/api/resume" && method === "GET") return true;
  if (pathname === "/api/generate-pdf" && method === "POST") return true;
  if (pathname === "/api/generate-docx" && method === "POST") return true;
  return false;
}

export function middleware(request: NextRequest) {
  if (!isToolingProtectionEnabled()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const method = request.method;

  if (isPublicPath(pathname, method)) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(TOOLING_COOKIE_NAME)?.value;
  if (hasValidToolingCookie(cookie)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const next = pathname + request.nextUrl.search;
  const url = request.nextUrl.clone();
  url.pathname = "/unlock";
  url.search = `?next=${encodeURIComponent(next)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
