import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("Middleware called for:", request.nextUrl.pathname);
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
    "/",
  ];

  // Protected routes that require authentication
  const protectedRoutes = ["/dashboard", "/", "admin/roles-permissions"];

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const token = request.cookies.get("auth-token")?.value;
  console.log("Auth token present:", !!token);

  if (isProtectedRoute) {
    if (!token) {
      console.log("No auth token found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }

    console.log(
      "Auth token found, allowing access to protected route:",
      pathname
    );
    return NextResponse.next();
  }

  // If user is logged in and tries to access public auth routes, redirect to dashboard
  if (isPublicRoute && pathname !== "/") {
    if (token) {
      console.log(
        "User has token but accessing public route:",
        pathname,
        "redirecting to dashboard"
      );
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  console.log("Middleware allowing request to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
