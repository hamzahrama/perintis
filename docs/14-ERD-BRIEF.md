# ERD Brief — PERINTIS

**Status:** Brief perancangan. Baseline ERD konseptual disetujui di `docs/17-erd-proposal.md`; brief ini bukan schema atau izin membuat migration.

## 1. Tujuan

Mengarahkan AI agent menyusun ERD berdasarkan kebutuhan nyata pada User Flow dan Functional Specification. Agent harus menjelaskan alasan setiap tabel dan relasi, bukan membuat tabel sebanyak mungkin.

## 2. Kandidat domain data

Kandidat berikut adalah bahan diskusi, bukan keputusan final:

| Domain | Kandidat entitas | Kegunaan |
|---|---|---|
| Akun | User, Profile, UserPreference | Akun, profil, preferensi |
| Onboarding | Assessment, AssessmentAnswer | Status dan jawaban onboarding |
| Goal | Goal, GoalWhy | Arah dan alasan personal |
| Roadmap | Roadmap, RoadmapStep | Rencana dan langkah |
| Next step | NextStepSession, SuggestedOption, UserChoice | Pilihan tindakan bila perlu disimpan sebagai riwayat |
| Daily | Task/Activity, TaskStatusHistory | Aktivitas dan perubahan status |
| Habit | Habit, HabitLog | Definisi habit dan catatan pelaksanaan |
| Reminder | Reminder, Notification | Preferensi/jadwal dan catatan pengiriman bila benar-benar dibutuhkan |
| Reflection | DailyReflection | Refleksi harian; Weekly Review dihitung dari data aktual tanpa snapshot (DEC-022) |
| Commitment | Commitment | Komitmen sukarela pengguna |
| Wise Personal Growth Mentor | `assistant_conversations`, `assistant_messages` | Riwayat percakapan persisten dan dibatasi pada user terautentikasi (DEC-040); Structured Coach menggunakan data domain yang sudah ada |

## 3. Pertanyaan desain data

Agent wajib mengusulkan jawaban dan menjelaskan trade-off untuk:
1. Goal dapat memiliki histori roadmap dengan maksimal satu roadmap aktif (DEC-017).
2. Satu RoadmapStep dapat menghasilkan beberapa aktivitas (DEC-017).
3. Habit dapat berdiri sendiri; relasi Goal opsional (DEC-019).
4. Activity dan HabitLog adalah model terpisah karena makna dan pencatatan berbeda.
5. Reschedule dan reopen memperbarui aktivitas yang sama serta mencatat event status; aktivitas selesai/dilewati dapat dibuka kembali ke `not_started`, jadwal tetap (DEC-031).
   Matriks transisi status lainnya masih OPEN-014.
6. Weekly Review/Analytics dihitung dinamis per Senin–Minggu lokal dengan hitungan aktivitas terjadwal/selesai/dilewati, log habit, dan refleksi (DEC-032).
7. Structured Coach memakai data domain; Wise Personal Growth Mentor menggunakan tabel percakapan/pesan yang sudah ada (DEC-040); pilihan Next Step tersimpan sebagai step/activity.
8. Reminder dan notification dipisah; due check dilakukan saat aplikasi dibuka (DEC-033).
9. Goal diarsipkan; permintaan hapus akun demo diproses manual tanpa ekspor/UI delete, retensi publik tetap OPEN (DEC-030).
10. Strategi penyimpanan zona waktu IANA masih OPEN-022.

## 4. Aturan ERD

- Semua data privat harus punya relasi kepemilikan yang dapat diverifikasi ke user.
- Gunakan primary key dan foreign key yang konsisten.
- Tentukan nullability, unique constraint, cascade/restrict behavior, dan index.
- Hindari menyimpan data turunan yang bisa dihitung kecuali ada alasan.
- Jangan membuat tabel WeeklyReview/ProgressAnalytics/Calendar untuk data yang dihitung dari aktivitas dan habit (DEC-022).
- Jangan membuat tabel untuk setiap komponen UI.
- Jangan menyimpan rahasia autentikasi secara manual jika provider auth mengelolanya.
- Jangan membuat entitas AI/notification kompleks sebelum mekanismenya diputuskan.
- Riwayat Wise Personal Growth Mentor menggunakan tabel percakapan/pesan yang sudah ada dan harus mempertahankan ownership user; tidak menambah schema database pada keputusan DEC-040.
- Pastikan relasi mendukung seluruh alur MVP, bukan hanya satu halaman.

## 5. Output yang harus diberikan agent

1. ERD Mermaid atau format diagram yang bisa direview.
2. Penjelasan setiap entitas dan relasi.
3. Kardinalitas (1:1, 1:N, N:M).
4. Daftar kolom utama, tipe data, nullable, default, unique.
5. Foreign key, delete behavior, dan index.
6. Contoh alur data: membuat goal → roadmap → task → reflection.
7. Risiko desain dan alternatif.
8. Daftar keputusan yang masih membutuhkan persetujuan.

**Larangan:** jangan langsung membuat migration atau mengubah database sebelum pengguna menyetujui ERD dan keputusan teknis terkait.
