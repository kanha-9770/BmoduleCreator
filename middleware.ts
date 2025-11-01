import { type NextRequest, NextResponse } from "next/server";

// Define public and protected routes
const publicRoutes = [
  "/login",
  "/register",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
  "/",
  "/akash",
  "/organization",
  "/profile",
  "/builder",
  "/sub-admin/cmhady3zj0027vjck0dlsod19"
];

const protectedRoutes = {
  adminOnly: ["/admin", "/admin/modules"],
  general: [
    "/dashboard",
    "/settings",
    "/admin",
    "/admin/modules",
    "/admin/roles-permissions",
    "/builder", // Add /builder to protect all /builder/* routes
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // Allow public routes without authentication
  if (
    publicRoutes.some((route) =>
      route === "/" ? pathname === route : pathname.startsWith(route)
    )
  ) {
    return NextResponse.next();
  }
  // Get the auth token from cookies
  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    // Redirect to login if no token for protected routes
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Call the /api/auth/me route to get user data
    const apiResponse = await fetch(`${request.nextUrl.origin}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `auth-token=${token}`, // Pass the token
      },
    });
    if (!apiResponse.ok) {
      // Handle API errors (e.g., 401 or 500)
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const { user } = await apiResponse.json();
    // Check if the user has an admin role
    const isAdmin = user.unitAssignments.some(
      (ua: { role: { name: string } }) => ua.role.name.toLowerCase() === "admin"
    );
    console.log("this is admin", isAdmin);
    // Check if the requested path is in adminOnly routes
    const isAdminOnlyRoute = protectedRoutes.adminOnly.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminOnlyRoute && !isAdmin) {
      // Redirect non-admins from admin-only routes
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Check if the requested path is in general protected routes
    const isGeneralProtectedRoute = protectedRoutes.general.some((route) =>
      pathname.startsWith(route)
    );

    if (isGeneralProtectedRoute && !user) {
      // Redirect unauthenticated users from general protected routes
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Allow the request to proceed if authenticated (and admin for admin-only routes)
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    // Apply to all routes except API, static files, and specific excluded paths
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
