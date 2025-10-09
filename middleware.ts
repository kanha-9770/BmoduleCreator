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

  log("info", "Middleware processing started", { url: request.url });

  // Perform any custom logic here (if needed later)
  // For now, it simply allows all requests

  const response = NextResponse.next();

  log("info", "Middleware processing completed", {
    pathname,
    durationMs: Date.now() - startTime,
  });

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)"],
};
