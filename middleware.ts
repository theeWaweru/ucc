// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define which paths require authentication
  const isAdminPath = path.startsWith("/admin");

  if (isAdminPath) {
    const session = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to login if no session exists
    if (!session) {
      const url = new URL("/auth/sign-in", request.url);
      url.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Check if user has admin role (optional additional check)
    if (session.role !== "admin") {
      // Redirect to unauthorized page or home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware runs on
export const config = {
  matcher: ["/admin/:path*"],
};
