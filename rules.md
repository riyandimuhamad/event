# Rules — EventOps

Dokumen ini berisi aturan yang HARUS diikuti saat membangun EventOps, termasuk oleh agen AI (Antigravity). Jika ada konflik dengan dokumen lain, aturan di sini yang berlaku untuk perilaku, dan `architecture.md` untuk struktur teknis.

Gunakan kata wajib: **MUST** (harus), **MUST NOT** (dilarang), **SHOULD** (sebaiknya).

---

## Bagian A — Aturan Eksekusi untuk Agen (Antigravity)

### A1. Urutan kerja
1. Baca `prd.md`, `architecture.md`, `schema.md`, `design.md`, dan `rules.md` sebelum menulis kode apa pun.
2. Kerjakan berdasarkan milestone di `prd.md` Bagian 10. MUST NOT melompati milestone tanpa alasan tertulis.
3. Setiap milestone selesai harus punya: kode, migrasi, test, dan catatan singkat perubahan di `docs/CHANGELOG.md`.
4. Jika ada pertanyaan terbuka di `prd.md` Bagian 9, gunakan default yang tertulis dan catat keputusan di CHANGELOG.

### A2. Batasan perubahan
- MUST NOT mengubah skema database tanpa membuat migrasi Prisma.
- MUST NOT menambah dependensi baru tanpa mencatatnya di CHANGELOG beserta alasannya.
- MUST NOT mengubah aturan di dokumen ini tanpa persetujuan pemilik (Riyandi). Jika aturan terasa salah, tulis usulan di `docs/PROPOSALS.md`.
- MUST NOT menghapus test yang gagal hanya agar build hijau. Perbaiki kodenya atau laporkan kegagalan.
- MUST NOT menyimpan secret, kunci API, atau kredensial di kode. Gunakan `.env` dan `.env.example`.

### A3. Kualitas kode
- TypeScript dengan mode `strict`. MUST NOT memakai `any` kecuali di batas yang tidak bisa dihindari, dan wajib diberi komentar alasannya.
- Setiap fungsi service public MUST punya test unit minimal untuk jalur sukses dan satu jalur gagal.
- Penamaan: variabel dan fungsi `camelCase`, tipe dan komponen `PascalCase`, file komponen `kebab-case.tsx`, konstanta `UPPER_SNAKE_CASE`.
- Bahasa kode (nama variabel, fungsi, komentar) dalam Bahasa Inggris. Teks yang dilihat pengguna dalam Bahasa Indonesia, lewat file i18n.
- Komentar hanya untuk menjelaskan "mengapa", bukan "apa".

### A4. Definisi selesai (Definition of Done)
Sebuah fitur dianggap selesai jika:
- [ ] Fitur bekerja sesuai alur di `prd.md`.
- [ ] Aturan RBAC di Bagian C sudah diterapkan dan diuji.
- [ ] Isolasi tenant sudah diuji (lihat C1).
- [ ] Perubahan data penting menulis `audit_logs`.
- [ ] Tidak ada error atau warning di lint dan typecheck.
- [ ] Teks UI dalam Bahasa Indonesia dan mengikuti `design.md` Bagian 9.
- [ ] Tampilan diuji di lebar 375 px dan 1280 px.

### A5. Hal yang harus ditanyakan, bukan ditebak
Agen MUST berhenti dan bertanya jika:
- Perubahan akan menghapus data yang sudah ada.
- Ada kebutuhan pembayaran sungguhan atau integrasi pihak ketiga yang belum ada di PRD.
- Aturan bisnis di PRD bertentangan dengan permintaan terbaru.

---

## Bagian B — Aturan Bisnis

### B1. Tenant dan event
- Setiap data bisnis MUST memiliki `organization_id`.
- Satu user boleh menjadi anggota banyak EO.
- Event yang sudah `ARCHIVED` bersifat read-only, kecuali oleh Owner EO.
- Event tidak boleh memiliki `ends_at` sebelum `starts_at`.

### B2. Divisi
- Setiap divisi punya tepat satu `HEAD` yang aktif. Jika Head dihapus dari divisi, divisi wajib menunjuk Head baru sebelum perubahan disimpan.
- Divisi tidak boleh dihapus jika masih memiliki committee, volunteer, atau kebutuhan terbuka. Divisi cukup dinonaktifkan (soft delete) setelah semua itu ditutup.

### B3. Committee dan Volunteer
- Committee terikat ke tepat satu divisi per event.
- Volunteer boleh di-approve oleh Head divisi yang bersangkutan atau Event Manager.
- Volunteer yang `REJECTED` atau `WITHDRAWN` tidak boleh di-check-in.
- Kode volunteer (`VOL-XXXX`) tidak boleh diubah setelah dibuat, karena sudah tercetak di ID card.
- Satu volunteer tidak boleh berada di dua shift yang waktunya bertabrakan. Validasi dilakukan di service.
- Data committee dan volunteer yang dihapus MUST di-soft delete, dan tidak boleh muncul di daftar aktif.

### B4. Kebutuhan antar-divisi (Requisition)

Diagram transisi status yang diizinkan:

```
DRAFT ──submit──► SUBMITTED ──approve──► APPROVED ──start──► IN_PROGRESS ──fulfill──► FULFILLED ──close──► CLOSED
  ▲                  │                                              │
  │                  └──reject──► REJECTED ──revise──► DRAFT ◄──────┘ (hanya sebelum FULFILLED)
  └──────────────── (penulis boleh edit selama DRAFT atau REJECTED)
```

Aturan:
- Hanya pembuat (`requested_by`) atau Head divisi pembuat yang boleh men-submit.
- Hanya Head divisi tujuan yang boleh approve atau reject.
- Reject MUST menyertakan alasan (minimal 10 karakter).
- Setelah `APPROVED`, item kebutuhan MUST NOT diubah. Perubahan wajib membuat revisi baru.
- Transisi ke `CLOSED` hanya oleh Head divisi pembuat, dan hanya setelah `FULFILLED`.
- Setiap transisi menulis baris ke `requisition_events` dan `audit_logs`.
- Kebutuhan dengan prioritas `URGENT` memicu notifikasi langsung ke Head divisi tujuan dan Event Manager.
- Kebutuhan yang melewati `needed_by` tanpa `FULFILLED` ditandai `OVERDUE` di dashboard (tampilan saja, tidak mengubah status).

### B5. Logistik pra-event (kaos, ID card, perlengkapan)
- Stok fisik (`total_stock`) boleh diubah oleh Admin Perlengkapan. Perubahan MUST dicatat di audit log.
- `distributed` MUST NOT diubah langsung. Nilainya dihitung dari `inventory_distributions` dengan status `TAKEN`.
- Pengambilan kaos MUST memeriksa stok tersisa dalam satu transaksi dengan row lock. Stok tidak boleh negatif.
- Distribusi yang dibatalkan (`CANCELLED`) MUST mengembalikan stok.
- Ukuran kaos tidak boleh diubah setelah status `TAKEN`.

### B6. Konsumsi (Hari H)
- Pemberian makan hanya boleh untuk penerima yang sudah check-in pada hari itu (untuk relawan), atau terdaftar di daftar penerima tipe lain.
- Satu penerima hanya boleh menerima satu kali per slot, kecuali kebijakan event menyatakan lain (dicatat di `events`).
- Slot yang `CLOSED` MUST NOT menerima distribusi baru. Hanya Event Manager yang boleh membuka kembali.
- `served_count` dihitung ulang oleh service dalam transaksi yang sama dengan insert distribusi.
- Saat distribusi offline disinkronkan dan slot sudah penuh atau penerima sudah tercatat, operasi ditolak dengan kode `ALREADY_SERVED` dan petugas diberi tahu.
- Konsumsi untuk vendor crew dan talent mengikuti aturan yang sama dan dicatat di slot yang sama.

### B7. Check-in dan check-out
- Check-in relawan hanya boleh untuk shift yang ditugaskan, atau jika Head divisi mengizinkan check-in lintas shift (dicatat sebagai override).
- Check-in kedua pada hari yang sama menampilkan peringatan dengan waktu check-in pertama, dan tidak membuat baris baru.
- Check-out tanpa check-in tidak diizinkan.

### B8. Benefit (fee dan sertifikat)
- Fee dan sertifikat dicatat sebagai baris terpisah di tabel `benefits`.
- Status fee berjalan: `UNPAID` → `PROCESSING` → `PAID`. Tidak boleh loncat dari `UNPAID` langsung ke `PAID` tanpa bukti transfer.
- Status `PAID` wajib menyertakan `proof_file_id` dan `paid_at`.
- Benefit `PAID` MUST NOT diubah nominalnya. Koreksi dilakukan dengan entri baru dan alasan tertulis.
- Nomor sertifikat dibuat sekali dan tidak boleh diubah. Format: `CERT/{KODE_EVENT}/{TAHUN}/{NOMOR_URUT}`.
- Sertifikat hanya boleh dicetak jika status volunteer atau committee `COMPLETED` atau `CONFIRMED` di event tersebut.

### B9. Vendor dan crew
- Vendor boleh dipakai di banyak event, tetapi pesanan (`vendor_orders`) selalu terikat ke satu event.
- Crew vendor yang `REMOVED` tidak boleh check-in.
- Pesanan `PAID` MUST NOT dihapus. Hanya boleh `CANCELLED` dengan alasan.

### B10. Talent dan sponsor
- Talent yang `CANCELLED` tidak boleh dijadwalkan di `talent_shows`.
- Sponsor dengan `payment_status` `UNPAID` tetap boleh memiliki deliverable, tetapi status deliverable `DELIVERED` tidak boleh ditandai sebelum `PARTIAL` atau `PAID`. Aturan ini bisa diubah Event Manager dengan catatan.
- Perwakilan sponsor (`rep_user_id`) hanya melihat data sponsornya sendiri dan deliverable miliknya.

### B11. Notifikasi
- Notifikasi tidak boleh berisi data personal sensitif (nomor identitas, nominal fee per orang) dalam badan pesan. Cukup tautan.
- Pengingat jadwal dikirim H-1 pukul 19.00 WIB dan H-0 pukul 06.00 WIB.
- Pengguna bisa mematikan notifikasi jenis tertentu, kecuali pengingat jadwal dan kebutuhan `URGENT`.

---

## Bagian C — Keamanan dan Hak Akses

### C1. Isolasi tenant
- Setiap query data bisnis MUST difilter dengan `organization_id` yang berasal dari session atau dari resolusi `orgSlug` yang sudah diverifikasi, bukan dari body request.
- Setiap endpoint MUST punya test yang memastikan user EO lain mendapat `404`.
- Relasi antar-tabel MUST divalidasi milik organisasi yang sama sebelum disimpan (misal `volunteer.division_id` harus dari event dan organisasi yang sama).

### C2. Matriks peran dan akses

Legenda: **R** = baca, **W** = ubah, **A** = setujui, **—** = tidak ada akses. Cakupan: **Semua** = seluruh event, **Divisi** = divisinya saja, **Milik** = data miliknya sendiri.

| Modul | Owner | Event Manager | Head Divisi | Committee | Volunteer | Talent Mgr | Sponsor Rep | Vendor Admin | Vendor Crew |
|---|---|---|---|---|---|---|---|---|---|
| Organisasi | RW | R | R | — | — | — | — | — | — |
| Event | RW | RW | R | R | R (jadwal) | R (show-nya) | R (sponsornya) | — | R (jadwalnya) |
| Divisi | RW | RW | RW (divisinya) | R | — | — | — | — | — |
| Committee | RW | RW | RW (divisinya) | R (semua), W (data diri) | — | — | — | — | — |
| Volunteer | RW | RW | RW (divisinya) | R (semua), W (divisinya) | R (milik) | — | — | — | — |
| Kebutuhan | RW | RW | RW (keluar), A (masuk) | RW (divisinya) | — | — | — | — | — |
| Logistik pra-event | RW | RW | RW (divisinya) | RW (divisinya) | R (milik) | — | — | — | — |
| Konsumsi H-day | RW | RW | RW (divisinya) | RW (divisinya) | R (milik) | — | — | R | R (milik) |
| Check-in H-day | RW | RW | RW (divisinya) | RW (divisinya) | — | — | — | — | — |
| Vendor | RW | RW | R (divisinya) | R (divisinya) | — | — | — | RW (vendornya) | — |
| Crew vendor | RW | RW | R (divisinya) | R (divisinya) | — | — | — | RW (vendornya) | R (milik) |
| Talent | RW | RW | R | R | — | RW (talent-nya) | — | — | — |
| Sponsor | RW | RW | R | R | — | — | R (sponsornya) | — | — |
| Benefit | RW | RW | R (divisinya) | R (milik) | R (milik) | — | — | — | — |
| Pencairan benefit (A) | RW | RW | — | — | — | — | — | — | — |
| Audit log | R | R | R (divisinya) | — | — | — | — | — | — |

Catatan:
- Committee boleh melihat seluruh committee dan volunteer dalam event (untuk koordinasi), tetapi nomor identitas dan kontak personal hanya terlihat oleh Event Manager, Owner, dan Head divisi terkait.
- Volunteer tidak melihat data volunteer lain, kecuali nama dan divisi rekan satu shift.
- Pencairan fee (`PAID`) hanya boleh oleh Owner atau Event Manager, dengan jejak audit.

### C3. Penanganan data personal
- Nomor identitas dienkripsi di level aplikasi (AES-256-GCM). Kunci tidak disimpan di database.
- Nomor identitas hanya ditampilkan dalam bentuk tersamarkan (`****1234`), kecuali pengguna dengan izin `identity:read`.
- Ekspor data (CSV, Excel) berisi data personal MUST dicatat di audit log dengan jenis `export.personal_data`.
- Permintaan penghapusan data oleh relawan diproses sebagai anonimisasi (nama dan kontak diganti), bukan hapus baris, agar riwayat keuangan tetap utuh.
- Data personal event yang sudah `ARCHIVED` lebih dari 12 bulan MUST dianonimisasi lewat job terjadwal.

### C4. Autentikasi dan sesi
- Login hanya lewat magic link atau Google OAuth. MUST NOT ada penyimpanan password di aplikasi.
- Sesi kedaluwarsa setelah 30 hari tidak aktif. Aksi sensitif (pencairan benefit, ubah peran) meminta autentikasi ulang jika sesi lebih dari 15 menit.
- Setiap perubahan peran MUST dicatat di audit log.

### C5. Input dan output
- Semua input divalidasi dengan Zod di server, walaupun sudah divalidasi di client.
- Output HTML di-escape secara default. MUST NOT memakai `dangerouslySetInnerHTML` kecuali konten sudah disanitasi dan disetujui di code review.
- Upload file: whitelist tipe, batas 5 MB, nama acak, pemindaian ukuran dan tipe sebelum disimpan.
- Query SQL mentah MUST memakai parameter binding. MUST NOT ada string concatenation.

### C6. Logging
- Log tidak boleh berisi email, nomor HP, nomor identitas, atau isi token.
- Error yang dikirim ke klien tidak boleh menampilkan stack trace atau pesan database.

---

## Bagian D — Aturan Audit dan Integritas

- `audit_logs` dan `requisition_events`, `benefit_events` bersifat append-only. Tidak ada endpoint atau job yang melakukan UPDATE atau DELETE terhadapnya. Dijaga dengan hak akses database (role aplikasi hanya `INSERT` dan `SELECT`).
- Setiap aksi yang mengubah status atau nominal uang MUST menulis audit log dalam transaksi yang sama dengan perubahan data.
- Waktu di audit log diambil dari server (`now()`), bukan dari client.
- Perubahan konfigurasi event (tanggal, lokasi, slot konsumsi) setelah status `DAY_OF` MUST menulis audit log dengan alasan.

---

## Bagian E — Aturan Mode Offline

- Hanya fitur check-in, distribusi makan, distribusi logistik, dan lihat jadwal yang boleh offline.
- Antrean offline MUST disimpan dengan enkripsi ringan di IndexedDB dan dihapus setelah sinkronisasi sukses.
- Setiap operasi offline MUST punya `client_op_id` (UUID v4) dan `client_timestamp`.
- Server MUST memproses operasi secara idempoten. Pengiriman ulang dengan `client_op_id` yang sama mengembalikan hasil yang sama, tanpa efek ganda.
- Urutan sinkronisasi mengikuti `client_timestamp`, tetapi operasi yang gagal tidak boleh menghentikan operasi lain.
- Data sisa di perangkat setelah event ditutup MUST dihapus saat pengguna logout atau setelah 24 jam tanpa koneksi.

---

## Bagian F — Aturan Pengujian

- Test wajib untuk setiap state machine transisi (valid dan invalid).
- Test wajib untuk setiap aturan di Bagian B yang punya angka atau batasan (stok, kapasitas, jumlah maksimal distribusi).
- Test isolasi tenant wajib untuk setiap endpoint baru.
- Test konkurensi wajib untuk distribusi stok dan konsumsi: dua permintaan paralel pada stok atau slot yang sama, hasilnya tidak boleh melebihi batas.
- E2E wajib untuk alur A sampai D di `prd.md`.
- Build tidak boleh hijau jika coverage `services/` dan `rbac/` di bawah 80%.

---

## Bagian G — Aturan Git dan Rilis

- Branch: `main` (stabil), `develop` (integrasi), `feat/<modul>-<deskripsi>`, `fix/<deskripsi>`.
- Commit mengikuti Conventional Commits: `feat(requisition): add reject reason validation`.
- Setiap PR MUST melewati CI (lint, typecheck, test, build).
- Migrasi database dalam PR yang sama dengan perubahan kode yang membutuhkannya.
- Tag versi mengikuti SemVer. Rilis pertama `0.1.0` setelah milestone M3.

---

## Bagian H — Aturan Bahasa dan Konten UI

- Semua teks UI dalam Bahasa Indonesia, disimpan di `locales/id.json`. MUST NOT ada teks keras (hardcoded) di komponen.
- Pesan error untuk pengguna harus spesifik dan menyarankan langkah berikutnya.
- Pesan error untuk developer boleh dalam Bahasa Inggris dan disimpan di log.
- Kode error API memakai huruf besar dan garis bawah, misal `REQUISITION_INVALID_TRANSITION`.

---

## Bagian I — Prioritas Jika Terjadi Konflik

Urutan prioritas aturan ketika dua dokumen bertentangan:
1. Keamanan dan privasi data personal (Bagian C).
2. Integritas data keuangan dan audit (Bagian D, B8).
3. Aturan bisnis (Bagian B).
4. Aturan eksekusi dan kode (Bagian A, F, G, H).
5. Desain visual (`design.md`).
6. Preferensi implementasi (`architecture.md`, jika tidak menyangkut poin 1 sampai 3).

Jika konflik tetap tidak terselesaikan, agen MUST berhenti dan bertanya (lihat A5).
