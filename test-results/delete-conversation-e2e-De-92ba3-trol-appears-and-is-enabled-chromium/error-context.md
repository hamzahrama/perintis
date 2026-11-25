# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: delete-conversation-e2e.spec.ts >> Delete conversation — browser E2E (mock Supabase HTTP) >> A. confirm control appears and is enabled
- Location: tests/delete-conversation-e2e.spec.ts:54:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.conversation-row').filter({ hasText: 'Test Conversation A' }).getByRole('button', { name: 'Konfirmasi hapus' })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.conversation-row').filter({ hasText: 'Test Conversation A' }).getByRole('button', { name: 'Konfirmasi hapus' }) with timeout 15000ms
  - waiting for locator('.conversation-row').filter({ hasText: 'Test Conversation A' }).getByRole('button', { name: 'Konfirmasi hapus' })

```

```yaml
- banner:
  - link "PERINTIS":
    - /url: /
  - button "Ganti ke tema terang": Mode terang
- complementary:
  - navigation "Navigasi utama":
    - paragraph: Menu
    - heading "Beranda" [level=3]
    - link "Ringkasan":
      - /url: /dashboard
    - heading "Arah & Tujuan" [level=3]
    - link "My Direction":
      - /url: /goals
    - link "Roadmap":
      - /url: /goals
    - link "Remember Your Why":
      - /url: /goals
    - heading "Eksekusi Harian" [level=3]
    - link "Daily Guidance":
      - /url: /daily
    - link "My Habits":
      - /url: /habits
    - link "Calendar":
      - /url: /calendar
    - link "Reminder":
      - /url: /reminders
    - link "My Commitment":
      - /url: /commitment
    - link "Coach":
      - /url: /coach
    - heading "Refleksi & Progres" [level=3]
    - link "Daily Reflection":
      - /url: /reflection
    - link "Weekly Review":
      - /url: /review
    - link "Analytics":
      - /url: /analytics
    - heading "Pendamping" [level=3]
    - link "Wise Personal Growth Mentor":
      - /url: /assistant
    - link "Profil & Pengaturan":
      - /url: /profile
  - paragraph: Sesi akun aktif
  - button "Keluar"
- main:
  - main:
    - heading "Wise Personal Growth Mentor" [level=1]
    - paragraph: Temani dirimu memahami tantangan dan menemukan arah pertumbuhanmu.
    - complementary:
      - button "+ Percakapan Baru"
      - button "Test Conversation A11/25/2026"
      - button "Hapus percakapan": 🗑
      - button "Test Conversation B11/25/2026"
      - button "Hapus percakapan": 🗑
    - button "Riwayat Percakapan"
    - text: 🌱
    - heading "Ada yang bisa aku bantu hari ini?" [level=2]
    - paragraph: "Aku memahami goals dan jadwalmu. Coba tanya sesuatu:"
    - button "Bantu aku mulai dari langkah yang sangat kecil"
    - button "Aku merasa kewalahan dengan jadwalku hari ini"
    - button "Kenapa aku sering sulit konsisten?"
    - button "Apa yang bisa aku lakukan dalam 5 menit sekarang?"
    - button "Ayo tinjau kemajuan tujuanku minggu ini"
    - button "Aku baru saja melewati satu aktivitas, gimana ya?"
    - textbox "Ketik pesan... (Shift+Enter untuk baris baru)"
    - text: 0/4000
    - button "Kirim" [disabled]
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | 
  3   | // Mock Supabase (tests/mock-supabase-server.mjs) + Next dev server are started
  4   | // by playwright.config.ts. These tests exercise the REAL server action and the
  5   | // REAL ChatInterface UI in a browser; only the Supabase backend is faked at the
  6   | // HTTP level. Real RLS and DB cascade are NOT exercised (see report).
  7   | 
  8   | const MOCK = "http://127.0.0.1:4599";
  9   | const USER_ID = "test-user-auth-123";
  10  | const CONV_A = "Test Conversation A";
  11  | const CONV_B = "Test Conversation B";
  12  | 
  13  | function sessionCookieValue(accessToken: string, userId: string): string {
  14  |   const session = {
  15  |     access_token: accessToken,
  16  |     refresh_token: "test-refresh-token",
  17  |     expires_in: 3600,
  18  |     expires_at: Math.floor(Date.now() / 1000) + 3600,
  19  |     token_type: "bearer",
  20  |     user: { id: userId, email: "test@example.com" },
  21  |   };
  22  |   return `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
  23  | }
  24  | 
  25  | // Storage key is sb-<hostname-first-label>-auth-token; host is 127.0.0.1 -> "127".
  26  | const COOKIE_NAME = "sb-127-auth-token";
  27  | 
  28  | async function signIn(page: Page, accessToken = "test-access-token", userId = USER_ID) {
  29  |   await page.context().addCookies([
  30  |     {
  31  |       name: COOKIE_NAME,
  32  |       value: sessionCookieValue(accessToken, userId),
  33  |       domain: "127.0.0.1",
  34  |       path: "/",
  35  |     },
  36  |   ]);
  37  | }
  38  | 
  39  | async function resetMock(request: { post: (u: string) => Promise<unknown> }) {
  40  |   await request.post(`${MOCK}/__test/reset`);
  41  | }
  42  | 
  43  | // Tunggu halaman hingga semua sumber daya dimuat dan React selesai hydrasi.
  44  | // Klik sebelum hydrasi akan gagal karena onClick belum terpasang.
  45  | async function waitForPageReady(page: Page) {
  46  |   await page.waitForLoadState("networkidle", { timeout: 30_000 });
  47  | }
  48  | 
  49  | function row(page: Page, title: string) {
  50  |   return page.locator(".conversation-row", { hasText: title });
  51  | }
  52  | 
  53  | test.describe("Delete conversation — browser E2E (mock Supabase HTTP)", () => {
  54  |   test("A. confirm control appears and is enabled", async ({ page }) => {
  55  |     await resetMock({ post: (u) => page.request.post(u) });
  56  |     await signIn(page);
  57  |     await page.goto("/assistant");
  58  |     await waitForPageReady(page);
  59  | 
  60  |     const delBtn = row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" });
  61  |     await expect(delBtn).toBeVisible();
  62  |     await delBtn.click();
  63  | 
  64  |     const confirmBtn = row(page, CONV_A).getByRole("button", { name: "Konfirmasi hapus" });
> 65  |     await expect(confirmBtn).toBeVisible();
      |                              ^ Error: expect(locator).toBeVisible() failed
  66  |     await expect(confirmBtn).toBeEnabled();
  67  |   });
  68  | 
  69  |   test("B. cancel via new conversation keeps the conversation", async ({ page }) => {
  70  |     await resetMock({ post: (u) => page.request.post(u) });
  71  |     await signIn(page);
  72  |     await page.goto("/assistant");
  73  |     await waitForPageReady(page);
  74  | 
  75  |     await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
  76  |     await page.getByRole("button", { name: "+ Percakapan Baru" }).click();
  77  | 
  78  |     await expect(row(page, CONV_A)).toBeVisible();
  79  |     await expect(
  80  |       row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }),
  81  |     ).toBeVisible();
  82  |   });
  83  | 
  84  |   test("C. switching conversation cancels the open confirmation", async ({ page }) => {
  85  |     await resetMock({ post: (u) => page.request.post(u) });
  86  |     await signIn(page);
  87  |     await page.goto("/assistant");
  88  |     await waitForPageReady(page);
  89  | 
  90  |     await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
  91  |     await row(page, CONV_B).locator(".conversation-item").click();
  92  | 
  93  |     // A confirmation cancelled, B active.
  94  |     await expect(
  95  |       row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }),
  96  |     ).toBeVisible();
  97  |     await expect(row(page, CONV_B).locator(".conversation-item")).toHaveClass(/active/);
  98  |   });
  99  | 
  100 |   test("D. successful delete removes conversation and sends user_id filter", async ({ page }) => {
  101 |     await resetMock({ post: (u) => page.request.post(u) });
  102 |     await signIn(page);
  103 |     await page.goto("/assistant");
  104 |     await waitForPageReady(page);
  105 | 
  106 |     await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
  107 |     await row(page, CONV_A).getByRole("button", { name: "Konfirmasi hapus" }).click();
  108 | 
  109 |     await expect(row(page, CONV_A)).toHaveCount(0);
  110 |     await expect(row(page, CONV_B)).toBeVisible();
  111 | 
  112 |     const res = await page.request.get(`${MOCK}/__test/recordedDeletes`);
  113 |     const deletes = (await res.json()) as Array<{ id: string; user_id: string }>;
  114 |     expect(deletes.length).toBe(1);
  115 |     expect(deletes[0].user_id).toBe(`eq.${USER_ID}`);
  116 |   });
  117 | 
  118 |   test("server: unauthenticated request is redirected to /login", async ({ page }) => {
  119 |     await page.goto("/assistant");
  120 |     await expect(page).toHaveURL(/\/login/);
  121 |   });
  122 | 
  123 |   test("server: database failure surfaces an error and keeps the conversation", async ({ page }) => {
  124 |     await resetMock({ post: (u) => page.request.post(u) });
  125 |     await page.request.post(`${MOCK}/__test/deleteFailNext`);
  126 |     await signIn(page);
  127 |     await page.goto("/assistant");
  128 |     await waitForPageReady(page);
  129 | 
  130 |     await row(page, CONV_A).getByRole("button", { name: "Hapus percakapan" }).click();
  131 |     await row(page, CONV_A).getByRole("button", { name: "Konfirmasi hapus" }).click();
  132 | 
  133 |     await expect(page.getByText("Gagal menghapus percakapan.")).toBeVisible();
  134 |     await expect(row(page, CONV_A)).toBeVisible();
  135 |   });
  136 | });
```