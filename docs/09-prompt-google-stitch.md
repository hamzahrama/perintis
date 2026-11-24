# Prompt Google Stitch — PERINTIS

Prompt berikut merupakan kumpulan prompt yang telah disusun dalam percakapan. Gunakan pada proyek Stitch yang sama agar konteks visual tetap terjaga. Desktop dikerjakan terlebih dahulu.

## Prompt 00 — Design System

Buat desain UI/UX untuk aplikasi web bernama **PERINTIS — Personal Growth Guidance Platform**, sebuah platform pendamping pengembangan diri untuk pengguna usia 16–22 tahun.

Konsep desain: modern, minimalis, profesional, sedikit futuristik, tenang, nyaman, positif, dan tidak mengintimidasi. Utamakan kejelasan informasi dan kemudahan penggunaan. Gunakan pendekatan Guide, Don't Control.

Palet warna:
- Background utama: `#17172B`
- Surface/Card: `#22223A`
- Primary Lavender: `#CBA6F7`
- Accent Cyan: `#22D3EE`
- Success Mint: `#A6E3A1`
- Text utama: `#F5F5FA`
- Text sekunder: `#A6A6BC`

Gunakan font Inter, kartu dengan sudut sedikit membulat, tombol dengan hierarki jelas, ikon sederhana, ruang kosong cukup, dan grafik mudah dibaca.

Prioritaskan desain Desktop Web dengan frame 1440 × 900 px. Gunakan sidebar kiri dan area konten utama di kanan. Jangan membuat versi mobile pada tahap pertama. Seluruh teks antarmuka menggunakan bahasa Indonesia. Pertahankan identitas visual konsisten pada semua halaman.

Navigasi: Overview, My Direction, Remember Your Why, My Roadmap, Know Your Next Step, Daily Guidance, My Habits, Reminder & Notification, Daily Reflection, Weekly Growth Review, Progress Analytics, My Commitment, Calendar View, Profile & Settings. Personal Coach harus mudah ditemukan.

## Prompt 01 — Dashboard / Overview

Buat halaman Dashboard untuk PERINTIS sebagai halaman pertama setelah login. Tampilkan sapaan personal, tanggal, ringkasan hari ini, Fokus Hari Ini, tujuan aktif, progress roadmap, ringkasan kebiasaan, jadwal aktivitas terdekat, bagian Ingat Alasanmu, tombol Mulai Aktivitas Hari Ini, dan akses cepat ke Personal Coach. Buat layout bersih, tidak padat, dengan hierarki visual jelas. Prioritaskan tindakan hari ini.

## Prompt 02 — Personal Coach

Buat halaman Structured Coach untuk MVP sebagai panduan eksekusi terstruktur yang memakai data PERINTIS bila tersedia. Tampilkan pilihan topik/tantangan, prompt reflektif, dan 2–4 alternatif tindakan yang dapat dipilih, digabung, dibuat sendiri, ditunda, atau dilewati pengguna. Wise Personal Growth Mentor adalah pengalaman chat terpisah; jangan gabungkan riwayat/chat Mentor ke layar Structured Coach ini. Jangan tampilkan layanan mentor manusia atau sesi konsultasi. Gunakan nada suportif, realistis, dan tidak menghakimi.

## Prompt 03 — My Direction

Buat halaman My Direction untuk membuat, melihat, mengubah, dan mengarsipkan goal pengembangan diri. Tampilkan daftar dan detail goal, deskripsi opsional, alasan pribadi yang terkait, status yang ditetapkan spesifikasi, serta empty state. Jangan tampilkan hard delete atau status tambahan yang belum disetujui.

## Prompt 04 — Remember Your Why

Buat halaman Remember Your Why. Tampilkan judul Kenapa Aku Memulai?, pertanyaan reflektif, kartu alasan utama pengguna, hubungan alasan dengan tujuan aktif, tombol Tulis Alasan dan Perbarui Alasan. Gunakan desain hangat, sederhana, personal, tanpa kutipan motivasi generik.

## Prompt 05 — My Roadmap

Buat halaman My Roadmap untuk mengubah goal menjadi langkah kecil. Satu goal memiliki paling banyak satu roadmap aktif; satu langkah dapat dijadwalkan menjadi beberapa aktivitas. Tampilkan urutan langkah dan status, serta aksi membuat/mengubah langkah. Jadwal aktivitas ditentukan pengguna; jangan mengarang tenggat otomatis.

## Prompt 06 — Know Your Next Step

Buat halaman Know Your Next Step dengan alur: memahami masalah, menampilkan 2–4 alternatif solusi, memilih satu atau menggabungkan solusi atau membuat solusi sendiri, menentukan tindakan konkret, dan menentukan jadwal sendiri. Sediakan Buat Solusiku Sendiri dan Lewati untuk Sekarang. Jangan memaksakan solusi; keputusan tetap di tangan pengguna.

## Prompt 07 — Daily Guidance

Buat halaman Daily Guidance / Daily Planner. Tampilkan tanggal lokal, aktivitas pengguna, status belum dimulai/sedang berjalan/selesai/dijadwalkan ulang/dilewati, serta aksi tandai selesai, reschedule, dan skip. Jadwal mengikuti pilihan pengguna. Jangan tampilkan tugas contoh seolah-olah data nyata, skor produktivitas, atau hukuman karena aktivitas terlewat.

## Prompt 08 — My Habits

Buat halaman My Habits. Tampilkan daftar habit milik pengguna, status/log per tanggal, dan aksi mencatat pelaksanaan. Habit dapat berdiri sendiri atau dihubungkan ke goal secara opsional. Hindari streak, perbandingan, atau skor yang membuat pengguna merasa dihukum. Jangan menambah operasi penghapusan sebelum aturan lifecycle diputuskan.

## Prompt 09 — Reminder & Notification

Buat halaman Reminder & Notification untuk notifikasi in-app opsional ketika aktivitas jatuh tempo. Aplikasi memeriksa reminder due saat dibuka (DEC-033); jangan klaim real-time saat aplikasi tertutup. Tampilkan hanya pengingat/notifikasi yang benar-benar tersedia. Jangan tampilkan push, email, alarm/audio, integrasi kalender, atau status terkirim palsu.

## Prompt 10 — Daily Reflection

Buat halaman Daily Reflection yang ringkas dengan prompt tentang hal yang berjalan, tantangan, dan hal yang ingin disesuaikan. Pengguna dapat menyimpan dan membaca kembali refleksi. Jangan menampilkan diagnosis, skor kesehatan mental, atau saran klinis.

## Prompt 11 — Weekly Growth Review

Buat halaman Weekly Growth Review dari data aktivitas, goal, habit, dan refleksi yang benar-benar tersedia; hitung dinamis dengan zona waktu lokal. Tampilkan empty/limited state bila data kurang dan gunakan bahasa suportif. Periode minggu dan metrik final masih OPEN; jangan mengunci metrik atau membuat angka contoh sebagai data aktual.

## Prompt 12 — Progress Analytics

Buat halaman Progress Analytics sederhana dari data yang benar-benar tercatat. Hitung dinamis per Senin–Minggu lokal dengan hitungan aktivitas terjadwal/selesai/dilewati, log habit, dan refleksi (DEC-032); gunakan empty/limited state jika data kurang. Jangan tampilkan skor, prediksi, korelasi kesehatan/energi, perbandingan sosial, atau ekspor.

## Prompt 13 — My Commitment

Buat halaman My Commitment yang sepenuhnya sukarela dan dapat diedit/dihapus oleh pengguna. Sediakan pilihan tanpa konsekuensi. Tampilkan hanya komitmen yang dipilih pengguna; jangan jalankan atau klaim eksekusi otomatis, mempermalukan pengguna, atau menyarankan hal yang membahayakan kesehatan, kebutuhan dasar, atau kondisi finansial.

## Prompt 14 — Calendar View

Buat Calendar View yang mengagregasi aktivitas dan jadwal habit yang sama dengan Daily Guidance/My Habits, menggunakan tanggal lokal. Jangan membuat entri duplikat atau menampilkan konsultasi, agenda eksternal, atau kalender tersinkron.

## Prompt 15 — Profile & Settings

Buat halaman Profile & Settings untuk informasi profil minimum, preferensi dasar yang telah diputuskan, toggle tema Dark/Light (Dark default, DEC-035), dan logout. Jangan menampilkan pengaturan ekspor/hapus akun, perangkat, atau integrasi yang belum disetujui/diimplementasikan.

## Prompt 16 — Login & Register

Buat halaman autentikasi PERINTIS dengan email/password: Login berisi email, password, tombol masuk, dan tautan pendaftaran. Register berisi nama, email, password, konfirmasi password, tombol buat akun, dan tautan login. Register langsung membuat sesi untuk melanjutkan onboarding. Jangan tampilkan OAuth/social login atau klaim keamanan/privasi yang belum disetujui.

## Prompt 17 — Onboarding & Personal Assessment

Buat onboarding bertahap dengan progress indicator. Tahap: perkenalan PERINTIS, informasi dasar, bidang pengembangan diri yang diminati, kebiasaan yang ingin diubah, tantangan, dan tujuan awal. Gunakan pertanyaan singkat, pilihan jawaban mudah dipahami, navigasi kembali/lanjutkan, dan tombol Mulai Perjalananku.

## Prompt final consistency audit

Gunakan rekomendasi varian per fitur pada `docs/16-stitch-design-audit.md` sebagai acuan yang telah disetujui (DEC-027). Harmonisasikan desain dengan arahan visual dan scope MVP; hapus elemen di luar scope. Buat layout responsif untuk area tanpa kandidat mobile dengan mengikuti pola yang sudah disetujui, tanpa memperluas fitur atau mengubah identitas visual.

- Samakan sidebar dan navigasi global.
- Samakan ukuran header, kartu, radius, tipografi, tombol, warna status, ikon, dan spacing.
- Gunakan data dummy yang konsisten.
- Structured Coach adalah panduan eksekusi; Wise Personal Growth Mentor adalah pengalaman AI percakapan yang terpisah sesuai DEC-040. Jangan tampilkan mentor manusia, jadwal konsultasi, atau Google Meet.
- Jangan menambahkan fitur di luar MVP.
- Hilangkan klaim integrasi, keamanan, atau otomatisasi yang belum diimplementasikan.
- Jangan tampilkan angka statistik sebagai data nyata; data MVP harus berasal dari data pengguna.
- Jangan menampilkan pengingat push/email, fitur ekspor, komunitas, atau kalender eksternal.
- Pilih satu versi terbaik untuk halaman yang memiliki duplikasi.
- Pastikan hasil realistis dikembangkan dalam satu bulan.

Prinsip: Guide, Don't Control; Progress Over Perfection; Consistency Over Pressure.
