# Product Backlog & Sprint Plan — PERINTIS (30 Hari)

**Durasi:** 30 hari kalender sebagai rencana awal  
**Status:** PROPOSED — sesuaikan dengan tanggal mulai, waktu harian, dan hasil audit repository.  
**Catatan:** Semua 19 item fitur MVP tetap masuk scope. Prioritas menentukan urutan dan kedalaman implementasi, bukan menghapus fitur.

## 1. Cara membaca backlog

- `[ ]` Belum dikerjakan
- `[-]` Sedang dikerjakan
- `[x]` Selesai dan diverifikasi
- **P0:** alur inti harus berfungsi.
- **P1:** implementasi sederhana tetapi nyata.
- **P2:** penyempurnaan dalam scope bila waktu cukup.

Setiap task memiliki kriteria selesai. Agent tidak boleh menandai `[x]` hanya karena file atau komponen sudah dibuat.

## 2. Ringkasan sprint

| Sprint | Hari | Fokus | Output |
|---|---:|---|---|
| Sprint 0 | 1–3 | Finalisasi spesifikasi & keputusan teknis | Flow, spec, ERD, stack, acceptance |
| Sprint 1 | 4–8 | Fondasi aplikasi | Repo siap, database, auth, layout |
| Sprint 2 | 9–14 | Personal Growth | Onboarding, dashboard, goals, why, roadmap, next step |
| Sprint 3 | 15–20 | Daily Execution | Planner, habits, reschedule/skip, reminder, commitment, calendar |
| Sprint 4 | 21–25 | Coach & Evaluation | Personal Coach, reflection, weekly review, analytics |
| Sprint 5 | 26–30 | Integrasi, QA, deployment, demo | MVP stabil dan dapat didemokan |

## Sprint 0 — Hari 1–3: Product & Technical Alignment

### Day 1 — Audit desain dan repository
- [x] Setujui acuan varian per halaman berdasarkan audit Stitch.
- [ ] Pastikan desktop dan mobile konsisten.
- [x] Tandai halaman/komponen yang masih berbeda atau belum jelas.
- [x] Audit repository dan aset yang sudah tersedia.
- [x] Simpan dokumen produk di `docs/`.
- [x] Buat `AGENTS.md` dan instruksi kerja agent.
**Acceptance:** audit tersedia dan rekomendasi desain disetujui (DEC-027); harmonisasi UI serta adaptasi responsif tujuh area tanpa kandidat mobile masih harus diverifikasi. Lihat `docs/16-stitch-design-audit.md`.

### Day 2 — User Flow & Functional Specification
- [x] Tinjau `02-USER-FLOW.md`.
- [x] Tinjau `03-FUNCTIONAL-SPECIFICATION.md`.
- [x] Konfirmasi alur register → onboarding → goal → roadmap → daily action → reflection.
- [x] Putuskan aturan reopen dan kebijakan penghapusan untuk demo; verifikasi perilaku empty state di spec.
- [ ] Tetapkan matriks transisi status aktivitas selain reopen (OPEN-014).
- [x] Catat keputusan di Decision Log.
**Acceptance:** alur inti, aturan reopen, penghapusan untuk demo, dan empty state tercatat; matriks transisi lainnya dan retensi publik tetap OPEN.

### Day 3 — ERD dan keputusan teknis
- [x] Agent mengusulkan ERD berdasarkan flow dan functional spec.
- [x] Tinjau entitas, relasi, ownership, constraint, dan indeks.
- [x] Pengguna menyetujui baseline ERD konseptual (DEC-028).
- [x] Putuskan stack, auth, database, AI Coach, reminder, dan deployment minimum.
- [x] Catat keputusan reminder, tema, region bersyarat, tooling awal, aktivitas, dan metrik yang sudah disetujui.
**Acceptance:** baseline ERD dan keputusan teknis/alur yang diketahui tercatat; schema/migration dikerjakan pada Day 5 setelah OPEN yang berdampak pada data ditutup.

**Status Sprint 0:** sebagian selesai. Day 2 sebagian selesai; Day 1 masih menunggu harmonisasi/adaptasi mobile. OPEN-022–024 tetap OPEN; untuk menyiapkan migration development Day 5 memakai rekomendasi PROPOSED sementara, bukan keputusan FIX.

## Sprint 1 — Hari 4–8: Fondasi Aplikasi

### Day 4 — Setup repository
- [x] Setup Next.js App Router, TypeScript, Tailwind CSS sesuai stack final; belum menambahkan library komponen.
- [x] Siapkan `.env.example` tanpa credential.
- [x] Setup lint, typecheck, dan build (baseline DEC-036); test runner tambahan belum diperlukan.
- [x] Siapkan struktur awal `src/app/` dan konfigurasi.
**Acceptance:** aplikasi dapat dijalankan lokal dan build dasar berhasil.
**Status:** selesai dan diverifikasi; lint, typecheck, build, dan local HTTP smoke test berhasil. Tidak ada koneksi Supabase pada tahap ini.

### Day 5 — Database
- [x] Setup konfigurasi Supabase development lokal.
- [x] Implementasikan migration awal dari baseline ERD.
- [x] Tambahkan fixture demo lokal terpisah dari `db reset` dan production; kredensial acak hanya disimpan di file lokal yang di-ignore.
- [x] Reset dari database kosong dan verifikasi relasi, constraint, serta RLS.
**Acceptance:** migration berjalan dari database kosong; fixture development tidak tercampur dengan production.
**Status:** selesai dan diverifikasi; migration berhasil dari database kosong; fixture lokal terisolasi, dapat dijalankan ulang, terikat ke akun demo tersendiri, dan dibatasi ke host loopback. PROP-001–003 tetap hanya sebagai default schema development dan belum menjadi keputusan FIX.
**Pembaruan tooling (DEC-037/038):** Prisma CLI 7.10.1 dan endpoint pooler Singapore disiapkan terpisah; schema Prisma masih kosong dan belum menjalankan introspection atau migration.

### Day 6 — Authentication
- [x] Implementasi register, login, logout.
- [x] Route protection.
- [x] Validasi server dan error state.
- [x] Uji sesi dan akses tanpa login.
**Acceptance:** alur auth berjalan dan halaman privat terlindungi.
**Status:** selesai dan diverifikasi dengan Supabase lokal; dashboard yang tersedia saat ini hanya halaman smoke test auth, bukan fitur Dashboard Overview.

### Day 7 — Global UI
- [x] Implementasi font stack, warna, token, button, input, card, dialog, toast, dan state umum.
- [-] Implementasi sidebar desktop dan navigasi mobile untuk halaman yang sudah tersedia; menunggu smoke test dashboard terautentikasi.
- [ ] Implementasi layout responsif sesuai DEC-027, termasuk adaptasi tujuh area tanpa kandidat mobile.
- [-] Implementasi toggle Dark/Light dengan Dark sebagai default dan penyimpanan di preferensi pengguna (DEC-035); uji end-to-end dengan Supabase lokal telah dilakukan (toggle dark/light tersimpan dan bertahan).
**Acceptance:** komponen global konsisten dan halaman utama dapat dinavigasi.
**Status:** sebagian; sistem visual global, navigasi responsif untuk halaman yang tersedia, dan preferensi tema tersimpan telah diverifikasi. Adaptasi tujuh area fitur belum dapat diverifikasi; halaman fiturnya belum dibuat dan aset screenshot Stitch tidak tersedia di workspace.

### Day 8 — Profile & Settings
- [x] Implementasi profil minimum.
- [x] Simpan preferensi dasar yang sudah diputuskan.
- [x] Implementasi logout dari menu profil.
- [x] Uji data profil antar-user.
**Acceptance:** profil tersimpan dan tidak dapat diakses user lain.
**Status:** selesai dan diverifikasi. Akun demo login/login ulang, profil tersimpan, logout berfungsi, akses tanpa login ke `/profile` terproteksi, data antar-user terisolasi (UPH saya periksa terpisah dengan test akun kedua, bukan hanya eyeball).

## Sprint 2 — Hari 9–14: Personal Growth

### Day 9 — Onboarding
- [x] Implementasi form assessment.
- [x] Validasi dan penyimpanan jawaban.
- [x] Status onboarding selesai/belum.
**Acceptance:** pengguna baru diarahkan ke onboarding; jawaban tersimpan.
**Status:** selesai dan diverifikasi. Form assessment (Condition, Interests, Challenges, Direction) tersimpan di `onboarding_responses`, user baru redirect ke onboarding, onboarding selesai → dashboard, login setelah onboarding selesai → dashboard.

### Day 10 — Dashboard Overview
- [x] Implementasi dashboard dari data user.
- [x] Empty state untuk pengguna baru.
- [x] Ringkasan aktivitas dan goal yang relevan.
**Acceptance:** tidak ada angka statistik palsu; dashboard membaca data aktual.

### Day 11 — My Direction
- [x] CRUD goal.
- [x] Status goal dan validasi.
- [x] Empty state dan detail goal.
**Acceptance:** goal dapat dibuat, dibaca, diubah, dan dihapus/diarsipkan sesuai keputusan.

### Day 12 — Remember Your Why
- [x] Form alasan personal terkait goal.
- [x] Edit dan tampilkan kembali alasan.
- [x] Integrasi tampilan dengan goal.
**Acceptance:** alasan tersimpan dan terhubung ke goal yang benar.

### Day 13 — My Roadmap
- [x] CRUD roadmap dan langkah.
- [x] Urutan langkah dan status.
- [x] Hubungkan roadmap dengan goal.
**Acceptance:** pengguna dapat menyusun langkah yang dapat dikelola.

### Day 14 — Know Your Next Step
- [x] Buat alur Understand → Explore → Choose.
- [x] Tampilkan 2–4 opsi tindakan yang masuk akal.
- [x] Dukung pilih, gabungkan, buat sendiri, tunda, atau skip.
- [ ] Simpan keputusan pengguna jika menjadi roadmap/task.
**Acceptance:** pengguna memegang keputusan; tidak ada tindakan otomatis yang dipaksakan.

## Sprint 3 — Hari 15–20: Daily Execution

### Day 15 — Daily Guidance
- [x] Tampilkan aktivitas berdasarkan tanggal.
- [x] Tambah/detail aktivitas sesuai model data.
- [x] Implementasi status aktivitas.
**Acceptance:** planner menampilkan aktivitas user yang tepat pada tanggal yang tepat.

### Day 16 — Reschedule & Skip
- [ ] Reschedule aktivitas.
- [ ] Skip aktivitas dengan alasan opsional bila disepakati.
- [ ] Tangani perubahan tanggal dan riwayat status.
**Acceptance:** tidak ada duplikasi aktivitas atau hukuman otomatis.

### Day 17 — My Habits
- [ ] CRUD habit minimum.
- [ ] Habit log per tanggal.
- [ ] Cegah log duplikat.
**Acceptance:** pengguna dapat mencatat habit dan melihat riwayatnya.

### Day 18 — Reminder & Notification
- [ ] Implementasi mekanisme reminder yang benar-benar dipilih.
- [ ] Periksa reminder due saat aplikasi dibuka; jangan menjanjikan real-time/ketika aplikasi tertutup (DEC-033).
- [ ] Pengaturan waktu/preferensi pengguna.
**Acceptance:** jangan tampilkan status terkirim jika belum benar-benar terkirim.

### Day 19 — My Commitment
- [ ] Pengguna dapat memilih komitmen atau tidak.
- [ ] Validasi aturan aman dan proporsional.
- [ ] Edit/hapus dan review manual.
**Acceptance:** tidak ada hukuman otomatis; pilihan tetap sukarela.

### Day 20 — Calendar View
- [ ] Tampilkan aktivitas dan habit terjadwal.
- [ ] Navigasi tanggal/bulan sesuai desain.
- [ ] Klik tanggal untuk melihat item.
**Acceptance:** kalender menggunakan sumber data yang sama dengan planner dan habit.

## Sprint 4 — Hari 21–25: Coach & Evaluation

### Day 21–22 — Personal Coach
- [ ] Implementasi pemilihan topik/skenario terkurasi dan panduan statis sesuai DEC-029; tanpa chat bebas/riwayat.
- [ ] Terapkan nada suportif dan pilihan tindakan.
**Acceptance:** Coach membantu pengguna memilih langkah, tidak mengklaim integrasi AI yang belum ada.

### Day 23 — Daily Reflection
- [ ] Form refleksi singkat.
- [ ] Simpan dan tampilkan refleksi berdasarkan tanggal.
- [ ] Validasi kepemilikan data.
**Acceptance:** refleksi tersimpan dan dapat dibaca kembali.

### Day 24 — Weekly Growth Review
- [ ] Terapkan periode Senin–Minggu lokal (DEC-032).
- [ ] Ringkas hitungan aktivitas terjadwal/selesai/dilewati, log habit, dan refleksi aktual tanpa skor.
- [ ] Empty state bila data tidak cukup.
**Acceptance:** ringkasan dapat ditelusuri ke data nyata.

### Day 25 — Progress Analytics
- [ ] Implementasi hitungan periode dan kategori metrik sesuai DEC-032.
- [ ] Grafik sederhana.
- [ ] Filter periode bila termasuk desain final.
**Acceptance:** seluruh metrik berasal dari query/data aktual dan definisinya terdokumentasi.

## Sprint 5 — Hari 26–30: Integrasi, QA, Deployment, Demo

### Day 26 — Integrasi end-to-end
- [ ] Uji register → onboarding → goal → why → roadmap → next step.
- [ ] Uji aktivitas → habit → reflection → weekly review.
- [ ] Perbaiki integrasi data yang terputus.
**Acceptance:** alur utama berjalan dari awal sampai akhir.

### Day 27 — Security & Data QA
- [ ] Uji akses antar-user.
- [ ] Periksa validasi server dan input berbahaya.
- [ ] Periksa secret dan environment.
- [ ] Periksa penghapusan/arsip dan relasi data.
- [ ] Verifikasi demo tidak menawarkan ekspor/UI hapus akun dan prosedur penghapusan manual terdokumentasi (DEC-030).
**Acceptance:** tidak ada akses silang data user yang diketahui; tidak ada secret di repository.

### Day 28 — Responsive & UX QA
- [ ] Uji halaman utama pada desktop.
- [ ] Uji halaman utama pada mobile.
- [ ] Perbaiki overflow, navigasi, form, modal, dan empty/error states.
**Acceptance:** seluruh alur inti usable pada ukuran layar target.

### Day 29 — Deployment & Bug Fix
- [ ] Setup environment production.
- [ ] Verifikasi Supabase Singapore tersedia; jika tidak, hentikan provisioning dan minta keputusan pengguna (DEC-034).
- [ ] Jalankan migration production dengan prosedur aman.
- [ ] Deploy aplikasi.
- [ ] Uji smoke test di URL deployment.
- [ ] Perbaiki bug kritis.
**Acceptance:** aplikasi live dan alur inti dapat diakses.

### Day 30 — Demo & Handover
- [ ] Siapkan akun/data demo yang aman.
- [ ] Siapkan skenario demo 5–10 menit.
- [ ] Pastikan batasan fitur yang belum tersedia terdokumentasi.
- [ ] Perbarui README, cara setup, dan status backlog.
- [ ] Catat bug non-kritis yang tersisa.
**Acceptance:** MVP dapat didemokan tanpa mengklaim fitur yang belum berfungsi.

## 3. Urutan prioritas jika waktu meleset

1. Pertahankan keamanan dasar dan isolasi data.
2. Pertahankan alur end-to-end goal → roadmap → aktivitas → refleksi.
3. Sederhanakan implementasi fitur P1, jangan menghapus diam-diam.
4. Gunakan solusi sederhana yang nyata daripada integrasi palsu.
5. Tunda polish visual non-esensial.
6. Catat perubahan scope dan minta persetujuan pengguna.

## 4. Definition of Done seluruh MVP

- [ ] 19 item fitur MVP sudah memiliki implementasi sesuai kedalaman yang disepakati atau keterbatasannya dinyatakan terbuka.
- [ ] Register/login/logout berjalan.
- [ ] Pengguna menyelesaikan onboarding.
- [ ] Goal, why, roadmap, dan next step terhubung.
- [ ] Daily planner, habit, reschedule/skip dapat digunakan.
- [ ] Reminder sesuai kemampuan yang benar-benar tersedia.
- [ ] Coach tidak mengklaim kemampuan yang belum diimplementasikan.
- [ ] Reflection, weekly review, analytics menggunakan data aktual.
- [ ] My Commitment aman, sukarela, tanpa hukuman otomatis.
- [ ] Calendar, profile/settings, theme sesuai scope.
- [ ] Data antar-user terisolasi.
- [ ] Desktop dan mobile diuji.
- [ ] Build dan pemeriksaan utama lolos.
- [ ] Deployment dan demo tersedia.

## 5. Aturan pembaruan

Setelah setiap sesi:
- Perbarui status task.
- Catat blocker.
- Catat keputusan baru di Decision Log.
- Jangan tandai task selesai tanpa verifikasi.
- Jangan mulai sprint berikutnya hanya karena kalender berganti jika acceptance sprint sebelumnya belum tercapai.
