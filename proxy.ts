import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from "jose";

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  // CORS headers
  response.headers.set(
    "Access-Control-Allow-Origin",
    "https://docs-rho-wine.vercel.app",
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );

  // Define protected and public admin routes
  const isLoginPage = path === "/admin/login";
  const isProtectedRoute = path.startsWith("/admin") && !isLoginPage;

  const token = request.cookies.get("adminToken")?.value || "";
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key",
  );

  // 🔹 1. If user is on login page and already has a valid token → redirect to /admin
  if (isLoginPage && token) {
    try {
      await jose.jwtVerify(token, secret);
      return NextResponse.redirect(new URL("/admin", request.url));
    } catch {
      // invalid token — let them stay on login
    }
  }

  // 🔹 2. If user is on a protected route and no valid token → redirect to login
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      await jose.jwtVerify(token, secret);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // Default (public routes)
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
