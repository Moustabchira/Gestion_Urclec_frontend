import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Récupération du token depuis les cookies
  const token = request.cookies.get("auth_token")?.value;

  const isLoginPage = pathname === "/login" || pathname === "/";
  const isProtected = pathname.startsWith("/dashboard");

  // Si utilisateur NON authentifié → rediriger vers login
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Si utilisateur déjà connecté → rediriger login vers dashboard
  if (isLoginPage && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
