/**
 * Next.js Middleware
 * 
 * This middleware runs before every request and handles:
 * - Route protection (requires authentication for certain routes)
 * - Automatic redirects (logged-in users away from login, etc.)
 * 
 * Protected routes require a valid session cookie. Unauthenticated
 * users are redirected to the login page.
 * 
 * Learn more: https://nextjs.org/docs/app/building-your-application/routing/middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateSession } from "@/app/lib/auth";

/**
 * Routes that require authentication
 * Add more protected route patterns as needed
 */
const PROTECTED_ROUTES = ["/dashboard"];

/**
 * Public routes that don't require authentication
 */
const PUBLIC_ROUTES = ["/login", "/"];

/**
 * Middleware function that runs on every request
 * 
 * @param request - The incoming request
 * @returns Response or redirect
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get("admin_session");
  const isAuthenticated = sessionCookie
    ? validateSession(sessionCookie.value) !== null
    : false;

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Check if current route is the login page
  const isLoginPage = pathname === "/login";

  // Redirect unauthenticated users trying to access protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    // Add redirect parameter to return user after login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isLoginPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

/**
 * Configure which routes this middleware runs on
 * 
 * We match all routes except:
 * - API routes (handled separately)
 * - Static files (_next/static)
 * - Image optimization (_next/image)
 * - Favicon and other public files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)).*)",
  ],
};

