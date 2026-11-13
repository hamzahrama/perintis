# Status Proyek dan Keputusan Terbuka

**Posisi dokumentasi:** 13 November 2026

## 1. Yang sudah disepakati

- [x] Nama produk PERINTIS.
- [x] Positioning Personal Growth Guidance Platform.
- [x] Tagline “Mulai Hari Ini. Bangun Masa Depanmu.”
- [x] Target awal pelajar/mahasiswa usia 16–22 tahun.
- [x] Proyek berupa platform web full-stack.
- [x] Target pengerjaan MVP satu bulan.
- [x] Filosofi Guide, Don't Control.
- [x] Model pendampingan hybrid.
- [x] Karakter Personal Coach.
- [x] Siklus pertumbuhan tujuh tahap.
- [x] Remember Your Why, Know Your Next Step, Start Again Without Shame sebagai diferensiasi.
- [x] Aturan otonomi pengguna, jadwal, reminder, dan My Commitment.
- [x] Daftar 19 item fitur MVP dalam lima kelompok.
- [x] Arah desain desktop-first.
- [x] Arahan warna dan identitas visual awal.
- [x] Prompt Google Stitch untuk design system dan halaman MVP telah disusun.
- [x] Hasil desktop Google Stitch awal dan revisi telah dikirim.
- [x] Register membuat sesi langsung; onboarding dapat dilanjutkan dan wajib sebelum membuat Goal.
- [x] Satu Roadmap aktif per Goal; satu langkah dapat menghasilkan beberapa aktivitas terjadwal.
- [x] Habit dapat mandiri atau terkait Goal secara opsional.
- [x] Status aktivitas mencakup belum dimulai, berjalan, selesai, dijadwalkan ulang, dan dilewati; refleksi setelah skip opsional.
- [x] Personal Coach menggunakan panduan terstruktur tanpa menyimpan riwayat percakapan.
- [x] Reminder dibatasi pada notifikasi in-app saat jatuh tempo.
- [x] Weekly Review dan Analytics dihitung dinamis dengan zona waktu lokal perangkat.
- [x] Periode Senin–Minggu dan metrik hitungan tanpa skor ditetapkan (DEC-032).
- [x] Reopen aktivitas selesai/dilewati dan perilaku reminder saat app dibuka ditetapkan (DEC-031/033).
- [x] Demo memakai permintaan hapus akun manual tanpa ekspor/UI delete; retensi publik tetap OPEN (DEC-030).
- [x] Theme Customization: toggle Dark/Light, Dark default (DEC-035).
- [x] npm dan baseline lint/typecheck/build ditetapkan; tambahan tooling tetap OPEN (DEC-036).
- [x] Goal diarsipkan, bukan dihapus melalui UI MVP; histori turunan dipertahankan.
- [x] Reminder, Progress Analytics, My Commitment, dan Calendar mengikuti prioritas P2 dari scope.
- [x] Rekomendasi varian Stitch disetujui sebagai acuan implementasi (DEC-027); tujuh area belum memiliki kandidat mobile.
- [x] Stack awal disetujui untuk demo berbiaya layanan $0 (DEC-026); larangan ORM superseded sebagian oleh instruksi pengguna/DEC-037. Stack lain tetap berlaku.

## 2. Status UI/UX

**Status: acuan rekomendasi disetujui; fondasi UI global sebagian diimplementasikan pada Day 7, sementara adaptasi fitur tetap menjadi pekerjaan implementasi.**

Pekerjaan tersisa:
- [x] Audit inventaris repository dan 40 folder layar Stitch (HTML + screenshot).
- [x] Menyusun pemetaan 19 fitur, rekomendasi kandidat, serta gap/konflik di `docs/16-stitch-design-audit.md`.
- [-] Menyiapkan token visual dan komponen dasar; dashboard shell/toggle tema sudah diimplementasikan tetapi belum diuji dengan sesi Supabase lokal.
- [ ] Menyamakan sidebar, navigasi, istilah, data dummy, dan komponen pada seluruh halaman fitur.
- [ ] Menghapus elemen di luar MVP seperti konsultasi mentor manusia, Google Meet, atau fitur eksternal.
- [ ] Membuat layout responsif untuk tujuh area tanpa kandidat mobile; gunakan pola dari acuan yang disetujui.
- Aset screenshot Stitch yang dirujuk tidak tersedia di workspace aktif; visual detail yang tidak tercatat secara tekstual tetap menunggu aset dipulihkan.

## 3. Status Product & Technical Alignment (Sprint 0)

- [x] Stack MVP, auth, Coach, reminder, dan keputusan flow inti tercatat sebagai FIX di Decision Log.
- [x] Flow dan Functional Specification diperbarui agar tidak menyebut stack/provider yang sudah FIX sebagai OPEN.
- [x] Baseline ERD konseptual di `docs/17-erd-proposal.md` disetujui (DEC-028); migration lokal Day 5 sedang disiapkan memakai default PROPOSED.
- [x] Acuan rekomendasi desain disetujui (DEC-027); Sprint 0 tetap parsial karena pekerjaan UI dan keputusan OPEN belum selesai.

## Status Implementasi

- [x] Sprint 1 Day 4: fondasi Next.js 16.4.5, TypeScript, Tailwind CSS, npm, lint/typecheck/build, `.env.example`, dan struktur awal dibuat serta diverifikasi.
- [x] Sprint 1 Day 5: migration lokal, relasi/constraint, RLS, dan fixture demo terisolasi terverifikasi. Kredensial acak hanya ada pada file development yang di-ignore; tidak ada remote provisioning.
- [x] Sprint 1 Day 6: register/login/logout, server validation, session cookies, dan proteksi `/dashboard` diverifikasi dengan Supabase lokal; UI dashboard tetap placeholder untuk smoke test.
- [-] Sprint 1 Day 7: token/komponen dasar dan landing sudah diverifikasi; dashboard shell/toggle tema menunggu uji terautentikasi dengan Supabase lokal, dan tujuh adaptasi layar fitur belum dikerjakan/diverifikasi.
- [x] Prisma CLI stabil 7.10.1 dan konfigurasi PostgreSQL disiapkan (DEC-037/038); belum ada model, introspection, client runtime, atau migration Prisma. SQL migrations Supabase tetap sumber schema. Endpoint Singapore sudah dicatat, tetapi password harus diisi lokal dan konektivitas belum diuji.

## 4. Keputusan teknis yang masih terbuka

- [ ] Meninjau PROP-001–003 sebelum menganggap schema final atau melakukan provisioning production; persetujuan baseline ERD bukan persetujuan keputusan OPEN.
- [ ] Menetapkan kebijakan retensi sebelum rilis publik (OPEN-013).
- [ ] Menetapkan matriks transisi aktivitas selain reopen (OPEN-014) sebelum Day 16.
- Endpoint Supabase Singapore yang diberikan pengguna digunakan dalam `.env.local` dan `.env.example`; konektivitas belum diuji karena password belum tersedia.
- [ ] Memilih cara menyimpan/memperoleh timezone IANA (OPEN-022).
- [ ] Memutuskan apakah My Commitment boleh generik atau harus terkait Goal/Activity (OPEN-023).
- [ ] Meninjau status Roadmap Step yang dipakai sementara pada schema development sebelum schema final/provisioning (OPEN-024); field onboarding/reflection difinalkan pada task UI terkait.
- [ ] Meninjau minimum password 8 karakter yang dipakai pada development sebelum provisioning remote (OPEN-025).
- [ ] Menyetujui library UI/grafik/test runner tambahan hanya jika dibutuhkan (OPEN-019).
- [ ] Menentukan strategi sinkronisasi Prisma dengan migration SQL/RLS Supabase dan user-scoping sebelum memakai Prisma untuk query aplikasi; jangan gunakan koneksi database privileged untuk data privat tanpa penegakan ownership.
- Interaksi Coach sudah ditetapkan pada DEC-029: topik/skenario terkurasi dengan materi statis, tanpa input bebas/AI live/riwayat.

## 5. Hal yang jangan dilakukan tanpa persetujuan

- Jangan menambah fitur di luar daftar MVP.
- Jangan mengubah filosofi Guide, Don't Control.
- Jangan membuat jadwal atau konsekuensi menjadi paksaan.
- Jangan mengubah proyek menjadi roadmap pengembangan jangka panjang yang terlalu besar.
- Gunakan hanya acuan desain yang disetujui dan jangan menganggap mockup sebagai UI atau integrasi yang sudah berfungsi.
- Jangan mengubah stack FIX pada DEC-026 tanpa persetujuan pengguna.
- Jangan mengklaim integrasi atau fitur sudah berfungsi jika belum dibuat.

## 6. Langkah berikutnya yang disarankan

1. Pulihkan aset Stitch yang dirujuk untuk detail visual; lanjutkan adaptasi responsif pada tujuh area ketika halaman fiturnya dikerjakan.
2. Tinjau PROP-001–003 sebelum menganggap schema final; selesaikan OPEN-013 dan verifikasi OPEN-018 sebelum rilis/provisioning remote.
3. Sprint 1 Day 7 masih parsial; jangan tandai selesai sampai kriteria responsif untuk tujuh area dapat diverifikasi.
4. Lanjutkan backlog satu item pada satu waktu; jangan melompati acceptance atau mengklaim fitur yang belum diverifikasi.

## 7. Riwayat keputusan dan pembaruan

Perbarui dokumen ini setiap kali ada keputusan baru. Gunakan label:
- **FIX:** telah disetujui pengguna.
- **PROPOSED:** rekomendasi yang belum disetujui.
- **OPEN:** belum diputuskan.
- **DONE:** pekerjaan sudah selesai dan diverifikasi.

Jangan mengubah status PROPOSED atau OPEN menjadi FIX tanpa persetujuan pengguna.
