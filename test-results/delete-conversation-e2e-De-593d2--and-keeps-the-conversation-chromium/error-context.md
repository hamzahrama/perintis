# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: delete-conversation-e2e.spec.ts >> Delete conversation — browser E2E (mock Supabase HTTP) >> server: database failure surfaces an error and keeps the conversation
- Location: tests/delete-conversation-e2e.spec.ts:123:3

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.click: Test timeout of 60000ms exceeded.
Call log:
  - waiting for locator('.conversation-row').filter({ hasText: 'Test Conversation A' }).getByRole('button', { name: 'Konfirmasi hapus' })

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - banner [ref=f1e3]:
    - link "PERINTIS" [ref=f1e4] [cursor=pointer]:
      - /url: /
    - button "Ganti ke tema terang" [ref=f1e7] [cursor=pointer]: Mode terang
  - complementary [ref=f1e8]:
    - navigation "Navigasi utama" [ref=f1e9]:
      - paragraph [ref=f1e10]: Menu
      - generic [ref=f1e11]:
        - heading "Beranda" [level=3] [ref=f1e12]
        - link "Ringkasan" [ref=f1e13] [cursor=pointer]:
          - /url: /dashboard
      - generic [ref=f1e14]:
        - heading "Arah & Tujuan" [level=3] [ref=f1e15]
        - link "My Direction" [ref=f1e16] [cursor=pointer]:
          - /url: /goals
        - link "Roadmap" [ref=f1e17] [cursor=pointer]:
          - /url: /goals
        - link "Remember Your Why" [ref=f1e18] [cursor=pointer]:
          - /url: /goals
      - generic [ref=f1e19]:
        - heading "Eksekusi Harian" [level=3] [ref=f1e20]
        - link "Daily Guidance" [ref=f1e21] [cursor=pointer]:
          - /url: /daily
        - link "My Habits" [ref=f1e22] [cursor=pointer]:
          - /url: /habits
        - link "Calendar" [ref=f1e23] [cursor=pointer]:
          - /url: /calendar
        - link "Reminder" [ref=f1e24] [cursor=pointer]:
          - /url: /reminders
        - link "My Commitment" [ref=f1e25] [cursor=pointer]:
          - /url: /commitment
        - link "Coach" [ref=f1e26] [cursor=pointer]:
          - /url: /coach
      - generic [ref=f1e27]:
        - heading "Refleksi & Progres" [level=3] [ref=f1e28]
        - link "Daily Reflection" [ref=f1e29] [cursor=pointer]:
          - /url: /reflection
        - link "Weekly Review" [ref=f1e30] [cursor=pointer]:
          - /url: /review
        - link "Analytics" [ref=f1e31] [cursor=pointer]:
          - /url: /analytics
      - generic [ref=f1e32]:
        - heading "Pendamping" [level=3] [ref=f1e33]
        - link "Wise Personal Growth Mentor" [ref=f1e34] [cursor=pointer]:
          - /url: /assistant
        - link "Profil & Pengaturan" [ref=f1e35] [cursor=pointer]:
          - /url: /profile
    - generic [ref=f1e36]:
      - paragraph [ref=f1e37]: Sesi akun aktif
      - button "Keluar" [ref=f1e39] [cursor=pointer]
  - main [ref=f1e40]:
    - main [ref=f1e41]:
      - generic [ref=f1e42]:
        - heading "Wise Personal Growth Mentor" [level=1] [ref=f1e43]
        - paragraph [ref=f1e44]: Temani dirimu memahami tantangan dan menemukan arah pertumbuhanmu.
      - generic [ref=f1e45]:
        - complementary [ref=f1e46]:
          - button "+ Percakapan Baru" [ref=f1e47] [cursor=pointer]
          - generic [ref=f1e48]:
            - generic [ref=f1e49]:
              - button "Test Conversation A11/25/2026" [ref=f1e50]
              - button "Hapus percakapan" [ref=f1e51] [cursor=pointer]: 🗑
            - generic [ref=f1e52]:
              - button "Test Conversation B11/25/2026" [ref=f1e53]
              - button "Hapus percakapan" [ref=f1e54] [cursor=pointer]: 🗑
        - button "Riwayat Percakapan" [ref=f1e55] [cursor=pointer]
        - generic [ref=f1e56]:
          - generic [ref=f1e58]:
            - generic [ref=f1e59]: 🌱
            - heading "Ada yang bisa aku bantu hari ini?" [level=2] [ref=f1e60]
            - paragraph [ref=f1e61]: "Aku memahami goals dan jadwalmu. Coba tanya sesuatu:"
            - generic [ref=f1e62]:
              - button "Bantu aku mulai dari langkah yang sangat kecil" [ref=f1e63]
              - button "Aku merasa kewalahan dengan jadwalku hari ini" [ref=f1e64]
              - button "Kenapa aku sering sulit konsisten?" [ref=f1e65]
              - button "Apa yang bisa aku lakukan dalam 5 menit sekarang?" [ref=f1e66]
              - button "Ayo tinjau kemajuan tujuanku minggu ini" [ref=f1e67]
              - button "Aku baru saja melewati satu aktivitas, gimana ya?" [ref=f1e68]
          - generic [ref=f1e69]:
            - generic [ref=f1e70]:
              - textbox "Ketik pesan... (Shift+Enter untuk baris baru)" [active] [ref=f1e71]
              - generic [ref=f1e72]: 0/4000
            - button "Kirim" [disabled] [ref=f1e73]
```

# Test source

```ts
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
  65  |     await expect(confirmBtn).toBeVisible();
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
> 131 |     await row(page, CONV_A).getByRole("button", { name: "Konfirmasi hapus" }).click();
      |                                                                               ^ Error: locator.click: Test timeout of 60000ms exceeded.
  132 | 
  133 |     await expect(page.getByText("Gagal menghapus percakapan.")).toBeVisible();
  134 |     await expect(row(page, CONV_A)).toBeVisible();
  135 |   });
  136 | });
```