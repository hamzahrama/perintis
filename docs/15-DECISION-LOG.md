# PERINTIS — Decision Log

Tempat resmi menyimpan keputusan proyek. Perbarui dokumen ini setiap kali pengguna menyetujui atau mengubah keputusan.

## Status

- **FIX:** disetujui pengguna; agent tidak boleh mengubah tanpa persetujuan.
- **PROPOSED:** rekomendasi untuk ditinjau.
- **OPEN:** belum diputuskan.
- **SUPERSEDED:** keputusan lama digantikan keputusan baru; jangan dihapus dari sejarah.

## Keputusan FIX yang sudah diketahui

| ID | Topik | Keputusan | Status |
|---|---|---|---|
| DEC-001 | Nama produk | PERINTIS | FIX |
| DEC-002 | Positioning | Personal Growth Guidance Platform | FIX |
| DEC-003 | Tagline | “Mulai Hari Ini. Bangun Masa Depanmu.” | FIX |
| DEC-004 | Target awal | Pelajar/mahasiswa usia 16–22 tahun | FIX |
| DEC-005 | Durasi | MVP satu bulan | FIX |
| DEC-006 | Filosofi | Guide, Don't Control; progress over pressure; user autonomy | FIX |
| DEC-007 | Guidance | Hybrid: coaching interaktif dan panduan terstruktur | FIX |
| DEC-008 | Persona Coach | Suportif, tegas, terstruktur, realistis, adaptif, reflektif | FIX |
| DEC-009 | Growth cycle | Understand → Explore → Choose → Commit → Act → Reflect → Adapt | FIX |
| DEC-010 | Opsi tindakan | Pengguna boleh memilih, menggabungkan, membuat sendiri, menunda, atau skip | FIX |
| DEC-011 | Reminder/jadwal | Dipilih atau disetujui pengguna; tidak dipaksakan | FIX |
| DEC-012 | My Commitment | Sukarela, aman, proporsional, dapat diedit/dihapus, tanpa hukuman otomatis | FIX |
| DEC-013 | MVP scope | 19 item pada lima kelompok; tidak menambah fitur tanpa persetujuan | FIX |
| DEC-014 | UI direction | Desktop-first, dark-first, mobile responsive | FIX sebagai arah desain |
| DEC-015 | Navigasi | Sidebar desktop; mobile navigation responsive sesuai desain final | FIX sebagai arahan |
| DEC-016 | Register & onboarding | Register langsung membuat sesi; onboarding dapat disimpan/dilanjutkan dan harus selesai sebelum pengguna membuat Goal | FIX |
| DEC-017 | Goal & Roadmap | Maksimal satu Roadmap aktif per Goal; satu langkah dapat dijadwalkan menjadi beberapa aktivitas | FIX |
| DEC-018 | Status aktivitas | Status mencakup belum dimulai, sedang berjalan, selesai, dijadwalkan ulang, dan dilewati; reschedule memperbarui jadwal/status; refleksi setelah skip opsional | FIX |
| DEC-019 | Relasi Habit | Habit dapat berdiri sendiri; hubungan dengan Goal opsional | FIX |
| DEC-020 | Personal Coach MVP | Panduan terstruktur, bukan AI live; riwayat percakapan tidak disimpan | FIX |
| DEC-021 | Reminder MVP | Reminder/notifikasi in-app saat jatuh tempo; tanpa push, email, atau integrasi kalender eksternal | FIX |
| DEC-022 | Weekly Review & Analytics | Dihitung dinamis dari data aktual menggunakan zona waktu lokal perangkat; data kurang ditampilkan dengan empty/limited state | FIX |
| DEC-023 | Goal lifecycle | Goal diarsipkan, bukan dihapus melalui UI MVP; histori turunannya dipertahankan | FIX |
| DEC-024 | Pemilihan desain Stitch | Agent merekomendasikan varian per halaman duplikat; pengguna meninjau dan menyetujui sebelum desain dianggap final | FIX sebagai proses |
| DEC-025 | Prioritas empat fitur | Reminder, Progress Analytics, My Commitment, dan Calendar mengikuti prioritas P2 pada scope MVP | FIX |
| DEC-026 | Stack MVP & batas biaya | Next.js 16.4.x (gunakan patch stabil/security terbaru; versi rujukan 16.4.5), Node.js 24 LTS, TypeScript, Tailwind CSS 4; Supabase Auth + PostgreSQL/RLS; `@supabase/ssr` dan `@supabase/supabase-js` tanpa ORM tambahan; Zod; deploy Vercel Hobby; target biaya layanan $0 untuk demo pribadi | FIX |
| DEC-027 | Acuan desain MVP | Rekomendasi kandidat per fitur pada `docs/16-stitch-design-audit.md` disetujui sebagai acuan implementasi; gunakan hanya konten sesuai scope dan adaptasi responsif sesuai DEC-014/015. Mockup mentah tidak diubah atau dianggap sebagai UI berfungsi | FIX |
| DEC-028 | ERD konseptual | Proposal `docs/17-erd-proposal.md` disetujui sebagai baseline konseptual; bukan schema/migration. Keputusan privasi, region, trigger reminder, dan detail yang ditandai OPEN tetap berlaku | FIX |
| DEC-029 | Interaksi Personal Coach | Pengguna memilih topik/skenario terkurasi dengan materi dan prompt statis; tanpa input chat bebas, AI live, atau penyimpanan riwayat | FIX |
| DEC-030 | Privasi dan penghapusan data MVP | Tanpa ekspor atau UI hapus akun; permintaan penghapusan diproses manual dengan purge akun dan data terkait. Kebijakan retensi harus ditetapkan sebelum rilis publik | FIX untuk demo; retensi rilis publik tetap OPEN |
| DEC-031 | Membuka kembali aktivitas | Pengguna dapat membuka kembali aktivitas selesai/dilewati yang sama; status kembali ke `not_started`, jadwal dipertahankan, dan perubahan dicatat di riwayat tanpa duplikasi | FIX |
| DEC-032 | Periode dan metrik evaluasi | Periode Senin–Minggu berdasarkan zona waktu lokal; hitung aktivitas terjadwal/selesai/skip, log habit, dan refleksi. Tampilkan hitungan saja, tanpa skor | FIX; sumber zona waktu masih perlu ditetapkan |
| DEC-033 | Pemicu reminder in-app | Periksa reminder yang jatuh tempo saat aplikasi dibuka; jangan menjanjikan notifikasi real-time atau saat aplikasi tertutup | FIX |
| DEC-034 | Region layanan | Gunakan region Supabase Singapore jika tersedia saat project dibuat; Vercel menggunakan jaringan global. Jika Singapore tidak tersedia, minta keputusan pengguna sebelum memilih alternatif | FIX bersyarat verifikasi |
| DEC-035 | Theme Customization | Sediakan toggle Dark/Light, dengan Dark sebagai default; simpan pilihan di preferensi pengguna | FIX |
| DEC-036 | Tooling dasar aplikasi | Gunakan npm; mulai dengan lint, typecheck, dan build. Jangan menambah test runner/library komponen/grafik sebelum ada kebutuhan dan persetujuan | FIX untuk setup dasar; library tambahan tetap OPEN |
| DEC-037 | Setup Prisma | Atas instruksi eksplisit pengguna, tambahkan Prisma ORM 7 stable sebagai dependency development untuk konfigurasi/schema tooling; keputusan ini supersedes bagian “tanpa ORM tambahan” pada DEC-026. Tetap gunakan Supabase Auth SDK; SQL migration Supabase yang ada tetap sumber schema sampai ada keputusan migrasi. Jangan memakai Prisma untuk data privat sebelum strategi identitas user dan RLS diverifikasi. | FIX untuk setup tooling; integrasi aplikasi/migrasi schema tetap OPEN |
| DEC-038 | Supabase pooler project | Gunakan endpoint pooler project Singapore `aws-1-ap-southeast-1` yang diberikan pengguna; transaction pooler untuk koneksi aplikasi dan session pooler untuk perintah Prisma CLI. Password hanya di `.env.local` dan tidak dicatat di repository. | FIX; konektivitas belum diuji |

## Resolusi item OPEN sebelumnya

| ID sebelumnya | Resolusi |
|---|---|
| OPEN-001 | Diselesaikan oleh DEC-026 |
| OPEN-002 | Diselesaikan oleh DEC-026 untuk database dan DEC-028 untuk baseline ERD; schema/migration tetap mengikuti keputusan OPEN terkait |
| OPEN-003 | DEC-026 awalnya menetapkan tanpa ORM; penggunaan Prisma untuk schema tooling kemudian disetujui pada DEC-037. Strategi model, migrasi, dan akses data privat tetap perlu diputuskan sebelum integrasi aplikasi. |
| OPEN-004 | Diselesaikan oleh DEC-026 (Supabase Auth) |
| OPEN-005 | Diselesaikan oleh DEC-020 |
| OPEN-006 | Diselesaikan oleh DEC-021 |
| OPEN-007 | Diselesaikan oleh DEC-026 (Vercel Hobby untuk demo pribadi) |
| OPEN-008 | Diselesaikan oleh DEC-023 |
| OPEN-009 | Diselesaikan oleh DEC-017 |
| OPEN-010 | Diselesaikan oleh DEC-019 |
| OPEN-011 | Sebagian diselesaikan oleh DEC-018; transisi lengkap dan pembukaan ulang aktivitas masih perlu diputuskan |
| OPEN-012 | Diselesaikan untuk cara hitung oleh DEC-022; definisi periode dan metrik masih perlu diputuskan |
| OPEN-016 | Rekomendasi kandidat disetujui oleh DEC-027; adaptasi responsif pada tujuh area tanpa kandidat mobile dikerjakan saat implementasi |
| OPEN-020 | Diselesaikan oleh DEC-029 |
| OPEN-015 | Diselesaikan untuk periode/kategori metrik oleh DEC-032; mekanisme penyediaan zona waktu masih perlu dikonfirmasi sebelum schema |
| OPEN-017 | Diselesaikan oleh DEC-033 |
| OPEN-021 | Diselesaikan oleh DEC-035 |
| OPEN-018 | DEC-034 menetapkan Singapore bersyarat; verifikasi ketersediaan saat provisioning |
| OPEN-019 | DEC-036 menetapkan npm dan pemeriksaan dasar; library komponen/grafik dan test runner tambahan tetap OPEN |
| OPEN-013 | DEC-030 menetapkan kebijakan demo; retensi sebelum rilis publik tetap OPEN |

## Keputusan yang masih OPEN

Audit desain dan ERD konseptual yang disetujui tersedia di `docs/16-stitch-design-audit.md` dan `docs/17-erd-proposal.md`. Persetujuan ini tidak mengesahkan mockup sebagai fitur yang berfungsi atau mengizinkan migration.

### Default implementasi yang masih PROPOSED

Untuk menyiapkan task database tanpa mengubah status OPEN menjadi FIX, gunakan rekomendasi sementara berikut hanya pada migration development; jangan provision atau gunakan database production sebelum pengguna meninjau:

| ID | Topik | Default sementara |
|---|---|---|
| PROP-001 | Zona waktu | Simpan timezone IANA dari browser ke `user_preferences` secara otomatis; tidak ada kontrol manual pada MVP |
| PROP-002 | Target My Commitment | Komitmen boleh generik; target Goal atau Activity opsional dan maksimal salah satu |
| PROP-003 | Status Roadmap Step | `not_started`, `in_progress`, `completed` |
| PROP-004 | Minimum password | Minimal 8 karakter pada development, selaras dengan validasi Auth dan Supabase lokal; tinjau sebelum provisioning remote |

Pengguna dapat mengubah proposal ini; OPEN terkait tetap berlaku sampai dikonfirmasi.

| ID | Topik | Pilihan yang perlu diputuskan |
|---|---|---|
| OPEN-013 | Retensi sebelum rilis publik | Tetapkan jangka retensi dan proses yang sesuai sebelum produk dibuka ke publik; untuk demo berlaku DEC-030 |
| OPEN-014 | Matriks transisi aktivitas | DEC-031 menetapkan reopen dari completed/skipped ke `not_started`; transisi sah lainnya perlu ditentukan sebelum implementasi Day 16 |
| OPEN-018 | Ketersediaan region | Diselesaikan oleh DEC-038 berdasarkan endpoint Singapore yang diberikan pengguna; koneksi database tetap perlu diuji setelah password diisi lokal |
| OPEN-019 | Tooling tambahan | Komponen UI, library grafik, dan test runner tambahan tetap belum dipilih; gunakan baseline minimal DEC-036 sampai ada kebutuhan |
| OPEN-022 | Zona waktu tersimpan | Tinjau PROP-001: simpan IANA dari browser otomatis atau gunakan timezone per request |
| OPEN-023 | Target My Commitment | Tinjau PROP-002: komitmen generik dengan target opsional atau wajib terkait Goal/Activity |
| OPEN-024 | Status Roadmap Step | Tinjau PROP-003; Goal mengikuti active/archived dan Habit memakai is_active. Field onboarding/reflection dapat difinalkan pada task UI terkait. |
| OPEN-025 | Minimum password | Tinjau PROP-004 sebelum provisioning remote |

## Template keputusan baru

```md
### DEC-XXX — [Judul keputusan]
- Tanggal:
- Status: PROPOSED / FIX / OPEN / SUPERSEDED
- Konteks:
- Opsi yang dipertimbangkan:
- Rekomendasi:
- Keputusan final:
- Dampak terhadap UI/UX:
- Dampak terhadap database:
- Dampak terhadap backlog:
- Disetujui oleh:
- Tanggal persetujuan:
- Batas biaya:
```

## Aturan perubahan

- Agent boleh menambahkan opsi dan rekomendasi.
- Hanya pengguna yang dapat mengubah status menjadi FIX.
- Jika keputusan FIX perlu berubah, buat catatan baru dan tandai keputusan lama SUPERSEDED.
- Jangan menghapus keputusan lama; simpan jejak alasan perubahan.
