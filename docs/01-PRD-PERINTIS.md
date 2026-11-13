# Product Requirements Document (PRD) — PERINTIS

**Versi:** 1.0 — baseline keputusan  
**Tanggal dokumentasi:** 12 November 2026  
**Nama produk:** PERINTIS  
**Kategori:** Personal Growth Guidance Platform  
**Tagline:** “Mulai Hari Ini. Bangun Masa Depanmu.”

> PRD ini merangkum keputusan produk yang sudah disepakati. Bagian teknis yang belum diputuskan ditandai secara eksplisit agar tidak dianggap sebagai keputusan final.

## 1. Ringkasan produk

PERINTIS adalah platform web pendamping pengembangan diri yang membantu pengguna mengubah keinginan untuk berkembang menjadi tindakan nyata yang realistis dan berkelanjutan.

PERINTIS membantu pengguna memahami kondisi dan tantangannya, mengeksplorasi beberapa alternatif solusi, memilih tindakan sendiri, menyusun komitmen dan jadwal, menjalankan aktivitas, merefleksikan hasil, lalu menyesuaikan rencana.

PERINTIS bukan aplikasi yang memaksa pengguna menjadi produktif setiap saat. Sistem berperan sebagai pendamping/coach yang memberi arahan, pilihan, dan ruang refleksi. Keputusan tetap berada di tangan pengguna.

## 2. Latar belakang dan masalah

Masalah awal yang menjadi motivasi dan hipotesis produk:
- Pengguna ingin mengubah kebiasaan atau kondisi hidup, tetapi niat sering tidak berubah menjadi tindakan.
- Pengguna membuat target atau janji kepada diri sendiri, tetapi sulit menjalankannya secara konsisten.
- Motivasi mudah turun dan perhatian mudah teralihkan.
- Pengguna dapat kehilangan alasan awal mengapa mereka ingin berubah.
- Pengguna terkadang tidak tahu harus mulai dari mana atau tindakan konkret apa yang bisa dilakukan.
- Ketika rencana gagal, pengguna membutuhkan cara untuk memulai kembali tanpa merasa dihakimi.

Contoh konteks masalah yang pernah disampaikan: ingin mengurangi begadang, berhenti merokok, menabung, dan belajar hal baru, tetapi rencana perubahan sering tidak terlaksana. Contoh tersebut merupakan motivasi awal, bukan asumsi bahwa semua pengguna memiliki masalah yang sama.

## 3. Target pengguna

**Target awal:** pelajar dan mahasiswa usia 16–22 tahun.

Karakteristik umum yang menjadi asumsi desain:
- Sedang mengeksplorasi minat, kebiasaan, kemampuan, dan arah masa depan.
- Memiliki keinginan untuk berkembang tetapi membutuhkan bantuan untuk mengubah niat menjadi langkah konkret.
- Membutuhkan arahan yang jelas tanpa kehilangan kebebasan menentukan pilihan.
- Memerlukan pengalaman digital yang sederhana, mudah dipahami, dan tidak mengintimidasi.

Target ini merupakan fokus awal MVP, bukan pembatasan permanen produk.

## 4. Tujuan produk

1. Membantu pengguna menetapkan arah dan tujuan pribadi.
2. Membantu pengguna mengubah tujuan menjadi langkah-langkah kecil.
3. Membantu pengguna menentukan tindakan berikutnya ketika bingung atau mengalami hambatan.
4. Membantu pengguna menjalankan kebiasaan dan aktivitas secara konsisten.
5. Membantu pengguna mengingat alasan awal perubahan.
6. Membantu pengguna mengevaluasi perkembangan dan menyesuaikan rencana.
7. Membantu pengguna memulai kembali setelah gagal tanpa rasa malu atau tekanan berlebihan.

## 5. Nilai utama dan diferensiasi

### Remember Your Why
Menyimpan dan menghadirkan kembali alasan pribadi pengguna ketika mereka kehilangan arah atau motivasi.

### Know Your Next Step
Membantu pengguna menemukan beberapa pilihan tindakan konkret. Pengguna dapat memilih satu, menggabungkan pilihan, membuat solusi sendiri, menunda, atau melewati untuk sementara.

### Start Again Without Shame
Mendukung pengguna untuk memulai kembali, menjadwalkan ulang, mengubah rencana, atau melewati aktivitas tanpa mempermalukan atau menyalahkan pengguna.

## 6. Filosofi produk

- **Consistency Over Perfection:** konsistensi lebih penting daripada kesempurnaan.
- **Progress Over Pressure:** perkembangan lebih penting daripada tekanan.
- **Simplicity Over Feature Overload:** sederhana dan fokus, bukan penuh fitur.
- **User Autonomy:** pengguna memegang kendali atas keputusan dan rencana.
- **Sustainable Growth:** perubahan dibangun secara berkelanjutan, bukan hanya mengandalkan motivasi sementara.
- **Guide, Don't Control:** PERINTIS membimbing, bukan mengendalikan.

## 7. Model pendampingan

Model yang dipilih adalah **hybrid guidance**:
- Interaksi Personal Coach melalui panduan dan pilihan terstruktur; MVP tidak menggunakan AI live.
- Panduan terstruktur dan otomatis melalui dashboard, roadmap, daily planner, habit tracker, reminder, serta refleksi.

Karakter Personal Coach: suportif, tegas, terstruktur, realistis, adaptif, reflektif, dan berorientasi pada tujuan. Coach tidak menghakimi atau memaksakan keputusan.

## 8. Siklus pertumbuhan pengguna

1. **Understand** — memahami masalah dan kondisi saat ini.
2. **Explore** — mengeksplorasi beberapa solusi yang mungkin.
3. **Choose** — memilih, menggabungkan, atau membuat solusi sendiri.
4. **Commit** — menetapkan tindakan, jadwal, pengingat, dan komitmen secara sukarela.
5. **Act** — menjalankan tindakan.
6. **Reflect** — mengevaluasi hasil dan hambatan.
7. **Adapt** — menyesuaikan strategi berdasarkan pengalaman.

## 9. Ruang lingkup produk

Ruang lingkup fitur MVP ditetapkan dalam dokumen [`03-scope-MVP.md`](03-scope-MVP.md). Daftar tersebut merupakan pilihan fitur pengguna dan tidak boleh diperluas tanpa persetujuan.

## 10. Prinsip keselamatan dan akuntabilitas

Fitur My Commitment bersifat sukarela:
- Konsekuensi dipilih sendiri oleh pengguna, aman, wajar, proporsional, dapat diedit, dan dapat dihapus.
- Pengguna boleh memilih tanpa konsekuensi.
- Tidak boleh menyarankan tindakan yang menyakiti, mempermalukan, membahayakan kesehatan, mengganggu kebutuhan dasar, atau menimbulkan beban finansial yang tidak wajar.
- Ketika pengguna sakit, kelelahan, menghadapi keadaan darurat, atau memiliki alasan yang valid, konsekuensi tidak diwajibkan.
- Sistem tidak otomatis menghukum pengguna hanya karena aktivitas terlewat.
- Pengguna dapat memilih menjalankan komitmen, menjadwalkan ulang, mengubah rencana, atau melewati aktivitas.

## 11. Indikator keberhasilan MVP

Indikator awal yang dapat diuji pada demo/pengujian:
- Pengguna dapat mendaftar, login, dan menyelesaikan onboarding.
- Pengguna dapat membuat tujuan dan mengisi alasan pribadi.
- Pengguna dapat menyusun roadmap dan menentukan langkah berikutnya.
- Pengguna dapat melihat panduan aktivitas harian dan mengelola kebiasaan.
- Pengguna dapat menandai aktivitas selesai, menjadwalkan ulang, atau melewati aktivitas.
- Pengguna dapat membuat refleksi dan melihat ringkasan perkembangan.
- Pengguna memahami bahwa keputusan dan jadwal tetap berada di bawah kendalinya.

Target angka kuantitatif belum ditetapkan dan tidak boleh dibuat seolah-olah sudah disepakati.

## 12. Batasan proyek

- Durasi pengerjaan: satu bulan.
- Fokus: MVP yang berfungsi dan layak didemokan.
- Tidak melakukan ekspansi fitur tanpa persetujuan.
- Tidak membangun sistem enterprise atau otomasi kompleks yang tidak dibutuhkan MVP.
- Desain desktop diselesaikan lebih dahulu, lalu diadaptasi menjadi mobile responsive.

## 13. Keputusan dan hal yang masih belum diputuskan

Keputusan produk/teknologi yang sudah FIX tercatat pada `docs/15-DECISION-LOG.md`, termasuk stack MVP, Supabase Auth/PostgreSQL, Coach terstruktur tanpa riwayat percakapan, reminder in-app, pengarsipan Goal, dan hitung dinamis untuk review/analytics. Dokumen arsitektur menjelaskan implementasi stack yang sudah disetujui.

Hal yang tetap OPEN:
- Detail schema/migration setelah baseline ERD disetujui; zona waktu, target commitment, dan status Roadmap Step perlu ditetapkan.
- Kebijakan retensi sebelum rilis publik.
- Mekanisme menyimpan/memperoleh zona waktu IANA.
- Verifikasi ketersediaan Supabase Singapore saat provisioning.
- Adaptasi responsif untuk tujuh area tanpa kandidat mobile dan harmonisasi UI berdasar acuan desain yang disetujui.
- Ketersediaan komponen UI, grafik, dan test runner tambahan.
- Target metrik kuantitatif untuk keberhasilan produk.

Gunakan rekomendasi desain yang disetujui pada DEC-027 sebagai acuan; mockup mentah tetap bukan bukti UI/fungsi aplikasi yang berjalan.
