import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseEnv } from "./env";

export async function updateSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, publishableKey } = getSupabaseEnv();

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([name, value]) => {
          response.headers.set(name, value);
        });
      },
    },
  });

  try {
    // Use getUser() so proxy matches protected Server Components (which call
    // getUser()), refreshes expired tokens when possible, clears dead session
    // cookies, and rejects server-revoked sessions before redirecting.
    const { data, error } = await supabase.auth.getUser();
    return {
      response,
      hasSession: !error && Boolean(data.user),
    };
  } catch {
    // Malformed or invalid auth cookies must fail closed. Preserve any
    // Set-Cookie cleanup headers emitted before/during failure.
    return { response, hasSession: false };
  }
}
