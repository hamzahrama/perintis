# AGENTS.md — PERINTIS

## Project context
PERINTIS adalah Personal Growth Guidance Platform untuk membantu pengguna mengubah niat pengembangan diri menjadi tindakan kecil yang realistis dan berkelanjutan. Target awal pelajar/mahasiswa usia 16–22 tahun. Target pengerjaan adalah MVP satu bulan.

## Source of truth
Sebelum mengerjakan task, baca dokumen yang relevan di `docs/`:
- PRD dan keputusan produk
- Scope MVP
- User Flow
- Functional Specification
- UI/UX direction dan desain final
- ERD/arsitektur yang telah disetujui
- Backlog sprint
- Decision Log

Jika nama file berbeda, cari dokumen dengan fungsi yang sama. Repository dan dokumen yang disetujui adalah sumber kebenaran; jangan mengandalkan asumsi atau percakapan lama.

## Product rules — FIX
- Guide, Don't Control.
- Consistency over perfection; progress over pressure.
- User autonomy: pengguna menentukan goal, tindakan, jadwal, dan reminder.
- Growth cycle: Understand → Explore → Choose → Commit → Act → Reflect → Adapt.
- Know Your Next Step menawarkan pilihan; pengguna boleh memilih, menggabungkan, membuat sendiri, menunda, atau skip.
- Start Again Without Shame: tidak menghakimi ketika aktivitas terlewat.
- My Commitment bersifat sukarela, aman, proporsional, dapat diedit/dihapus, dan tidak pernah dijalankan otomatis sebagai hukuman.
- MVP hanya mencakup 19 item yang tercantum di scope. Jangan menambah fitur tanpa persetujuan eksplisit.

## Working rules
1. Audit sebelum mengubah.
2. Untuk task besar, ajukan rencana dan daftar file yang akan disentuh terlebih dahulu.
3. Kerjakan satu task/backlog item dalam satu waktu.
4. Jangan mengubah keputusan FIX.
5. Jangan memilih keputusan OPEN secara diam-diam; ajukan opsi dan rekomendasi.
6. Jangan menambah dependency tanpa alasan dan persetujuan jika berdampak besar.
7. Ikuti desain final Stitch; jangan membuat desain baru yang menyimpang.
8. Jangan mengganti mockup menjadi klaim fitur yang sudah berfungsi.
9. Pisahkan demo seed dari data production.
10. Jangan menampilkan secret, token, atau password di source code, log, atau dokumentasi.

## Engineering expectations
- Gunakan pola, bahasa, framework, dan package manager yang sudah diputuskan serta konsisten dengan repository.
- Validasi input penting di server.
- Semua query data privat harus dibatasi pada user yang terautentikasi.
- Jangan mempercayai user ID dari client tanpa memverifikasi sesi.
- Tangani loading, error, success, dan empty state.
- Perhatikan responsive desktop dan mobile.
- Perhatikan timezone untuk tanggal dan jadwal.
- Hindari abstraksi berlebihan untuk MVP.
- Jangan membuat analytics dari angka hardcoded.
- Jangan mengklaim email/push/AI integration aktif jika belum benar-benar terhubung.

## Verification
Setelah perubahan, jalankan pemeriksaan yang tersedia dan relevan, seperti lint, typecheck, tests, dan build. Laporkan hasil sebenarnya. Jangan menandai backlog DONE tanpa acceptance criteria yang terverifikasi.

## Version control
- Setelah setiap perubahan task yang lolos pemeriksaan relevan, buat commit Git terpisah.
- Pesan commit wajib ringkas, spesifik, dan menjelaskan perubahan yang dilakukan; gunakan format Conventional Commits bila sesuai, misalnya `feat: add onboarding assessment` atau `fix: protect profile route`.
- Jangan commit secret, token, password, `.env.local`, file kredensial demo, atau artefak lokal.
- Jangan membuat commit bila pemeriksaan relevan gagal; laporkan kegagalan dan perbaiki dulu atau minta keputusan pengguna.

## Reporting
Setiap task report harus menyebut:
- task yang dikerjakan,
- file yang dibuat/diubah,
- keputusan yang digunakan,
- hasil verifikasi,
- masalah/risiko tersisa,
- status backlog,
- keputusan yang perlu persetujuan pengguna.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
