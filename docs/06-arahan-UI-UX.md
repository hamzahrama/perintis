# Arahan UI/UX PERINTIS

## 1. Arah visual

- Modern.
- Minimalis.
- Profesional.
- Sedikit futuristik.
- Tenang, nyaman, positif, dan tidak mengintimidasi.
- Tidak terlalu ramai dan tidak dipenuhi kartu/statistik yang tidak diperlukan.

## 2. Palet warna yang disepakati sebagai arahan desain

| Token | Warna | Penggunaan |
|---|---|---|
| Background utama | `#17172B` | Latar aplikasi |
| Surface/Card | `#22223A` | Kartu dan panel |
| Primary Lavender | `#CBA6F7` | Aksi utama dan highlight |
| Accent Cyan | `#22D3EE` | Aksen dan informasi pendukung |
| Success Mint | `#A6E3A1` | Status positif |
| Text utama | `#F5F5FA` | Teks utama |
| Text sekunder | `#A6A6BC` | Teks sekunder |

Font rekomendasi: Inter atau font sans-serif modern yang setara.

## 3. Layout

### Desktop — dikerjakan lebih dahulu
- Acuan frame: 1440 × 900 px.
- Sidebar tetap di sebelah kiri.
- Area konten utama di sebelah kanan.
- Lebar sidebar dan jarak antarkomponen konsisten.
- Konten tidak terlalu sempit atau terlalu melebar.
- Gunakan ruang kosong agar dashboard mudah dipindai.

### Mobile
- Acuan awal: 390 × 844 px.
- Navigasi bawah.
- Kartu disusun vertikal.
- Form dan tombol mudah digunakan dengan satu tangan.
- Jangan sekadar mengecilkan layout desktop; susun ulang berdasarkan prioritas mobile.
- Stitch menyediakan kandidat mobile untuk Dashboard, Personal Coach, My Direction, My Roadmap, Know Your Next Step, Daily Guidance, My Habits, Remember Your Why, Daily Reflection, dan Weekly Growth Review. Layar mobile lainnya belum tersedia.

## 4. Navigasi desktop

- Overview
- My Direction
- Remember Your Why
- My Roadmap
- Know Your Next Step
- Daily Guidance
- My Habits
- Reminder & Notification
- Daily Reflection
- Weekly Growth Review
- Progress Analytics
- My Commitment
- Calendar View
- Profile & Settings
- Personal Coach harus mudah ditemukan sebagai akses utama/khas.

Kelompokkan menu secara konsisten. Hindari nama berbeda untuk fitur yang sama.

## 5. Prioritas halaman

Urutan desain yang dipilih:
1. Design System.
2. Dashboard / Overview.
3. Personal Coach.
4. My Direction.
5. Remember Your Why.
6. My Roadmap.
7. Know Your Next Step.
8. Daily Guidance.
9. My Habits.
10. Reminder & Notification.
11. Daily Reflection.
12. Weekly Growth Review.
13. Progress Analytics.
14. My Commitment.
15. Calendar View.
16. Profile & Settings.
17. Login & Register.
18. Onboarding & Personal Assessment.

## 6. Catatan hasil Google Stitch

Aset yang tersedia di `stitch_perintis_growth_guidance_dashboard/` berisi 40 folder layar, masing-masing dengan `code.html` dan `screen.png` (80 file). Ada beberapa varian untuk Dashboard, Personal Coach, My Direction, My Roadmap, Daily Guidance, dan My Habits. Sepuluh area memiliki kandidat mobile; halaman lain belum mempunyai desain mobile.

### Arah revisi yang sudah diberikan
- Pertahankan identitas visual yang sudah ada.
- Jangan membuat ulang seluruh desain dari awal.
- Samakan sidebar dan navigasi global.
- Samakan komponen, radius kartu, tipografi, tombol, ikon, dan jarak.
- Gunakan satu identitas dummy yang konsisten bila perlu.
- Hapus elemen yang tidak termasuk MVP.
- Jangan menampilkan layanan mentor manusia, jadwal konsultasi, atau Google Meet.
- Jangan menampilkan klaim keamanan/integrasi yang belum diimplementasikan.
- Pilih satu versi terbaik untuk setiap halaman yang memiliki duplikasi.

### Status
Audit dan rekomendasi kandidat per fitur di `docs/16-stitch-design-audit.md` disetujui sebagai acuan implementasi (DEC-027). Aset tetap mockup; tujuh area belum memiliki kandidat mobile dan harus dibuat responsif tanpa menambah scope.

## 7. Aturan kualitas UI

- Satu fitur memiliki istilah yang konsisten di seluruh halaman.
- Satu pengguna dummy digunakan secara konsisten dalam mockup.
- Data statistik harus masuk akal dan tidak saling bertentangan.
- Jangan menampilkan statistik jika datanya belum tersedia.
- Jangan menambahkan elemen hanya untuk membuat layar terlihat penuh.
- Setiap halaman harus memiliki satu tujuan utama yang mudah dipahami.
- Desain harus realistis untuk diimplementasikan dalam waktu satu bulan.
