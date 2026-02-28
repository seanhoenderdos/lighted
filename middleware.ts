import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  // Use getToken instead of auth() to avoid using Prisma in Edge runtime
  // NextAuth v5 (Auth.js) uses "authjs" prefix for cookies
  const isProduction = process.env.NODE_ENV === "production";
  const cookieName = isProduction 
    ? "__Secure-authjs.session-token" 
    : "authjs.session-token";
    
  const token = await getToken({ 
    req: request,
    secret: process.env.AUTH_SECRET,
    cookieName,
  });

  // Public routes accessible even when not authenticated
  const publicRoutes = ["/", "/sign-in", "/sign-up", "/reset-password", "/privacy", "/terms"];
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith("/api/")
  );
  
  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If user IS authenticated and on the home page, redirect to dashboard
  if (token && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Match all routes except public assets and API routes
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth routes (handled by NextAuth.js)
     * 2. /_next (Next.js internals)
     * 3. /fonts, /images, /icons (static files)
     * 4. /favicon.ico, /sitemap.xml (SEO files)
     */
    "/((?!api/auth|_next/static|_next/image|fonts|images|icons|favicon.ico|sitemap.xml).*)",
  ],  // Specify that this middleware runs in the Edge Runtime
  runtime: 'experimental-edge',
};