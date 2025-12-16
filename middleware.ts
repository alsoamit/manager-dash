import { NextResponse } from "next/server";
import { auth } from "./auth";

// Check if free login is enabled via environment variable
const FREE_LOGIN_ENABLED = process.env.MANAGER_DASH_FREE_LOGIN === "true";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow all /auth/* routes without any checks
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // If free login is enabled, bypass all authentication checks
  if (FREE_LOGIN_ENABLED) {
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!session) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // All authenticated routes require manager role
  if (!session.user?.isManager) {
    console.log("user is not manager", session.user);
    return NextResponse.redirect(new URL("/auth/unauthenticated", req.url));
  }

  return NextResponse.next();
});

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
