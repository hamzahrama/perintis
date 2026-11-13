# PERINTIS — Database Security Strategy

**Status:** Rancangan untuk review; tidak mengubah grant, RLS, schema, atau koneksi.  
**Batas pemeriksaan:** berdasarkan migration lokal `supabase/migrations/20261113000000_initial_schema.sql` dan konfigurasi project. Tidak menjalankan introspection, query database, migration, atau perubahan schema dalam task ini.

## 1. Tujuan keamanan

1. Setiap data privat hanya dapat diakses pemilik yang sesi Supabase-nya valid.
2. Identitas owner berasal dari sesi/token terverifikasi, bukan `user_id` yang dipercaya dari browser.
3. Relasi antar entitas milik user yang sama dijaga di lapisan database.
4. Akses database privileged tidak melewati kebijakan RLS secara tidak sengaja.
5. Penghapusan akun dan retensi data mengikuti keputusan produk; tidak menyediakan hard-delete sembarang melalui UI MVP.

## 2. Keputusan FIX, rekomendasi, dan OPEN

### FIX

- Data pengguna terisolasi; Auth memakai Supabase Auth dan sesi server-side.
- `auth.users` adalah sumber identitas, bukan tabel credential aplikasi.
- Semua tabel privat harus dibatasi pada user login. Jangan mempercayai user ID dari client tanpa memverifikasi sesi.
- Database Supabase memakai RLS untuk tabel aplikasi privat; tidak menggunakan service-role key di browser.
- Goal diarsipkan, Habit dinonaktifkan, histori dijaga; tidak ada UI hapus akun pada demo. Permintaan penghapusan diproses manual (DEC-023/030).
- Personal Coach tidak menyimpan riwayat; Calendar/analytics/review adalah agregasi data transaksi.
- Prisma 7 telah disetujui sebagai tooling schema, tetapi Prisma untuk operasi privat belum disetujui (DEC-037).

### Rekomendasi PROPOSED

- Gunakan Supabase SDK dengan sesi pengguna untuk operasi CRUD user-facing. Ambil user dari `auth.getUser()`/verified session pada server; ambil `user_id` dari identitas tersebut.
- Terapkan RLS `USING` dan `WITH CHECK` berbasis `(select auth.uid()) = user_id` pada tabel milik user.
- Gunakan FK komposit `(parent_id,user_id)` agar ownership invariant juga enforced oleh PostgreSQL.
- Jangan memberi policy/grant `DELETE` ke `anon` atau `authenticated` pada domain yang diarsipkan atau memiliki histori.
- Pertahankan status history append-only untuk authenticated user; mutasi Activity dan event-nya satu transaksi serta divalidasi terhadap aturan status aplikasi.
- Jangan memakai Prisma Client dengan koneksi role `postgres` untuk query data privat. Pilihan MVP yang aman adalah mempertahankan Supabase SDK/RLS sampai role dan JWT context Prisma terbukti aman.
- Uji negatif lintas-user pada setiap tabel dan relasi, bukan hanya uji happy path. Tambahkan test SQL/RLS ketika fitur data dibangun; tidak ada test baru dibuat dalam task desain ini.

### OPEN

- OPEN-013: periode retensi rilis publik dan proses purge.
- OPEN-014: matriks transisi status Activity dan aturan konsistensi event.
- OPEN-022: sumber timezone.
- OPEN-023: target Commitment.
- OPEN-024: status Roadmap Step.
- Strategi resmi sinkronisasi Prisma schema dengan SQL migrations Supabase.
- Bila Prisma Client hendak mengakses data user: role database, cara memasukkan JWT claims Supabase pada transaksi, perilaku transaction pooler, dan mekanisme yang memastikan RLS tetap berjalan. Ini harus diputuskan dan diuji sebelum integrasi.

## 3. Diagram jalur identitas dan akses

```mermaid
flowchart LR
    B[Browser] -->|Cookie sesi Supabase| N[Next.js server]
    N -->|Verifikasi sesi / auth.getUser| A[Supabase Auth]
    A -->|User ID terverifikasi| N
    N -->|Supabase SDK dengan sesi user| P[PostgreSQL / Data API]
    P -->|RLS: auth.uid() = user_id| D[(Tabel privat)]
    N -. jangan kirim service role ke browser .-> S[Service-role / privileged access]
    S -. hanya job administratif khusus, belum dipakai .-> P
```

Diagram menunjukkan rekomendasi arsitektur user-facing; bukan klaim seluruh fitur sudah terimplementasi.

## 4. Inventaris tabel dan RLS

`auth.users` dikelola Supabase Auth. Seluruh 15 tabel aplikasi berikut merupakan data privat, perlu RLS, grants minimal, dan uji kepemilikan. Migration lokal yang ada sudah berisi `ENABLE ROW LEVEL SECURITY` pada semua 15 tabel tersebut dan policy owner-scoped `SELECT/INSERT/UPDATE`; remote belum diintrospeksi atau diverifikasi.

| Tabel | Owner invariant | RLS / access shape yang direkomendasikan |
|---|---|---|
| `profiles` | `user_id = auth.users.id` | SELECT/INSERT/UPDATE hanya self; tidak ada DELETE user-facing. |
| `user_preferences` | `user_id = auth.users.id` | SELECT/INSERT/UPDATE hanya self. |
| `onboarding_responses` | `user_id = auth.users.id` | SELECT/INSERT/UPDATE hanya self; jawaban assessment diperlakukan sebagai data personal. |
| `goals` | `user_id = auth.users.id` | SELECT/INSERT/UPDATE hanya self; archive lewat UPDATE; tidak ada DELETE UI. |
| `goal_whys` | `user_id` sama dengan Goal | SELECT/INSERT/UPDATE self dan relasi komposit; tidak ada DELETE UI bila histori dipertahankan. |
| `roadmaps` | `user_id` sama dengan Goal | SELECT/INSERT/UPDATE self; partial unique index menjaga satu aktif per Goal. |
| `roadmap_steps` | `user_id` sama dengan Roadmap | SELECT/INSERT/UPDATE self; urutan unik per Roadmap. |
| `activities` | `user_id` sama dengan Step bila ada | SELECT/INSERT/UPDATE self; jangan izinkan relasi ke Step milik user lain. |
| `activity_status_events` | `user_id` sama dengan Activity | SELECT/INSERT hanya; jangan grant UPDATE/DELETE kepada authenticated; event harus berkaitan dengan Activity milik user. |
| `habits` | `user_id = auth.users.id`; Goal opsional dengan owner sama | SELECT/INSERT/UPDATE self; deactivate lewat UPDATE. |
| `habit_logs` | `user_id` sama dengan Habit | SELECT/INSERT/UPDATE self; unique per Habit/tanggal. |
| `reminders` | `user_id` sama dengan Activity | SELECT/INSERT/UPDATE self; reminder hanya milik Activity user yang sama. |
| `notifications` | `user_id` sama dengan Reminder | SELECT/INSERT/UPDATE self; baca/tandai dibaca hanya milik user. |
| `daily_reflections` | `user_id = auth.users.id` | SELECT/INSERT/UPDATE self; satu row per user/tanggal. |
| `commitments` | `user_id` sama dengan target Activity/Goal bila ada | SELECT/INSERT/UPDATE self; validasi aturan target sesuai keputusan OPEN-023; tidak pernah mengeksekusi konsekuensi otomatis. |

`auth.users` memakai perlindungan internal Supabase Auth dan tidak diekspos sebagai tabel CRUD profil aplikasi. Pengguna menerima data profil terbatas dari `profiles`, bukan mengelola kolom credential.

## 5. Ownership dan query scoping

### Alur server yang direkomendasikan

1. Verifikasi sesi pengguna dengan API Auth server-side Supabase. Jangan menganggap keberadaan cookie atau nilai metadata sebagai bukti cukup.
2. Bentuk Supabase server client yang membawa sesi user, bukan service-role client.
3. Untuk membuat row, tetapkan `user_id` dari user yang diverifikasi server. Jika payload berisi user ID, abaikan atau tolak; jangan dipakai sebagai otoritas.
4. Untuk membaca/mengubah row, query memakai kunci row dan `user_id` hasil verifikasi bila sesuai, serta biarkan RLS menjadi defense-in-depth.
5. Untuk operasi parent-child, validasi parent milik user dan biarkan FK komposit mengunci relasi saat commit.
6. Tangani error dan row count eksplisit; jangan membuat respons sukses bila UPDATE dibatasi RLS dan tidak menyentuh row.
7. Jangan pernah mengirim Supabase secret/service-role key atau kredensial database ke client, log, atau dokumentasi.

### Contoh invariant

- Membuat Activity di Step lain user: ditolak oleh FK komposit meskipun UUID valid.
- Memperbarui row dengan `user_id` user lain: ditolak oleh `USING`/`WITH CHECK` RLS.
- Menandai notification milik user lain sebagai dibaca: tidak menemukan row yang dapat diakses; UI tidak mengungkap data pemilik lain.
- Melihat jadwal lintas user di Calendar: semua sumber query dibatasi user/session; Calendar tidak menyimpan salinan lintas data.

RLS tidak menggantikan pemeriksaan otorisasi di server, dan filter `user_id` di aplikasi tidak menggantikan RLS.

## 6. Pemeriksaan migration lokal (tanpa introspection)

Migration lokal yang diperiksa mencakup:

- 15 tabel privat dengan RLS diaktifkan.
- `REVOKE ALL` ke `anon` dan `authenticated`, dilanjutkan grant eksplisit untuk operasi tertentu.
- Policy `SELECT/INSERT/UPDATE` dengan syarat `user_id = (select auth.uid())`.
- Policy `activity_status_events` hanya untuk baca dan append (`SELECT`, `INSERT`), konsisten dengan append-only di privilege level.
- Composite foreign keys dan `UNIQUE(id,user_id)` pada parent untuk membatasi relasi lintas user.
- Trigger Auth membuat `profiles` dan `user_preferences`.
- Fungsi trigger berada di schema `private`, `search_path` kosong, dan privilege execute dicabut dari role publik.

Hal yang tetap perlu diverifikasi saat pengujian schema, tidak diasumsikan dari file:

- RLS benar-benar aktif dan grants/policy sama pada database remote yang akan digunakan.
- Trigger tidak menghalangi pendaftaran tanpa `full_name`; server saat ini mewajibkan nama, tetapi constraint dan trigger harus diuji konsisten.
- Event Activity tidak dapat dipalsukan atau tidak konsisten dengan state karena authenticated role saat ini mendapat grant `INSERT` langsung. Pertimbangkan transaksi server-side/DB function dengan validasi state; hindari `SECURITY DEFINER` tanpa review.
- Kebijakan delete cascade sesuai retensi saat purge dilakukan. FK cascade hanya menjelaskan dampak penghapusan parent, tidak menetapkan siapa yang boleh memulai purge.
- Perbedaan antara `user_preferences.reminder_enabled` dan `reminders.is_enabled` tidak menimbulkan perilaku toggle yang ambigu.
- Semua policy diuji lintas pemilik termasuk relasi opsional, insert/update, duplicate unique key, dan edge case tanggal/timezone.

Tidak ada satu pun pemeriksaan di atas yang dilakukan terhadap remote dalam task penyusunan dokumen ini.

## 7. Prisma 7 dan RLS: risiko khusus

- Konfigurasi Prisma 7 memuat datasource URL di `prisma7.config.ts`; schema generator `prisma-client` tidak otomatis membawa konteks sesi Supabase.
- Pooler transaction/session mengatur pemakaian koneksi, bukan identitas user aplikasi. Koneksi dengan kredensial database privileged bukan koneksi user Supabase.
- `auth.uid()` pada query server direct Prisma dapat bernilai NULL atau tidak mencerminkan user kecuali role dan JWT claims disetel benar pada koneksi/transaksi yang sama.
- Jangan mengandalkan filter `where: { userId }` Prisma sebagai pengganti RLS. Kesalahan query dapat mengekspos data tenant lain.
- Penggunaan Prisma Client untuk data privat harus menunggu desain eksplisit dan uji bahwa `SET ROLE`/claims transaction-local aman melalui pooler yang dipilih, tidak bocor antar request, dan tetap menjalankan RLS.
- Jangan membuat Prisma migration yang mengelola `auth.users`, policy, trigger, grants, atau objek yang sudah dimiliki migration SQL. Hindari dua sumber kebenaran schema.
- **Rekomendasi MVP:** Supabase SDK user-scoped untuk Auth dan operasi data privat. Prisma tetap tooling schema sampai pengguna menyetujui strategi integrasi.

## 8. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi yang direkomendasikan |
|---|---|---|
| Server memakai role yang bypass RLS | Kebocoran lintas user walau frontend membatasi UI | Gunakan Supabase user session client; jangan Prisma privileged untuk data privat. |
| `user_id` diterima dari browser | IDOR/BOLA | Derive owner dari sesi terverifikasi; RLS + FK komposit. |
| Hanya memakai RLS tanpa FK komposit | Child dapat menunjuk parent user lain akibat bug insert | Terapkan composite FK untuk semua relasi privat. |
| Event status dapat dipalsukan atau mismatch dengan Activity | Histori/analytics tidak akurat | Transaksi atomik, validasi state transition, role grant append-only; aturan transisi tetap OPEN-014. |
| Direct URL privileged disalahgunakan | Bypass RLS dan perubahan schema tak sengaja | Simpan hanya di env lokal/secret store; CLI read/write hanya atas perintah eksplisit, tidak menjalankan migration dalam tahap desain. |
| Cascade menghapus histori | Kehilangan data turunan saat hard-delete | UI melakukan archive/disable; batasi purge administratif dan tetapkan retensi sebelum rilis publik. |
| `jsonb` tidak tervalidasi | Data bentuk tak konsisten dan query sulit | Validasi payload di server; finalisasi struktur JSONB sebelum implementasi form/schema final. |
| Hari lokal berbeda dengan UTC | Review, log, dan kalender salah tanggal | Tentukan strategi timezone OPEN-022 dan konsisten konversi date range di server. |
| Toggle reminder global dan per reminder tumpang tindih | Reminder tampak aktif padahal global off | Tetapkan flag master atau hapus duplikasi sebelum perilaku diimplementasi. |

## 9. Prosedur review dan verifikasi berikutnya

Sebelum implementasi schema/Prisma:

1. Review dokumen ERD ini dan setujui/ubah keputusan OPEN terkait.
2. Tetapkan satu sumber kebenaran schema (rekomendasi: Supabase SQL migrations untuk RLS/trigger/index PostgreSQL khusus).
3. Rancang matriks operasi per tabel (select/insert/update/delete) dan strategi Prisma-vs-RLS.
4. Setelah persetujuan eksplisit, implementasikan perubahan schema dalam migration lokal saja.
5. Uji fresh reset, constraints, RLS owner/non-owner, query dengan role yang dipakai aplikasi, serta konsistensi status.
6. Provision/introspect remote atau membuat migration Prisma remote hanya setelah otorisasi dan scope terpisah.

**Status task database design:** dokumen ini menunggu review pengguna. Tidak ada tabel, model Prisma, migration, introspection, `db pull`, ataupun query database yang dibuat/dijalankan untuk menyusun desain ini.
