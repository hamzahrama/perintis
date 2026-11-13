# Arsitektur dan Teknologi — PERINTIS

## 1. Status

Stack berikut disetujui untuk MVP demo dengan target biaya layanan **$0** (DEC-026 di Decision Log). Baseline ERD konseptual juga disetujui (DEC-028), tetapi schema/migration tetap pekerjaan terpisah setelah detail OPEN terkait ditetapkan.

## 2. Stack MVP yang disetujui

| Lapisan | Pilihan | Catatan |
|---|---|---|
| Runtime | Node.js 24 LTS | Gunakan patch security terbaru di lini 24.x. |
| Framework | Next.js App Router 16.4.x | Gunakan patch stabil/security terbaru; versi rujukan saat keputusan: 16.4.5. |
| Bahasa | TypeScript | Aktifkan strict type checking. |
| Styling | Tailwind CSS 4 | Cocok untuk implementasi responsif dari desain Stitch. |
| Database | Supabase PostgreSQL | Gunakan Singapore jika tersedia (DEC-034); aktifkan RLS pada seluruh data privat. |
| Authentication | Supabase Auth | Sesi server-side menggunakan cookies. |
| Data access | `@supabase/ssr` + `@supabase/supabase-js`; Prisma 7.10.1 untuk schema tooling | Prisma ditambahkan atas instruksi pengguna (DEC-037). Belum ada Prisma model/client/migration; SQL migration Supabase tetap sumber schema. Sebelum Prisma dipakai untuk query privat, tetapkan integrasi sesi user dan RLS. |
| Validasi | Zod | Validasi di server; jangan percaya ID user dari client. |
| Deployment | Vercel Hobby | Demo pribadi; pahami batas free tier sebelum penggunaan publik/komersial. |
| Package manager | npm | Disetujui pada DEC-036; gunakan satu lockfile. |

Komponen UI (mis. shadcn/ui), library grafik, dan test runner tambahan belum dipilih (OPEN-019). Baseline pemeriksaan: lint, typecheck, dan build; jangan tambah dependency testing/komponen/grafik kecuali kebutuhan nyata muncul dan disetujui (DEC-036).

## 3. Biaya, risiko, dan alternatif

- **Target $0:** Supabase Free dan Vercel Hobby cukup untuk demo pribadi. Supabase Free saat ini membatasi database 500 MB dan dapat pause setelah satu minggu tidak aktif. Vercel Hobby memiliki batas jadwal Cron sekali sehari dengan presisi ±59 menit.
- **Reminder:** sesuai DEC-033, periksa notifikasi in-app saat aplikasi dibuka. Tidak ada jaminan delivery saat aplikasi tertutup atau real-time.
- **Naik kelas:** harga resmi yang diperiksa menunjukkan Supabase Pro mulai sekitar $25/bulan dan Vercel Pro $20/bulan; total awal sekitar $45/bulan sebelum overage/layanan tambahan. Harga dan batas dapat berubah.
- **Alternatif:** Neon/PostgreSQL + Auth.js/Better Auth + Prisma memberi portabilitas dan ORM eksplisit, tetapi menambah setup auth, koneksi database, dan konfigurasi sesi dibanding Supabase terpadu.
- **Risiko Supabase:** RLS harus benar di semua tabel; publishable key boleh ada di client hanya bersama kebijakan RLS yang ketat. Jangan pernah mengekspos secret/service-role key. Free tier tidak menjamin availability untuk demo yang lama tidak aktif.

Versi Next yang direkomendasikan berdasarkan sumber resmi per 13 November 2026 adalah lini 16.4.x dengan patch 16.4.5 sebagai patch security yang tersedia saat audit. Pertahankan patch terbaru, jangan pin ke versi rentan.

## 4. Modul domain awal

Modul yang kemungkinan dibutuhkan:
- Authentication dan User.
- User Profile dan Preferences.
- Onboarding / Assessment.
- Goals / My Direction.
- Why Statements / Remember Your Why.
- Roadmap dan Roadmap Steps.
- Next Step Suggestions dan User Choices.
- Daily Tasks / Daily Guidance.
- Habits dan Habit Logs.
- Reminders dan Notifications.
- Daily Reflections.
- Weekly Reviews.
- Progress Analytics.
- Commitments.
- Calendar aggregation.

Daftar ini adalah pengelompokan domain awal berdasarkan MVP, bukan skema database final.

## 5. Relasi data konseptual

- Satu user memiliki satu profil dan preferensi.
- Satu user dapat memiliki beberapa goal.
- Satu goal dapat memiliki satu alasan personal dan paling banyak satu roadmap aktif.
- Satu roadmap memiliki beberapa langkah.
- Langkah dapat menghasilkan aktivitas terjadwal.
- Satu user dapat memiliki beberapa habit dan catatan pelaksanaannya.
- Aktivitas dapat memiliki status selesai, dijadwalkan ulang, atau dilewati.
- Refleksi harian dan review mingguan dimiliki user.
- Commitment terkait dengan aktivitas/tujuan yang dipilih pengguna.
- Notification/reminder dimiliki user dan mengikuti preferensi pengguna.

Detail kardinalitas, kolom, constraint, dan indeks harus dirancang sebelum migrasi database dibuat.

## 6. Arsitektur aplikasi

- Struktur awal sederhana:
  - `src/app/` untuk route/layout App Router, dikelompokkan untuk auth dan area aplikasi.
  - `src/components/` untuk komponen UI bersama.
  - `src/features/<domain>/` untuk UI dan operasi domain yang benar-benar dipakai bersama.
  - `src/lib/supabase/` untuk client browser/server dan sesi.
  - `src/lib/validation/` untuk schema Zod.
- Validasi input di server dan batasi query berdasarkan user dari sesi.
- Aktifkan RLS pada seluruh tabel privat; jangan mengandalkan filter UI.
- Jangan mempercayai user ID yang dikirim bebas dari client.
- Gunakan zona waktu lokal pengguna untuk tampilan tanggal/ringkasan dan simpan timestamp secara konsisten.
- Pisahkan seed/demo dari data pengguna; jangan membuat statistik palsu.

### Testing dan environment (rekomendasi setup)

- CI minimum: lint, `tsc --noEmit`, dan production build.
- Tambahkan Vitest untuk fungsi domain/validasi dan satu Playwright E2E untuk register → onboarding → goal → task → reflection; persetujuan/install dependency test dilakukan saat setup.
- Simpan nilai lokal di `.env.local` yang di-ignore Git dan sediakan `.env.example` berisi nama variabel tanpa secret.
- `NEXT_PUBLIC_SUPABASE_URL` dan publishable key boleh di client; secret/service-role key tidak boleh diekspos ke browser.
- Pisahkan project/credentials development dan production. Jangan commit file env berisi nilai rahasia.

## 7. Keputusan teknis yang masih terbuka

1. Baseline ERD disetujui (DEC-028); detail schema/migration menunggu OPEN-022–024 dan task implementasi terpisah.
2. Verifikasi Supabase Singapore tersedia saat provisioning (DEC-034); jika tidak, minta keputusan pengguna.
3. Retensi sebelum rilis publik masih OPEN-013; untuk demo berlaku prosedur manual DEC-030.
4. Sumber/penyimpanan zona waktu IANA (OPEN-022).
5. Apakah My Commitment boleh generik atau harus terikat target (OPEN-023).
6. Field form dan status Goal/Roadmap Step/Habit sebelum schema domain terkait (OPEN-024).
7. Library UI/grafik/test runner tambahan tetap OPEN-019; baseline npm dan lint/typecheck/build ditetapkan DEC-036.

## 8. Saran implementasi untuk proyek satu bulan

- Gunakan arsitektur modular secukupnya, jangan membuat abstraksi berlebihan.
- Bangun satu alur end-to-end lebih dahulu: register → onboarding → goal → roadmap → daily task → reflection.
- Personal Coach mengikuti keputusan FIX: panduan terstruktur, bukan AI live, dan percakapan tidak disimpan.
- Implementasikan fitur dengan kedalaman minimum yang dapat didemokan.
- Jangan membangun infrastruktur kompleks sebelum kebutuhan MVP terbukti.
