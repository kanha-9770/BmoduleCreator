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
  const protectedRoutes = ["/profile", "/admin/roles-permissions"];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const token = request.cookies.get("auth-token")?.value;
  console.log("Auth token present:", !!token);

  // Allow public routes to pass through
  if (isPublicRoute) {
    console.log("Allowing public route:", pathname);
    return NextResponse.next();
  }

  // Check protected routes for authentication
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

  // Redirect authenticated users from public auth routes (except /) to profile
  if (token && pathname !== "/") {
    console.log(
      "User has token but accessing public route:",
      pathname,
      "redirecting to profile"
    );
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  console.log("Middleware allowing request to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};