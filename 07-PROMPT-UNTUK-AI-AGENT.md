# Prompt Kerja AI Agent — PERINTIS

Gunakan prompt secara bertahap. Jangan kirim semua prompt sekaligus. Ganti placeholder `[ ... ]` dengan kondisi nyata repository jika diperlukan.

## Prompt 1 — Orientasi dan audit (berikan pertama kali)

```text
Kita akan mengembangkan PERINTIS, sebuah Personal Growth Guidance Platform.
Target kita adalah MVP yang berfungsi dalam satu bulan.

Sebelum melakukan perubahan apa pun:
1. Baca AGENTS.md dan seluruh dokumen relevan di docs/.
2. Identifikasi keputusan FIX, PROPOSED, dan OPEN.
3. Audit kondisi repository: framework, package manager, struktur folder,
   halaman yang sudah ada, komponen, database, auth, test, lint, dan build.
4. Audit aset desain Google Stitch yang tersedia. Jangan menebak jika aset
   atau halaman final belum jelas.
5. Cocokkan halaman desain dengan 19 item scope MVP.
6. Buat laporan:
   - kondisi repository saat ini,
   - apa yang sudah ada dan dapat digunakan,
   - gap terhadap MVP,
   - konflik desain/dokumen,
   - keputusan teknis yang masih OPEN,
   - risiko dan rekomendasi urutan kerja.

JANGAN coding, menginstal dependency, mengubah file, membuat migration,
atau memilih keputusan OPEN pada tahap ini.
Jika ada konflik, tunjukkan lokasi dan minta keputusan saya.
```

## Prompt 2 — Finalisasi flow dan spesifikasi

```text
Baca docs/02-USER-FLOW.md dan docs/03-FUNCTIONAL-SPECIFICATION.md.
Bandingkan dengan desain final dan scope MVP.

Tugas:
1. Temukan alur yang belum lengkap atau saling bertentangan.
2. Buat daftar pertanyaan keputusan yang benar-benar memengaruhi implementasi.
3. Berikan rekomendasi sederhana yang realistis untuk MVP satu bulan.
4. Perbarui dokumen hanya setelah saya menyetujui rekomendasi.
5. Jangan menambah fitur di luar scope.

Jangan coding atau membuat database pada tahap ini.
```

## Prompt 3 — Rancang ERD

```text
Baca PRD, keputusan produk, scope MVP, User Flow, Functional Specification,
dan Decision Log.

Rancang ERD untuk seluruh alur MVP:
- akun dan profil,
- onboarding,
- goals dan Remember Your Why,
- roadmap dan steps,
- Know Your Next Step,
- daily tasks dan reschedule/skip,
- habits dan habit logs,
- reminder/notification sesuai keputusan,
- reflection dan weekly review,
- progress analytics,
- My Commitment,
- calendar aggregation,
- Personal Coach hanya sesuai keputusan penyimpanan data.

Berikan:
1. Diagram ERD Mermaid.
2. Entitas, kolom utama, tipe, nullable/default.
3. Primary key, foreign key, unique constraint, index.
4. Kardinalitas dan aturan penghapusan.
5. Cara memastikan semua data terikat ke user yang login.
6. Contoh alur data goal sampai reflection.
7. Trade-off dan keputusan yang masih OPEN.

Jangan membuat migration, mengubah schema, atau menginstal dependency.
Tunggu persetujuan saya terhadap ERD.
```

## Prompt 4 — Rekomendasi dan kunci arsitektur

```text
Audit kebutuhan PERINTIS dan repository. Berikan rekomendasi stack final
yang paling realistis untuk MVP satu bulan dan kemampuan project saat ini.

Bahas secara ringkas:
- framework dan versi,
- database dan hosting,
- ORM/data access,
- authentication,
- validation,
- AI Coach,
- reminder,
- deployment,
- struktur folder,
- testing dan environment.

Untuk setiap pilihan, jelaskan alasan, biaya/risiko, dan alternatif.
Pisahkan rekomendasi dari keputusan. Jangan mengimplementasikan pilihan
yang masih OPEN sampai saya menyetujuinya.
Setelah saya setujui, catat ke Decision Log.
```

## Prompt 5 — Setup fondasi

```text
Kerjakan hanya task Sprint 1 yang saya tunjuk dari docs/04-BACKLOG-30-HARI.md.

Sebelum coding:
1. Sebutkan task dan acceptance criteria.
2. Sebutkan file yang akan dibuat/diubah.
3. Jelaskan pendekatan singkat dan risiko.

Setelah saya setujui:
- implementasikan hanya scope task tersebut,
- ikuti desain final dan AGENTS.md,
- jangan menambah fitur,
- jangan mengubah keputusan FIX,
- jalankan lint/typecheck/test/build yang relevan,
- perbaiki error yang disebabkan perubahanmu.

Akhiri dengan laporan file berubah, hasil pemeriksaan, kekurangan,
dan status backlog. Jangan tandai selesai jika belum diverifikasi.
```

## Prompt 6 — Pola untuk setiap task berikutnya

```text
Kita mengerjakan task berikut:
[ID/NAMA TASK DARI BACKLOG]

Baca dokumen dan konteks yang relevan sebelum bekerja.
Pertama berikan rencana implementasi, file yang akan disentuh,
dependency/risiko, dan acceptance criteria. Jangan coding dulu.

Setelah saya menyetujui rencana, implementasikan task ini saja.
Jangan mengerjakan task lain atau memperluas scope.
Setelah implementasi, jalankan pemeriksaan yang relevan dan laporkan:
1. apa yang selesai,
2. file yang berubah,
3. hasil lint/typecheck/test/build,
4. hal yang belum selesai,
5. keputusan yang perlu saya ambil,
6. pembaruan backlog dan dokumentasi.
```

## Prompt 7 — Code review akhir sprint

```text
Lakukan review terhadap perubahan sprint yang baru selesai.
Jangan langsung mengubah kode.

Periksa:
- kesesuaian dengan PRD, scope, flow, functional spec, dan desain,
- bug fungsional,
- validasi server,
- akses dan isolasi data antar-user,
- error/loading/empty state,
- responsive desktop/mobile,
- kualitas tipe dan struktur kode,
- secret/environment,
- test, lint, typecheck, build.

Urutkan temuan berdasarkan Critical/High/Medium/Low.
Untuk setiap temuan sebutkan file dan bukti.
Berikan rencana perbaikan. Tunggu persetujuan sebelum perubahan besar.
```

## Prompt 8 — Persiapan release dan demo

```text
Siapkan PERINTIS untuk demo MVP berdasarkan Definition of Done di backlog.

Periksa:
- alur register sampai reflection,
- semua 19 item scope dan status implementasinya,
- data demo terpisah dari data nyata,
- keamanan dasar dan akses antar-user,
- responsive desktop/mobile,
- environment production dan migration,
- deployment dan smoke test,
- README setup dan batasan fitur.

Jangan mengklaim fitur berfungsi jika belum diverifikasi.
Buat daftar blocker release dan rekomendasi. Perbaiki hanya bug yang
sudah saya setujui atau yang termasuk task release yang jelas.
```

## Prompt 9 — Setelah project selesai

```text
Buat handover akhir PERINTIS:
- ringkasan fitur yang benar-benar selesai,
- fitur yang disederhanakan/belum tersedia,
- cara menjalankan lokal,
- environment variables tanpa membocorkan nilainya,
- cara migration dan seed,
- URL deployment jika tersedia,
- akun demo jika aman disediakan,
- hasil test/build/smoke test,
- bug yang diketahui,
- struktur dokumentasi dan backlog akhir.

Perbarui status proyek menjadi DONE hanya untuk item yang telah diverifikasi.
Jangan menghapus riwayat keputusan atau task yang belum selesai.
```
