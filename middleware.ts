import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function middleware(request: NextRequest) {
  const requestId = uuidv4();
  const { pathname } = request.nextUrl;
  const startTime = Date.now();

  const log = (
    level: "info" | "warn" | "error",
    message: string,
    meta: any = {}
  ) => {
    console[level](
      JSON.stringify({
        requestId,
        timestamp: new Date().toISOString(),
        pathname,
        level,
        message,
        ...meta,
      })
    );
  };

  log("info", "Middleware processing", { url: request.url, pathname });

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
    "/admin",
    "/admin/modules",
    "/admin/roles-permissions",
    "/builder/cmgapk1j5000fvj18jc54398m",
  ];

  const protectedRoutes = {
    adminOnly: ["/admin", "/admin/modules"],
    general: ["/dashboard", "/settings"],
  };

  const normalizedPathname = pathname.replace(/\/+$/, "").toLowerCase();
  const isPublic = publicRoutes.some((route) => {
    const match = normalizedPathname === route.toLowerCase();
    if (normalizedPathname === "/register") {
      log("info", "Checking if /register is public", {
        route,
        match,
        originalPathname: pathname,
      });
    }
    return match;
  });

  if (isPublic) {
    log("info", "Allowing public route", { pathname });
    return NextResponse.next();
  }

  const token = request.cookies.get("auth-token")?.value;
  if (!token) {
    log("warn", "No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let userId: string | null = null;
  try {
    const decodedToken = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    userId = decodedToken?.userId || decodedToken?.sub;
    log("info", "Decoded userId from token", { userId });
  } catch (err: any) {
    log("error", "Failed to decode token", { error: err.message });
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!userId) {
    log("warn", "Token missing userId, redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let userData: any;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/user/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );
    userData = await res.json();
    if (!userData.success) throw new Error("API returned failure");
    log("info", "Fetched user data successfully", { userId });
  } catch (err: any) {
    log("error", "Failed to fetch user data", { error: err.message });
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  const roles: string[] =
    userData?.user?.unitAssignments?.map((ua: any) => ua.role.name) || [];
  const isAdmin = roles.includes("Admin");
  const isCEO =
    roles.includes("Chief Executive Officer") || roles.includes("CEO");

  log("info", "User roles checked", { roles, isAdmin, isCEO });

  const isAdminOnly = protectedRoutes.adminOnly.some((route) =>
    pathname.startsWith(route)
  );
  const isGeneralProtected = protectedRoutes.general.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminOnly) {
    if (!(isAdmin || isCEO)) {
      log("warn", "Blocked non-admin/CEO from restricted route", { pathname });
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    log("info", "Admin/CEO allowed to restricted route", { pathname });
    return NextResponse.next();
  }

  if (isGeneralProtected) {
    log("info", "Authenticated user allowed to general protected route", {
      pathname,
    });
    return NextResponse.next();
  }

  log("info", "Allowing authenticated request", {
    pathname,
    durationMs: Date.now() - startTime,
  });
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
