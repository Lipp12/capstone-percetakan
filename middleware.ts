import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const secret =
    process.env.NEXTAUTH_SECRET ||
    "capstone-percetakan-super-secret-key-2026-production-ready";

  // Deteksi cookie session (baik dengan prefix __Secure- pada HTTPS maupun biasa)
  const hasSecureCookie = req.cookies.has("__Secure-next-auth.session-token");
  const isHttps =
    req.nextUrl.protocol === "https:" ||
    req.headers.get("x-forwarded-proto") === "https";

  let token = await getToken({
    req,
    secret,
    secureCookie: hasSecureCookie || isHttps,
  });

  // Fallback jika belum ketemu
  if (!token && !hasSecureCookie) {
    token = await getToken({
      req,
      secret,
      secureCookie: false,
    });
  }

  const path = req.nextUrl.pathname;

  // Jika belum login, redirect ke halaman login
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // Proteksi route admin & operator
  if (path.startsWith("/admin")) {
    if (role !== "ADMIN" && role !== "OPERATOR") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/order/:path*",
    "/checkout/:path*",
    "/orders/:path*",
  ],
};
