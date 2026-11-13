# Functional Specification — PERINTIS

**Versi:** 0.2 — baseline keputusan produk  
**Status:** Perilaku MVP mengikuti keputusan FIX; aturan yang disebut OPEN tetap menunggu keputusan pengguna.

Dokumen ini menjelaskan perilaku yang diharapkan dari setiap bagian aplikasi. Ini bukan desain database final dan bukan instruksi untuk menambah fitur di luar MVP.

## 1. Cara membaca prioritas

- **P0:** wajib berfungsi untuk alur inti MVP.
- **P1:** wajib ada dalam scope, tetapi boleh dibuat sederhana.
- **P2:** implementasi sederhana sesuai waktu; item tetap berada dalam scope MVP.

## 2. Core System

### 2.1 Authentication (Register, Login, Logout) — P0
- Pengguna dapat membuat akun dengan data minimum yang diputuskan saat desain teknis.
- Sistem memvalidasi input dan menampilkan pesan kesalahan yang jelas.
- Setelah register berhasil, sistem langsung membuat sesi pengguna; pengguna tidak perlu login kembali untuk melanjutkan onboarding.
- Pengguna dapat login dan logout.
- Halaman privat hanya dapat diakses pengguna yang memiliki sesi valid.
- Data setiap pengguna harus terisolasi.
- Password tidak boleh disimpan sebagai teks biasa jika autentikasi dikelola aplikasi sendiri.
- Kriteria selesai: register → login → halaman privat → logout berjalan.

### 2.2 User Profile & Settings — P1
- Pengguna dapat melihat dan mengubah informasi profil yang disepakati.
- Pengguna dapat mengubah preferensi yang tersedia.
- Perubahan tersimpan dan tetap ada setelah login kembali.
- Jangan menambahkan pengaturan yang tidak ada di desain/scope.

### 2.3 Onboarding & Personal Assessment — P0
- Pengguna baru diarahkan ke onboarding jika belum selesai.
- Form memiliki pertanyaan dan validasi yang jelas.
- Progres dan jawaban dapat disimpan dan dilanjutkan kembali.
- Pengguna harus menyelesaikan onboarding sebelum dapat membuat goal.
- Hasil assessment disampaikan sebagai ringkasan reflektif, bukan diagnosis atau penilaian klinis.
- Pengguna yang sudah menyelesaikan onboarding tidak dipaksa mengulang setiap login.

### 2.4 Dashboard Overview — P0
- Menampilkan ringkasan yang relevan dari data pengguna sendiri.
- Menampilkan langkah/aktivitas hari ini dan ringkasan goal/habit sesuai desain.
- Jika belum ada data, tampilkan empty state dengan ajakan memulai yang jelas.
- Angka dan grafik harus berasal dari data tersimpan; jangan membuat statistik palsu.

## 3. Personal Growth

### 3.1 Personal Coach — P1
- Pengguna memilih topik/skenario terkurasi dan mendapat panduan statis yang sudah disiapkan (DEC-029).
- Coach menggunakan panduan terstruktur, bukan AI live atau chat bebas yang menghasilkan jawaban dinamis.
- Coach mengarahkan pengguna memahami masalah dan memilih tindakan dengan nada suportif, realistis, tidak menghakimi.
- Saran tindakan sebaiknya 2–4 opsi konkret.
- Pengguna bebas memilih, menggabungkan, membuat opsi sendiri, menunda, atau melewati.
- Riwayat percakapan Coach tidak disimpan setelah sesi berakhir.
- Tidak ada input chat bebas; UI tidak boleh mengklaim personalisasi AI.

### 3.2 My Direction (Goal Management) — P0
- Pengguna dapat membuat, melihat, mengubah, dan mengarsipkan goal.
- Goal tidak dapat dihapus melalui UI MVP; arsip mempertahankan roadmap dan histori terkait.
- Goal minimal memiliki judul dan pemilik.
- Goal selalu terikat pada user yang login.
- Validasi mencegah judul kosong.
- Daftar goal memiliki empty state dan status yang mudah dipahami.

### 3.3 Remember Your Why — P0
- Pengguna dapat menulis dan mengubah alasan pribadi untuk goal.
- Alasan dapat dilihat kembali dari konteks goal.
- Sistem dapat menampilkan pengingat alasan dengan cara suportif, bukan spam.
- Pengguna mengontrol kapan dan bagaimana pengingat ditampilkan sesuai pengaturan yang disetujui.

### 3.4 My Roadmap (Action Planning) — P0
- Pengguna dapat membuat rencana langkah untuk goal.
- Setiap goal memiliki paling banyak satu roadmap aktif.
- Pengguna dapat menambah, mengubah, mengurutkan, dan menyelesaikan langkah.
- Satu langkah dapat dijadwalkan menjadi beberapa aktivitas.
- Langkah memiliki urutan dan status.
- Pengguna dapat menyesuaikan roadmap ketika keadaan berubah.
- Roadmap tidak otomatis memaksakan tanggal yang tidak dipilih pengguna.

### 3.5 Know Your Next Step — P0
- Sistem membantu pengguna menentukan tindakan berikutnya.
- Sistem menampilkan 2–4 opsi yang relevan, atau opsi terstruktur yang tersedia.
- Pengguna dapat memilih satu, menggabungkan, membuat sendiri, menunda, atau melewati.
- Pilihan dan tindakan akhir pengguna disimpan bila menjadi bagian dari roadmap/aktivitas.
- Jangan menyajikan rekomendasi sebagai perintah.

## 4. Daily Execution

### 4.1 Daily Guidance (Daily Planner) — P0
- Menampilkan aktivitas yang dijadwalkan untuk tanggal pengguna.
- Pengguna dapat melihat detail dan status aktivitas.
- Pengguna dapat menandai selesai, reschedule, atau skip.
- Empty state ditampilkan jika belum ada aktivitas.
- Tanggal dihitung menggunakan zona waktu yang sesuai dengan preferensi pengguna.

### 4.2 My Habits (Habit Tracker) — P1
- Pengguna dapat membuat, melihat, mengubah, dan menonaktifkan habit.
- Habit dapat berdiri sendiri; hubungan dengan goal bersifat opsional.
- Pengguna dapat mencatat pelaksanaan habit berdasarkan tanggal.
- Sistem mencegah pencatatan ganda yang tidak disengaja untuk habit dan tanggal yang sama.
- Ringkasan konsistensi berasal dari log aktual; jangan menghukum streak yang terputus.

### 4.3 Reminder & Notification — P2
- Pengguna dapat memilih reminder in-app opsional yang muncul saat aktivitas jatuh tempo.
- Reminder mengikuti waktu dan preferensi yang dipilih pengguna.
- MVP tidak mengirim push/email dan tidak mengintegrasikan layanan kalender eksternal.
- Due reminder diperiksa saat aplikasi dibuka; jangan menjanjikan pengiriman real-time atau saat aplikasi tertutup (DEC-033).
- Jangan menampilkan status terkirim jika notifikasi tidak benar-benar dibuat.

### 4.4 Task Reschedule / Skip — P0
- Pengguna dapat menjadwalkan ulang aktivitas ke tanggal/waktu lain.
- Pengguna dapat melewati aktivitas tanpa pesan menyalahkan.
- Status aktivitas: belum dimulai, sedang berjalan, selesai, dijadwalkan ulang, dan dilewati.
- Reschedule mengubah jadwal dan status menjadi dijadwalkan ulang; beberapa kali reschedule tidak membuat duplikasi aktivitas.
- Refleksi setelah aktivitas dilewati bersifat opsional.
- Pengguna dapat membuka kembali aktivitas selesai/dilewati yang sama: status kembali ke `not_started`, jadwal dipertahankan, dan event status dicatat (DEC-031).
- Transisi status selain reopen masih menunggu matriks yang disepakati (OPEN-014).
- Sistem tidak menggandakan aktivitas secara tidak sengaja saat reschedule.
- Reschedule/skip tidak memicu konsekuensi otomatis.

## 5. Evaluation

### 5.1 Daily Reflection — P1
- Pengguna dapat menulis refleksi harian.
- Form sederhana, tidak membuat pengguna harus menulis panjang.
- Refleksi terikat ke user dan tanggal.
- Pengguna dapat melihat atau mengubah refleksi sesuai aturan final.

### 5.2 Weekly Growth Review — P1
- Menyajikan ringkasan mingguan yang dihitung dinamis dari data aktual, bukan snapshot yang disimpan.
- Periode adalah Senin sampai Minggu berdasarkan zona waktu lokal pengguna (DEC-032).
- Tampilkan hitungan aktivitas terjadwal/selesai/dilewati, log habit, dan refleksi; jangan menambahkan skor.
- Menampilkan apa yang berjalan, hambatan, dan hal yang dapat disesuaikan.
- Jika data kurang, tampilkan keterbatasan data; jangan mengarang kesimpulan.
- Pengguna dapat meninjau hasil dan menentukan penyesuaian.

### 5.3 Progress Analytics — P2
- Menampilkan metrik sederhana dari goals, aktivitas, dan habit yang benar-benar tersimpan.
- Gunakan periode Senin–Minggu lokal dan hitungan aktivitas terjadwal/selesai/dilewati, log habit, dan refleksi (DEC-032).
- Definisi metrik harus jelas dan konsisten.
- Periode tanpa data menampilkan empty state.
- Jangan membuat klaim perkembangan yang tidak didukung data.

## 6. Additional

### 6.1 My Commitment — P2
- Pengguna boleh memilih komitmen/konsekuensi sendiri atau tidak memilih apa pun.
- Konsekuensi harus aman, wajar, proporsional, sukarela, dapat diubah/dihapus.
- Dilarang menyarankan tindakan yang menyakiti, mempermalukan, membahayakan kesehatan, mengganggu makan/tidur/kebutuhan dasar, atau memberi beban finansial tidak wajar.
- Tidak ada eksekusi hukuman otomatis ketika aktivitas terlewat.
- Saat sakit, kelelahan, darurat, atau alasan valid, konsekuensi tidak diwajibkan.
- Pengguna dapat memilih menjalankan, reschedule, revise, atau skip.

### 6.2 Calendar View — P2
- Menampilkan aktivitas dan habit terjadwal dalam kalender.
- Memilih tanggal menampilkan item pada tanggal tersebut.
- Data kalender berasal dari Daily Guidance dan jadwal habit, bukan entri duplikat yang tidak sinkron.
- Tampilan kalender mengikuti zona waktu pengguna.

### 6.3 Theme Customization — P2
- Pengguna dapat memilih Dark (default) atau Light (DEC-035).
- Pilihan tema tersimpan sesuai preferensi.
- Tema tidak boleh membuat kontras dan keterbacaan buruk.
- Jangan menambah sistem tema kompleks di luar kebutuhan MVP.

## 7. Persyaratan lintas fitur

- Semua data personal dimiliki user yang login.
- Validasi penting dilakukan di server.
- Tampilkan loading, success, error, dan empty states.
- Form memiliki pesan kesalahan yang dapat dipahami.
- UI responsif pada desktop dan mobile.
- Aksesibilitas dasar: label form, fokus keyboard, kontras, dan tombol yang jelas.
- Tanggal/waktu pada aktivitas, Calendar View, Weekly Growth Review, dan Progress Analytics dihitung menggunakan zona waktu lokal perangkat pengguna.
- Untuk demo, ekspor dan penghapusan akun mandiri tidak tersedia; permintaan penghapusan diproses manual. Kebijakan retensi sebelum rilis publik masih OPEN (DEC-030).
- Tidak ada secret/API key di client atau repository.
- Tidak ada fitur visual yang berpura-pura telah terhubung ke backend.

## 8. Definition of Done per fitur

Fitur dianggap selesai jika:
1. Tampilan sesuai desain yang disetujui.
2. Alur utama dapat dijalankan.
3. Data tersimpan dan dapat dibaca kembali jika memang diperlukan.
4. Validasi dan error state ditangani.
5. Hak akses dan kepemilikan data benar.
6. Responsive desktop/mobile diperiksa.
7. Lint/typecheck/test relevan lolos.
8. Dokumentasi dan backlog diperbarui.
9. Tidak ada klaim fungsionalitas yang belum tersedia.

## 9. Keputusan yang masih wajib dikonfirmasi
Functional spec ini sengaja belum mengunci:
- Field final setiap form yang belum ditetapkan di desain.
- Cara memperoleh/menyimpan zona waktu IANA; proposal saat ini hanya dipakai di schema development dan harus dikonfirmasi sebelum schema final/provisioning.
- Matriks transisi status selain reopen aktivitas sebelum implementasi reschedule/skip.
- Kebijakan retensi sebelum rilis publik.
- Apakah My Commitment dapat dibuat tanpa target Goal/Activity (OPEN-023); proposal saat ini hanya dipakai di schema development.
- Status minimum Roadmap Step (OPEN-024); proposal saat ini hanya dipakai di schema development. Field onboarding/reflection sebelum task UI terkait.
- Verifikasi ketersediaan Supabase Singapore sebelum provisioning.

Stack, provider authentication, Coach tanpa AI live/riwayat, dan batas reminder in-app telah diputuskan. Catat perubahan keputusan di Decision Log sebelum implementasi terkait.
