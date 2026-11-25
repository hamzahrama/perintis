# Keputusan Produk PERINTIS

Dokumen ini memisahkan keputusan yang sudah disepakati dari ide yang masih berupa rekomendasi.

## A. Keputusan yang sudah disepakati

| Area | Keputusan |
|---|---|
| Nama | PERINTIS |
| Kategori | Personal Growth Guidance Platform |
| Tagline | “Mulai Hari Ini. Bangun Masa Depanmu.” |
| Target awal | Pelajar/mahasiswa usia 16–22 tahun |
| Bentuk produk | Platform web full-stack |
| Durasi | MVP satu bulan |
| Model pendampingan | Hybrid: coach interaktif + panduan terstruktur |
| Karakter coach | Suportif, tegas, terstruktur, realistis, adaptif, reflektif, goal-oriented |
| Filosofi | Guide, Don't Control |
| Prinsip | Consistency Over Perfection; Progress Over Pressure; Simplicity Over Feature Overload |
| Kendali pengguna | Pengguna menentukan solusi, jadwal, dan pengingat |
| Pilihan solusi | 2–4 alternatif relevan; pengguna boleh memilih, menggabungkan, membuat sendiri, menunda, atau melewati |
| Kegagalan | Tidak menghakimi; pengguna dapat memulai kembali, menjadwalkan ulang, mengubah rencana, atau melewati |
| My Commitment | Sukarela, aman, proporsional, dapat diubah/dihapus, boleh tanpa konsekuensi |
| Desain | Desktop-first, kemudian mobile responsive |
| Scope | Menggunakan daftar MVP yang telah dipilih; tidak menambah fitur tanpa persetujuan |
| Stack aplikasi MVP | DEC-026 sebagaimana diperbarui DEC-037: Node.js 24 LTS, Next.js App Router 16.4.x, TypeScript, Tailwind CSS 4, Supabase Auth/PostgreSQL dengan RLS, Supabase SDK untuk Auth dan akses aplikasi saat ini, Prisma 7 untuk konfigurasi/schema tooling, Zod, dan Vercel Hobby; target biaya layanan $0 untuk demo pribadi |
| Pendampingan MVP | Structured Coach dan Wise Personal Growth Mentor saling melengkapi; Mentor menyediakan chat AI dengan riwayat tersimpan (DEC-040) |
| Reminder MVP | Notifikasi in-app saat jatuh tempo; tanpa push, email, atau kalender eksternal (DEC-021) |
| Evaluasi | Senin–Minggu lokal; hitungan aktivitas, log habit, refleksi tanpa skor (DEC-032) |
| Theme Customization | Toggle Dark/Light, Dark default (DEC-035) |

## B. Tiga diferensiasi utama

1. **Remember Your Why** — membantu pengguna mengingat alasan awal.
2. **Know Your Next Step** — memberi alternatif tindakan konkret dan memberi kendali pada pengguna.
3. **Start Again Without Shame** — memudahkan pengguna memulai kembali tanpa rasa malu.

## C. Keputusan UX yang wajib dipertahankan

- Jangan memaksa pengguna menerima satu solusi.
- Jangan menganggap aktivitas yang terlewat sebagai kegagalan moral.
- Jangan menggunakan streak atau skor yang membuat pengguna merasa dihukum.
- Jadwal dan reminder ditentukan atau disetujui pengguna.
- Jangan mengirim konsekuensi otomatis ketika pengguna melewatkan aktivitas.
- Berikan bahasa yang suportif, jelas, dan tidak menggurui.
- Tampilkan tindakan berikutnya dengan jelas, bukan sekadar statistik.

## D. Rekomendasi yang belum menjadi keputusan

- npm dan baseline lint/typecheck/build diputuskan pada DEC-036; komponen UI, library grafik, dan test runner tambahan tetap OPEN.
- Nama contoh pengguna seperti Alex, Nadia, atau nama lain hanya data dummy desain, bukan keputusan identitas produk.
- Rekomendasi varian Stitch disetujui sebagai acuan implementasi (DEC-027); tujuh area belum memiliki kandidat mobile dan mockup perlu dibersihkan dari konten di luar scope.
- Baseline ERD konseptual disetujui (DEC-028), tetapi schema/migration dan beberapa aturan privasi/data masih OPEN. Lihat `docs/15-DECISION-LOG.md`.

Keputusan awal DEC-020 dan DEC-029 yang membatasi Coach menjadi statis tetap tercatat sebagai sejarah, tetapi telah digantikan oleh DEC-040. Structured Coach tetap menggunakan panduan dan data aktual PERINTIS; Wise Personal Growth Mentor menjadi pengalaman chat AI yang terpisah dan menyimpan riwayat.

Untuk demo, tidak tersedia ekspor atau UI penghapusan akun; permintaan penghapusan diproses manual (DEC-030). Retensi sebelum rilis publik tetap OPEN. Detail keputusan teknis tercatat di Decision Log.

## E. Aturan perubahan scope

Setiap fitur baru harus:
1. Dijelaskan masalah pengguna yang diselesaikan.
2. Dibandingkan dengan batas waktu satu bulan.
3. Dievaluasi dampaknya terhadap fitur MVP.
4. Disetujui pengguna sebelum masuk scope.

Tanpa persetujuan tersebut, fitur baru masuk daftar ide masa depan, bukan MVP.
