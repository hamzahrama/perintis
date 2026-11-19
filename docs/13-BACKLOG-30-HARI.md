# Product Backlog — PERINTIS (30 Hari)

Status: `[ ]` belum · `[-]` dikerjakan · `[x]` selesai dan diverifikasi.  
Prioritas: P0 inti · P1 penting · P2 bila waktu cukup. Detail keputusan: `docs/15-DECISION-LOG.md`.

## Sprint 0 — Alignment (Hari 1–3)

| Hari | Fokus | Status | Catatan |
|---|---|:---:|---|
| 1 | Audit desain dan repository | [-] | Adaptasi mobile tujuh area belum diverifikasi. |
| 2 | User flow dan functional specification | [-] | Matriks status aktivitas OPEN-014. |
| 3 | ERD dan keputusan teknis | [-] | Timezone, commitment, roadmap status masih OPEN. |

## Sprint 1 — Fondasi (Hari 4–8)

| Hari | Fokus | Status | Catatan |
|---|---|:---:|---|
| 4 | Setup Next.js, TypeScript, lint, build | [x] | Lint, typecheck, build lulus. |
| 5 | Supabase lokal, schema, RLS, fixture demo | [x] | Migration dan isolasi data diverifikasi. |
| 6 | Register, login, logout, proteksi route | [x] | Matcher route fitur dilengkapi. |
| 7 | Global UI, sidebar, tema responsif | [-] | Adaptasi mobile tujuh area belum diverifikasi; aset Stitch belum tersedia. |
| 8 | Profile dan preferences | [x] | Isolasi data antar-user diverifikasi. |

## Sprint 2 — Personal Growth (Hari 9–14)

| Hari | Fokus | Status | Catatan |
|---|---|:---:|---|
| 9 | Onboarding assessment | [x] | Simpan jawaban dan redirect terverifikasi. |
| 10 | Dashboard dari data user | [x] | Tanpa statistik hardcoded. |
| 11 | My Direction: CRUD goal | [x] | Detail dan arsip tersedia. |
| 12 | Remember Your Why | [x] | Terkait goal milik user. |
| 13 | My Roadmap | [x] | CRUD, urutan, status langkah tersedia. |
| 14 | Know Your Next Step | [x] | Simpan pilihan ke aktivitas tersedia. |

## Sprint 3 — Daily Execution (Hari 15–20)

| Hari | Fokus | Status | Catatan |
|---|---|:---:|---|
| 15 | Daily Guidance | [-] | Filter tanggal, timezone, riwayat status belum lengkap. |
| 16 | Reschedule dan skip | [x] | UI, status, dan riwayat transisi (OPEN-014) diverifikasi. |
| 17 | My Habits | [-] | CRUD habit, log harian, anti-duplikat dikerjakan; smoke DB belum. |
| 18 | Reminder in-app | [-] | Reminder CRUD dikerjakan; pemeriksaan due saat buka app belum. |
| 19 | My Commitment | [-] | Komitmen sukarela dan nonaktif tersedia; edit target belum lengkap. |
| 20 | Calendar View | [ ] | Sumber data sama dengan planner dan habit. |

## Sprint 4 — Coach & Evaluation (Hari 21–25)

| Hari | Fokus | Status | Catatan |
|---|---|:---:|---|
| 21–22 | Personal Coach | [ ] | Panduan statis; tanpa AI live/chat bebas. |
| 23 | Daily Reflection | [ ] | Simpan per user dan tanggal. |
| 24 | Weekly Growth Review | [ ] | Hitungan aktual Senin–Minggu lokal. |
| 25 | Progress Analytics | [ ] | Metrik aktual; tanpa skor palsu. |

## Sprint 5 — QA dan Demo (Hari 26–30)

| Hari | Fokus | Status | Catatan |
|---|---|:---:|---|
| 26 | Integrasi end-to-end | [ ] | Goal sampai reflection. |
| 27 | Security dan data QA | [ ] | RLS, validasi, secret, relasi. |
| 28 | Responsive dan UX QA | [ ] | Desktop, mobile, empty/error states. |
| 29 | Deploy dan bug fix | [ ] | Migration, deploy, smoke test. |
| 30 | Demo dan handover | [ ] | Demo aman, README, known issues. |

## Review saat ini

- Blocker: OPEN-014 matriks transisi aktivitas; OPEN-022 sumber timezone.
- Gap kritis: Day 14 belum menyimpan pilihan; route matcher belum mencakup fitur baru.
- Verifikasi terakhir: `npm run lint`, `npm run typecheck`, `npm run build` lulus pada Day 15.
- Aturan: update baris terkait setelah tiap task; `[x]` hanya setelah verifikasi relevan.
