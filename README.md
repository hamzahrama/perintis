# PERINTIS — Paket Persiapan Development

**Personal Growth Guidance Platform**  
**Tagline:** “Mulai Hari Ini. Bangun Masa Depanmu.”  
**Tujuan:** Membantu pengerjaan MVP PERINTIS selama 30 hari dengan AI coding agent secara terarah.

## Cara menggunakan paket ini

1. Baca `01-PANDUAN-MULAI.md`.
2. Pindahkan folder `docs/` ini ke root repository PERINTIS.
3. Salin `AGENTS.md` ke root repository.
4. Berikan prompt pertama dari `07-PROMPT-UNTUK-AI-AGENT.md` kepada agent.
5. Kerjakan sprint berdasarkan `04-BACKLOG-30-HARI.md`.
6. Setiap keputusan baru dicatat di `06-DECISION-LOG.md`.
7. Setiap perubahan status tugas diperbarui di backlog.

## Peta dokumen

| File | Fungsi |
|---|---|
| `01-PANDUAN-MULAI.md` | Cara mengelola agent dan dokumentasi |
| `02-USER-FLOW.md` | Alur pengguna dari awal sampai evaluasi |
| `03-FUNCTIONAL-SPECIFICATION.md` | Perilaku yang wajib dilakukan setiap fitur |
| `04-BACKLOG-30-HARI.md` | Sprint, urutan kerja, dan Definition of Done |
| `05-ERD-BRIEF.md` | Panduan menurunkan kebutuhan menjadi ERD |
| `06-DECISION-LOG.md` | Tempat keputusan FIX/PROPOSED/OPEN |
| `07-PROMPT-UNTUK-AI-AGENT.md` | Prompt tahap demi tahap untuk coding agent |
| `AGENTS.md` | Instruksi tetap yang harus dibaca agent di repository |

## Status keputusan

- **FIX:** sudah disepakati pengguna. Jangan diubah tanpa izin.
- **PROPOSED:** rekomendasi agent/asisten yang menunggu persetujuan.
- **OPEN:** belum diputuskan.
- **DONE:** sudah dikerjakan dan diverifikasi.

Stack MVP sudah FIX pada DEC-026; baseline ERD konseptual dan keputusan tooling minimum dicatat pada DEC-028/036. Agent tetap harus membaca Decision Log untuk keputusan OPEN sebelum mengimplementasikan bagian terkait.

## Aturan penting

- Daftar fitur MVP berisi 19 item dalam lima kelompok. Jangan menambah fitur tanpa persetujuan.
- UI Stitch yang diberikan pengguna adalah referensi visual, bukan izin untuk mengarang perilaku backend.
- Jangan membuat data dummy seolah-olah data nyata.
- Jangan langsung menghasilkan seluruh aplikasi dalam satu prompt.
- Jangan mengubah keputusan FIX secara diam-diam.
- Untuk setiap sprint: rencanakan → implementasikan bagian kecil → jalankan pemeriksaan → laporkan hasil dan file yang berubah.

## Menjalankan fondasi aplikasi

```bash
npm install
npm run dev
```

`.env.local` sudah berisi URL pooler Supabase Singapore yang diberikan pengguna. Ganti `[YOUR-PASSWORD]` secara lokal pada kedua URL. Jangan kirim password lewat chat atau commit `.env.local`. Tambahkan URL dan publishable key Supabase ke file yang sama untuk menjalankan Auth lokal.

Prisma memakai `DIRECT_URL` (pooler session, port 5432) untuk perintah CLI dan `DATABASE_URL` (pooler transaction, port 6543) untuk koneksi client aplikasi di masa depan. Prisma 7 mengambil URL dari `prisma7.config.ts`, bukan dari `url`/`directUrl` di schema. Prisma CLI terpasang, tetapi schema belum diintrospeksi dan belum memiliki model. Migration SQL Supabase yang ada tetap menjadi sumber schema; jangan menjalankan Prisma migration sebelum strategi sinkronisasi/RLS dengan Supabase disetujui. Halaman Dashboard saat ini hanya menjadi tujuan sementara untuk memverifikasi sesi.

## Supabase lokal

Supabase CLI dijalankan sementara via `npx` dan membutuhkan Docker:

```bash
npx supabase start
npx supabase db reset
```

`db reset` menerapkan migration dan seed SQL yang sengaja kosong agar tidak membuat akun bersama atau mengisi data sintetis ke akun biasa. Untuk menyiapkan akun dan fixture demo lokal yang terpisah, jalankan:

```bash
npm run seed:demo:local
```

Script ini menolak URL non-loopback, membuat akun demo development dengan password acak, dan menyimpan kredensial hanya di `supabase/.temp/perintis-demo-account.json` (di-ignore Git, permission file terbatas). Jangan salin kredensial tersebut ke source, log, atau production. Fixture memakai prefix `DEMO`; reset database akan menghapus akun dan fixture dari database, lalu script dapat dijalankan lagi. Untuk Auth biasa, konfigurasi lokal tidak meminta konfirmasi email agar pendaftaran langsung membuat sesi.

Hentikan layanan lokal setelah selesai dengan `npx supabase stop`. Jangan gunakan seed atau kredensial development untuk production.

Pemeriksaan dasar:

```bash
npm run lint
npm run typecheck
npm run build
```
