import { test, expect } from "@playwright/test";
import { NextRequest } from "next/server";

import { proxy } from "../src/proxy";

const SUPABASE_URL = "https://example.supabase.co";
const COOKIE_NAME = "sb-example-auth-token";

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeJwt(expSeconds: number): string {
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      sub: "user-123",
      aud: "authenticated",
      role: "authenticated",
      exp: expSeconds,
    }),
  );
  return `${header}.${payload}.sig`;
}

function encodeSessionCookie(session: Record<string, unknown>): string {
  return `base64-${toBase64Url(JSON.stringify(session))}`;
}

function makeRequest(pathname: string, cookieValue?: string): NextRequest {
  const headers = new Headers();
  if (cookieValue !== undefined) {
    headers.set("cookie", `${COOKIE_NAME}=${cookieValue}`);
  }
  return new NextRequest(`http://localhost:3000${pathname}`, { headers });
}

test.describe("proxy auth session & redirect loop protection", () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  test.beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  });

  test.afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined)
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  });

  test("no session: /dashboard redirects 307 to /login, /login stays 200", async () => {
    const dashRes = await proxy(makeRequest("/dashboard"));
    expect(dashRes.status).toBe(307);
    expect(dashRes.headers.get("location")).toBe("http://localhost:3000/login");

    const loginRes = await proxy(makeRequest("/login"));
    expect(loginRes.status).toBe(200);
  });

  test("valid session: /dashboard passes, /login redirects 307 to /dashboard", async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const cookie = encodeSessionCookie({
      access_token: makeJwt(futureExp),
      refresh_token: "valid-refresh",
      expires_in: 3600,
      expires_at: futureExp,
      token_type: "bearer",
      user: { id: "user-123", email: "user@example.com" },
    });

    globalThis.fetch = async () =>
      new Response(JSON.stringify({ id: "user-123", email: "user@example.com" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });

    const dashRes = await proxy(makeRequest("/dashboard", cookie));
    expect(dashRes.status).toBe(200);

    const loginRes = await proxy(makeRequest("/login", cookie));
    expect(loginRes.status).toBe(307);
    expect(loginRes.headers.get("location")).toBe(
      "http://localhost:3000/dashboard",
    );
  });

  test("expired access token + valid refresh token: refreshes session and allows /dashboard", async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60;
    const newExp = Math.floor(Date.now() / 1000) + 3600;
    const oldCookie = encodeSessionCookie({
      access_token: makeJwt(pastExp),
      refresh_token: "valid-refresh",
      expires_in: 3600,
      expires_at: pastExp,
      token_type: "bearer",
      user: { id: "user-123", email: "user@example.com" },
    });

    globalThis.fetch = async (input) => {
      const url = typeof input === "string" ? input : input.toString();
      if (url.includes("/token?grant_type=refresh_token")) {
        return new Response(
          JSON.stringify({
            access_token: makeJwt(newExp),
            refresh_token: "rotated-refresh",
            expires_in: 3600,
            expires_at: newExp,
            token_type: "bearer",
            user: { id: "user-123", email: "user@example.com" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }
      return new Response(
        JSON.stringify({ id: "user-123", email: "user@example.com" }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    };

    const dashRes = await proxy(makeRequest("/dashboard", oldCookie));
    expect(dashRes.status).toBe(200);
    const updatedCookie = dashRes.cookies.get(COOKIE_NAME);
    expect(updatedCookie?.value).toBeTruthy();
    expect(updatedCookie?.value).not.toBe(oldCookie);
  });

  test("expired access token + invalid refresh token: redirects /dashboard -> /login, clears cookie, no loop", async () => {
    const pastExp = Math.floor(Date.now() / 1000) - 60;
    const staleCookie = encodeSessionCookie({
      access_token: makeJwt(pastExp),
      refresh_token: "dead-refresh",
      expires_in: 3600,
      expires_at: pastExp,
      token_type: "bearer",
      user: { id: "user-123", email: "user@example.com" },
    });

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid Refresh Token: Refresh Token Not Found",
        }),
        { status: 400, headers: { "content-type": "application/json" } },
      );

    const dashRes = await proxy(makeRequest("/dashboard", staleCookie));
    expect(dashRes.status).toBe(307);
    expect(dashRes.headers.get("location")).toBe("http://localhost:3000/login");

    const clearedCookie = dashRes.cookies.get(COOKIE_NAME);
    expect(clearedCookie?.value).toBe("");
    expect(clearedCookie?.maxAge).toBe(0);

    // Following redirect to /login must NOT bounce back to /dashboard
    const loginAfterClear = await proxy(makeRequest("/login"));
    expect(loginAfterClear.status).toBe(200);

    // Even if client still sent stale cookie on /login, it must NOT redirect to /dashboard
    const loginWithStaleCookie = await proxy(makeRequest("/login", staleCookie));
    expect(loginWithStaleCookie.status).toBe(200);
  });

  test("unexpired token but server-revoked session: clears cookie and avoids /dashboard <-> /login loop", async () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const revokedCookie = encodeSessionCookie({
      access_token: makeJwt(futureExp),
      refresh_token: "revoked-refresh",
      expires_in: 3600,
      expires_at: futureExp,
      token_type: "bearer",
      user: { id: "user-123", email: "user@example.com" },
    });

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          code: 403,
          error_code: "session_not_found",
          msg: "Session from session_id claim in JWT does not exist",
        }),
        { status: 403, headers: { "content-type": "application/json" } },
      );

    const dashRes = await proxy(makeRequest("/dashboard", revokedCookie));
    expect(dashRes.status).toBe(307);
    expect(dashRes.headers.get("location")).toBe("http://localhost:3000/login");
    expect(dashRes.cookies.get(COOKIE_NAME)?.maxAge).toBe(0);

    const loginRes = await proxy(makeRequest("/login", revokedCookie));
    expect(loginRes.status).toBe(200);
  });

  test("corrupted cookie: fails closed without crashing or looping", async () => {
    const dashRes = await proxy(makeRequest("/dashboard", "base64-not-valid!!!"));
    expect(dashRes.status).toBe(307);
    expect(dashRes.headers.get("location")).toBe("http://localhost:3000/login");

    const loginRes = await proxy(makeRequest("/login", "base64-not-valid!!!"));
    expect(loginRes.status).toBe(200);
  });
});
