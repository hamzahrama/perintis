import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

function redirectWithSessionCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";

  const redirectResponse = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  for (const header of ["Cache-Control", "Expires", "Pragma"]) {
    const value = response.headers.get(header);
    if (value) {
      redirectResponse.headers.set(header, value);
    }
  }

  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { response, hasSession } = await updateSupabaseSession(request);
  const pathname = request.nextUrl.pathname;

  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/goals") ||
      pathname.startsWith("/daily") ||
      pathname.startsWith("/habits") ||
      pathname.startsWith("/reminders") ||
      pathname.startsWith("/commitment")) &&
    !hasSession
  ) {
    return redirectWithSessionCookies(request, response, "/login");
  }

  if (
    hasSession &&
    (pathname === "/login" || pathname === "/register")
  ) {
    return redirectWithSessionCookies(request, response, "/dashboard");
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/dashboard/:path*",
    "/profile/:path*",
    "/goals/:path*",
    "/daily/:path*",
    "/habits/:path*",
    "/reminders/:path*",
    "/commitment/:path*",
  ],
};
