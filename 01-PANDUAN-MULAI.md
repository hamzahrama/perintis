# Panduan Memulai Development PERINTIS

## 1. Ke mana keputusan proyek dibawa?

Jadikan repository Git PERINTIS sebagai **sumber kebenaran utama (single source of truth)**. Jangan menyimpan keputusan hanya di chat, Telegram, atau ingatan agent.

Struktur dokumentasi yang disarankan:

```text
perintis/
├── AGENTS.md
├── docs/
│   ├── README.md
│   ├── 01-PRD-PERINTIS.md
│   ├── 02-keputusan-produk.md
│   ├── 03-scope-MVP.md
│   ├── 04-riset-pengguna.md
│   ├── 05-user-journey-dan-UX.md
│   ├── 06-arahan-UI-UX.md
│   ├── 07-arsitektur-dan-teknologi.md
│   ├── 08-rencana-pengerjaan-1-bulan.md
│   ├── 09-prompt-google-stitch.md
│   ├── 10-status-dan-keputusan-terbuka.md
│   ├── 11-USER-FLOW.md
│   ├── 12-FUNCTIONAL-SPECIFICATION.md
│   ├── 13-BACKLOG-30-HARI.md
│   ├── 14-ERD-BRIEF.md
│   ├── 15-DECISION-LOG.md
│   ├── 16-stitch-design-audit.md
│   └── 17-erd-proposal.md
├── src/
└── ...
```

Nama dan penomoran boleh disesuaikan. Yang penting semua keputusan dan spesifikasi ada di repository, ikut tersimpan di Git, dan bisa dibaca agent.

**Saran:** gabungkan dokumen paket ini dengan dokumen keputusan proyek yang sudah ada. Jangan mengganti dokumen lama secara otomatis; pertahankan riwayat dan tautkan dari README utama.

## 2. Informasi yang diberikan kepada AI agent

Berikan konteks berikut sebelum agent mulai coding:

1. **Dokumen produk:** PRD, keputusan produk, scope MVP.
2. **Desain:** ZIP/hasil Google Stitch desktop dan mobile, screenshot final, aset, serta keterangan halaman mana yang disetujui.
3. **Alur dan perilaku:** User Flow dan Functional Specification.
4. **Data:** ERD proposal dan aturan data; schema/migration hanya setelah ERD disetujui.
5. **Rencana kerja:** backlog, sprint aktif, kriteria selesai.
6. **Teknis:** stack FIX DEC-026, baseline npm/lint/typecheck/build DEC-036, keputusan tooling tambahan yang masih OPEN, environment, dan cara menjalankan project.
7. **Batasan:** jangan menambah fitur, jangan mengubah desain/keputusan FIX tanpa izin, jangan menampilkan rahasia di source code.

Jangan mengirim seluruh konteks berulang kali jika dokumen sudah ada di repository. Cukup arahkan agent untuk membaca dokumen yang relevan dan menyebutkan file yang dibacanya.

## 3. Cara bekerja bersama agent

Gunakan pola kerja kecil dan dapat diperiksa:

1. **Plan:** minta agent menjelaskan pendekatan dan file yang akan disentuh.
2. **Approve:** periksa rencana; setujui atau koreksi.
3. **Implement:** minta implementasi satu bagian yang jelas.
4. **Verify:** agent menjalankan lint, typecheck, test, dan/atau build yang tersedia.
5. **Review:** agent melaporkan hasil, kekurangan, dan risiko.
6. **Update docs:** backlog dan decision log diperbarui.
7. **Commit:** simpan perubahan dalam Git setelah kamu memeriksa hasilnya.

Jangan meminta agent membuat banyak modul sekaligus tanpa checkpoint. Jika agent menemukan keputusan yang belum dibuat, minta ia mengajukan opsi dan rekomendasi, bukan memilih diam-diam.

## 4. Cara menyimpan keputusan

Setiap keputusan penting dicatat dengan format:

- ID: `DEC-001`
- Tanggal:
- Topik:
- Status: FIX / PROPOSED / OPEN
- Konteks:
- Opsi:
- Keputusan:
- Dampak:
- Disetujui oleh:

Keputusan yang sudah FIX tidak boleh berubah karena saran agent. Jika perlu diubah, agent harus menjelaskan alasan dan menunggu persetujuan.

## 5. Status ERD dan prasyarat schema

Baseline ERD konseptual sudah disetujui pengguna (DEC-028). Sebelum membuat schema/migration:
- Selesaikan OPEN-022–024 yang berdampak pada timezone, target commitment, field form, dan status domain.
- Verifikasi Supabase Singapore tersedia saat provisioning (DEC-034); jika tidak, minta keputusan pengguna.
- Retensi sebelum rilis publik tetap OPEN-013; kebijakan demo mengikuti DEC-030.
- Periksa kolom dan constraint final terhadap Functional Specification dan aturan OPEN.
- Ikuti acuan desain yang disetujui (DEC-027); tujuh area tanpa kandidat mobile memerlukan layout responsif saat UI dikerjakan.
- Stack/database/provider utama mengikuti DEC-026; npm dan pemeriksaan dasar mengikuti DEC-036; tooling tambahan tetap OPEN.

ERD dibuat dari kebutuhan data dan proses, bukan sekadar menyalin elemen visual dari UI. Persetujuan ERD tidak dengan sendirinya membuat schema atau migration.

## 6. Aturan praktis saat agent membuat perubahan

- Minta agent menyebutkan file yang akan dibuat/diubah sebelum pekerjaan besar.
- Minta perubahan tetap modular dan sesuai pola repository.
- Minta validasi input di sisi server.
- Setiap data privat harus dibatasi berdasarkan user yang login.
- Jangan menaruh API key, password, atau secret di Git.
- Jangan mengklaim reminder, AI, email, atau integrasi berjalan jika hanya berupa UI.
- Jika ada error, minta agent mencari akar masalah dan memperbaiki penyebabnya, bukan menutupi error.
- Jangan lanjut ke sprint berikutnya jika kriteria inti sprint aktif belum lolos.
