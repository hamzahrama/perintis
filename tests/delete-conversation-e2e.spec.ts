import { expect, test, type Page } from "@playwright/test";

// Mock Supabase (tests/mock-supabase-server.mjs) + Next dev server are started
// by playwright.config.ts. These tests exercise the REAL server action and the
// REAL ChatInterface UI in a browser; only the Supabase backend is faked at the
// HTTP level. Real RLS and DB cascade are NOT exercised (see report).

const MOCK = "http://127.0.0.1:4599";
const USER_ID = "test-user-auth-123";
const CONV_A = "Test Conversation A";
const CONV_B = "Test Conversation B";

function sessionCookieValue(accessToken: string, userId: string): string {
  const session = {
    access_token: accessToken,
    refresh_token: "test-refresh-token",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user: { id: userId, email: "test@example.com" },
  };
  return `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
}

// Storage key is sb-<hostname-first-label>-auth-token; host is 127.0.0.1 -> "127".
const COOKIE_NAME = "sb-127-auth-token";

async function signIn(page: Page, accessToken = "test-access-token", userId = USER_ID) {
  await page.context().addCookies([
    {
      name: COOKIE_NAME,
      value: sessionCookieValue(accessToken, userId),
      domain: "127.0.0.1",
      path: "/",
    },
  ]);
}

async function resetMock(request: { post: (u: string) => Promise<unknown> }) {
  await request.post(`${MOCK}/__test/reset`);
}

// Tunggu halaman hingga semua sumber daya dimuat dan React selesai hydrasi.
// Klik sebelum hydrasi akan gagal karena onClick belum terpasang.
async function waitForPageReady(page: Page) {
  await page.waitForLoadState("networkidle", { timeout: 30_000 });
}

function row(page: Page, title: string) {
  return page.locator(".conversation-row", { hasText: title });
}

test.describe("Delete conversation — browser E2E (mock Supabase HTTP)", () => {
  test("A. confirm control appears and is enabled", async ({ page }) => {
    await resetMock({ post: (u) => page.request.post(u) });
    await signIn(page);
    await page.goto("/assistant");
    await waitForPageReady(page);

    const delBtn = row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" });
    await expect(delBtn).toBeVisible();
    await delBtn.click();

    const confirmBtn = row(page, CONV_A).getByRole("button", { name: "Konfirmasi hapus" });
    await expect(confirmBtn).toBeVisible();
    await expect(confirmBtn).toBeEnabled();
  });

  test("B. cancel via new conversation keeps the conversation", async ({ page }) => {
    await resetMock({ post: (u) => page.request.post(u) });
    await signIn(page);
    await page.goto("/assistant");
    await waitForPageReady(page);

    await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
    await page.getByRole("button", { name: "+ Percakapan Baru" }).click();

    await expect(row(page, CONV_A)).toBeVisible();
    await expect(
      row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }),
    ).toBeVisible();
  });

  test("C. switching conversation cancels the open confirmation", async ({ page }) => {
    await resetMock({ post: (u) => page.request.post(u) });
    await signIn(page);
    await page.goto("/assistant");
    await waitForPageReady(page);

    await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
    await row(page, CONV_B).locator(".conversation-item").click();

    // A confirmation cancelled, B active.
    await expect(
      row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }),
    ).toBeVisible();
    await expect(row(page, CONV_B).locator(".conversation-item")).toHaveClass(/active/);
  });

  test("D. successful delete removes conversation and sends user_id filter", async ({ page }) => {
    await resetMock({ post: (u) => page.request.post(u) });
    await signIn(page);
    await page.goto("/assistant");
    await waitForPageReady(page);

    await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
    await row(page, CONV_A).getByRole("button", { name: "Konfirmasi hapus" }).click();

    await expect(row(page, CONV_A)).toHaveCount(0);
    await expect(row(page, CONV_B)).toBeVisible();

    const res = await page.request.get(`${MOCK}/__test/recordedDeletes`);
    const deletes = (await res.json()) as Array<{ id: string; user_id: string }>;
    expect(deletes.length).toBe(1);
    expect(deletes[0].user_id).toBe(`eq.${USER_ID}`);
  });

  test("server: unauthenticated request is redirected to /login", async ({ page }) => {
    await page.goto("/assistant");
    await expect(page).toHaveURL(/\/login/);
  });

  test("server: database failure surfaces an error and keeps the conversation", async ({ page }) => {
    await resetMock({ post: (u) => page.request.post(u) });
    await page.request.post(`${MOCK}/__test/deleteFailNext`);
    await signIn(page);
    await page.goto("/assistant");
    await waitForPageReady(page);

    await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
    await row(page, CONV_A).getByRole("button", { name: "Konfirmasi hapus" }).click();

    await expect(page.getByText("Gagal menghapus percakapan.")).toBeVisible();
    await expect(row(page, CONV_A)).toBeVisible();
  });
});