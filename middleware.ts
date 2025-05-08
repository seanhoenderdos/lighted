import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Public routes accessible even when not authenticated
  const publicRoutes = ["/", "/sign-in", "/sign-up", "/university"];
  
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || 
    request.nextUrl.pathname.startsWith("/api/")
  );

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
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
  ],
};