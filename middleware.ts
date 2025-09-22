// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("[Middleware] Called for:", request.nextUrl.pathname);
  const { pathname, searchParams } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/verify-otp",
    "/forgot-password",
    "/reset-password",
    "/",
  ];

  // Protected routes that require authentication (but not necessarily module permissions)
  const protectedRoutes = ["/profile", "/admin/roles-permissions"];

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  const token = request.cookies.get("auth-token")?.value;
  console.log("[Middleware] Auth token present:", !!token);

  // Allow public routes to pass through
  if (isPublicRoute) {
    console.log("[Middleware] Allowing public route:", pathname);
    return NextResponse.next();
  }

  // Check for authentication
  if (!token) {
    console.log("[Middleware] No auth token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Decode token to get userId (assuming JWT or similar; adjust based on your auth setup)
  let userId: string | null = null;
  try {
    // Example: Decode JWT (replace with your actual token decoding logic)
    const decodedToken = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    userId = decodedToken?.userId || decodedToken?.sub;
    console.log("[Middleware] Extracted userId from token:", userId);
  } catch (error) {
    console.error("[Middleware] Failed to decode token:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!userId) {
    console.log("[Middleware] No userId found in token, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users from public auth routes (except /) to profile
  if (token && pathname !== "/" && publicRoutes.includes(pathname)) {
    console.log(
      "[Middleware] User has token but accessing public auth route:",
      pathname,
      "redirecting to profile"
    );
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  // Check protected routes (no module-specific permissions required)
  if (isProtectedRoute) {
    console.log(
      "[Middleware] Auth token found, allowing access to protected route:",
      pathname
    );
    return NextResponse.next();
  }

  // Handle module-specific routes (not in public or protected routes)
  const moduleId = searchParams.get("id") || getModuleIdFromPath(pathname);
  if (moduleId) {
    console.log("[Middleware] Checking permissions for moduleId:", moduleId);

    try {
      // Fetch user permissions
      const userPermissionsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user-permissions?userId=${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Include token if your API requires it
        }
      );
      const userPermissionsData = await userPermissionsResponse.json();

      // Fetch user data to get role
      const userResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userData = await userResponse.json();

      let hasAccess = false;

      // Check user-specific permissions
      if (userPermissionsData.success) {
        hasAccess = userPermissionsData.data.some(
          (up: any) => up.moduleId === moduleId && up.granted && up.isActive
        );
        console.log("[Middleware] User permission check result:", hasAccess);
      }

      // Check role-based permissions if no user-specific permissions
      if (!hasAccess && userData.success) {
        const roleId =
          userData.data.unitAssignments?.[0]?.roleId ||
          userData.data.userRoles?.[0]?.roleId;
        if (roleId) {
          const rolePermissionsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/role-permissions?roleId=${roleId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const rolePermissionsData = await rolePermissionsResponse.json();

          if (rolePermissionsData.success) {
            hasAccess = rolePermissionsData.data.some(
              (rp: any) => rp.moduleId === moduleId && rp.granted
            );
            console.log("[Middleware] Role permission check result:", hasAccess);
          }
        }
      }

      if (!hasAccess) {
        console.log(
          "[Middleware] User lacks permission for moduleId:",
          moduleId,
          "redirecting to unauthorized"
        );
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      console.log("[Middleware] User has permission for moduleId:", moduleId);
    } catch (error) {
      console.error("[Middleware] Error checking permissions:", error);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  console.log("[Middleware] Allowing request to:", pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};

// Helper function to map paths to module IDs
function getModuleIdFromPath(pathname: string): string | null {
  const pathMap: { [key: string]: string } = {
    "/sales": "mod1",
    "/sales/orders": "mod1-child1",
    "/inventory": "mod2",
    "/inventory/products": "mod2-child1",
    // Add more mappings based on your module paths
  };
  return pathMap[pathname] || null;
}