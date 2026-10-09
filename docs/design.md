# Design — EventOps

Dokumen ini mendefinisikan pengalaman pengguna, sistem visual, dan pola komponen. Baca bersama `prd.md` dan `architecture.md`.

---

## 1. Prinsip Desain

1. **Jelas dulu, indah kemudian.** Pengguna adalah panitia yang sibuk. Informasi status harus bisa dibaca dalam satu detik.
2. **Satu sumber kebenaran.** Angka yang sama tidak boleh tampil berbeda di dua tempat.
3. **Lapangan dulu.** Layar petugas H-day dirancang untuk ponsel, satu tangan, dengan tombol besar.
4. **Hak akses terlihat.** Jika pengguna tidak bisa melakukan sesuatu, tombolnya disembunyikan atau dinonaktifkan dengan alasan yang jelas, bukan hilang tanpa penjelasan.
5. **Status selalu eksplisit.** Setiap entitas punya badge status dengan warna dan teks, tidak hanya warna.

## 2. Sistem Visual

### 2.1 Warna

Palet dibuat netral dengan satu aksen. Tema terang sebagai default, gelap tersedia.

| Token | Terang | Gelap | Penggunaan |
|---|---|---|---|
| `--bg` | `#FAFAF9` | `#0F0F10` | Latar utama |
| `--surface` | `#FFFFFF` | `#18181B` | Kartu, panel |
| `--surface-muted` | `#F4F4F5` | `#27272A` | Header tabel, area sekunder |
| `--border` | `#E4E4E7` | `#3F3F46` | Garis pemisah |
| `--text` | `#18181B` | `#FAFAFA` | Teks utama |
| `--text-muted` | `#71717A` | `#A1A1AA` | Teks sekunder |
| `--accent` | `#4F46E5` | `#818CF8` | Tombol utama, fokus, tautan |
| `--success` | `#15803D` | `#4ADE80` | Selesai, disetujui, sudah dibayar |
| `--warning` | `#B45309` | `#FBBF24` | Menunggu, perlu perhatian |
| `--danger` | `#B91C1C` | `#F87171` | Ditolak, gagal, terlambat |
| `--info` | `#0369A1` | `#38BDF8` | Sedang diproses, informasi |

Kontras teks minimal WCAG AA (4.5:1 untuk teks normal).

### 2.2 Tipografi

- Font utama: Inter (fallback: system-ui, sans-serif).
- Angka dan kode (ID, ukuran kaos, jumlah): Inter dengan `font-variant-numeric: tabular-nums`.
- Skala: 12, 14, 16, 20, 24, 32 px. Body 14 px untuk tabel, 16 px untuk form dan mobile.
- Judul halaman: 24 px, semi-bold. Judul kartu: 16 px, semi-bold.

### 2.3 Spasi dan Radius

- Grid dasar 4 px. Spasi yang dipakai: 4, 8, 12, 16, 24, 32, 48.
- Radius: 6 px (input, tombol), 10 px (kartu), 14 px (modal).
- Bayangan dibatasi: hanya untuk modal dan dropdown.

### 2.4 Ikon

Lucide icons. Ukuran 16 px dalam teks, 20 px dalam tombol, 24 px untuk navigasi.

## 3. Komponen Status

Semua status memakai komponen `StatusBadge` dengan kombinasi warna, ikon, dan teks.

| Konteks | Status | Warna | Ikon |
|---|---|---|---|
| Kebutuhan | Draft | netral | pensil |
| Kebutuhan | Submitted | info | kirim |
| Kebutuhan | Approved | success | centang |
| Kebutuhan | Rejected | danger | silang |
| Kebutuhan | In Progress | info | jam |
| Kebutuhan | Fulfilled | success | kotak centang |
| Kebutuhan | Closed | netral | kunci |
| Relawan | Pending | warning | jam |
| Relawan | Approved | success | centang |
| Relawan | Checked-in | success | pin lokasi |
| Benefit | Belum Dibayar | warning | dompet |
| Benefit | Sudah Dibayar | success | dompet terisi |
| Sertifikat | Belum Dicetak | warning | dokumen |
| Sertifikat | Diterima | success | dokumen centang |

## 4. Tata Letak Aplikasi

### 4.1 Shell Desktop

```
┌────────────────────────────────────────────────────────────┐
│ [Logo] EO Name ▾        Cari...           [Notifikasi] [A] │
├──────────┬─────────────────────────────────────────────────┤
│ Sidebar  │ Breadcrumb: EO › Event › Halaman                │
│          │ Judul halaman                    [Aksi utama]   │
│ Overview │ ─────────────────────────────────────────────── │
│ Divisi   │                                                 │
│ Committee│        Konten halaman                           │
│ Relawan  │                                                 │
│ Kebutuhan│                                                 │
│ Vendor   │                                                 │
│ Talent   │                                                 │
│ Sponsor  │                                                 │
│ ──────── │                                                 │
│ Pre-event│                                                 │
│ Hari H   │                                                 │
│ Post     │                                                 │
└──────────┴─────────────────────────────────────────────────┘
```

- Sidebar lebar 240 px, bisa dilipat menjadi 64 px (ikon saja).
- Sidebar hanya menampilkan menu yang bisa diakses peran pengguna.
- Pemilihan event ada di header sebagai dropdown. Berpindah event tidak mengubah data di halaman lain.

### 4.2 Shell Mobile (Petugas dan Relawan)

- Bottom navigation dengan maksimal 4 item: Hari Ini, Jadwal, Tugas, Profil.
- Tombol aksi utama selebar layar, minimal tinggi 48 px.
- Halaman H-day dibuka otomatis jika petugas memiliki slot aktif.

### 4.3 Halaman Dashboard Event

Empat kartu ringkas di bagian atas:
1. Progres fase (Pre-event, Hari H, Post-event) dengan bar.
2. Kebutuhan terbuka (jumlah per status).
3. Kehadiran hari ini (checked-in / terjadwal).
4. Benefit (dibayar / total).

Di bawahnya: daftar 10 aktivitas terbaru dari audit log yang bisa dibaca peran tersebut.

## 5. Pola Halaman per Modul

### 5.1 Daftar (List)
- Tabel dengan kolom yang bisa diatur, sort, dan filter.
- Filter utama selalu terlihat (divisi, status). Filter lanjutan di panel samping.
- Pagination cursor dengan tombol "Muat lagi" atau navigasi halaman.
- Aksi massal (checkbox) untuk ubah status atau cetak label.
- Baris kosong menampilkan pesan dan tombol aksi, bukan tabel kosong.

### 5.2 Detail
- Header: nama entitas, badge status, aksi utama di kanan.
- Tab: Ringkasan, Riwayat, Lampiran, Komentar.
- Panel samping untuk metadata penting.

### 5.3 Form
- Satu kolom pada mobile, dua kolom pada desktop untuk form panjang.
- Label di atas input. Pesan error di bawah input dengan teks spesifik ("Deadline harus setelah hari ini").
- Tombol simpan di kanan bawah. Tombol batal di kiri.
- Simpan draft otomatis untuk form panjang (setiap 10 detik jika ada perubahan).

### 5.4 Kebutuhan Antar-Divisi (Requisition)

Kebutuhan adalah modul paling sering dipakai, jadi desainnya khusus:
- Halaman utama dibagi dua tab: **Masuk** (ditujukan ke divisi saya) dan **Keluar** (dibuat oleh divisi saya).
- Kartu kebutuhan menampilkan: judul, divisi asal, divisi tujuan, deadline, prioritas (warna dan teks: Rendah, Sedang, Tinggi, Mendesak), dan status.
- Timeline status di halaman detail menunjukkan siapa mengubah apa dan kapan.
- Tombol approve dan reject hanya tampil untuk Head divisi tujuan. Reject wajib mengisi alasan.
- Komentar memakai mention (`@nama`) yang mengirim notifikasi.

### 5.5 Distribusi Makan (Hari H)

- Layar fokus: pilih slot di bagian atas (Pagi, Siang, Malam, Minuman) dengan tombol besar.
- Di bawahnya: angka besar "Sudah terlayani X dari Y" dengan progress bar.
- Daftar penerima dengan tombol "Berikan" per orang (tap sekali). Pencarian nama atau kode relawan di bagian atas.
- Mode massal: pilih beberapa orang lalu "Berikan semua".
- Umpan balik instan: getar pendek dan warna hijau. Jika gagal, warna merah dengan alasan.
- Indikator offline selalu terlihat di pojok atas dengan jumlah antrean yang menunggu sinkronisasi.

### 5.6 Check-in (Hari H)

- Kamera untuk scan QR ID card, atau input kode manual.
- Hasil scan langsung menampilkan nama, divisi, dan foto (jika ada), dengan tombol konfirmasi.
- Peringatan jika sudah check-in sebelumnya, dengan waktu check-in pertama.

### 5.7 Benefit (Post-event)
- Tabel dengan kolom: nama, divisi, nominal fee, status fee, status sertifikat.
- Aksi massal: tandai sertifikat dicetak untuk beberapa orang sekaligus.
- Unggah bukti transfer: drag and drop, pratinjau sebelum simpan.

## 6. Interaksi dan Feedback

- Setiap aksi yang mengubah data menampilkan toast konfirmasi dengan opsi "Batalkan" selama 5 detik jika memungkinkan.
- Aksi yang tidak bisa dibatalkan (misal pencairan fee) memakai dialog konfirmasi yang menyebutkan dampaknya dengan jelas.
- Loading: skeleton untuk daftar, spinner kecil untuk tombol. Tidak ada layar kosong saat memuat.
- Error jaringan pada H-day: pesan "Tersimpan di perangkat, akan dikirim saat online" alih-alih pesan gagal.

## 7. Aksesibilitas

- Semua elemen interaktif bisa diakses dengan keyboard. Urutan fokus logis.
- Fokus terlihat (ring 2 px `--accent`).
- Target sentuh minimal 44 x 44 px pada mobile.
- Form memakai `label` yang terhubung, bukan placeholder sebagai label.
- Status tidak hanya warna (lihat Bagian 3).
- Mendukung `prefers-reduced-motion`: animasi dimatikan.
- Teks bisa diperbesar sampai 200% tanpa kehilangan fungsi.

## 8. Responsivitas

| Breakpoint | Lebar | Perilaku |
|---|---|---|
| Mobile | < 640 px | Satu kolom, bottom nav, tabel menjadi daftar kartu |
| Tablet | 640 - 1024 px | Sidebar dilipat, tabel dengan scroll horizontal |
| Desktop | > 1024 px | Sidebar penuh, tabel penuh |

Tabel di mobile berubah menjadi kartu dengan 3 field utama dan tombol "Detail".

## 9. Bahasa dan Penulisan

- Bahasa Indonesia baku tetapi tidak kaku. Gunakan kata yang dipakai panitia sehari-hari: "Relawan", "Panitia", "Kebutuhan", "Benefit".
- Istilah teknis dalam bahasa Inggris dipakai jika sudah umum: "Check-in", "Dashboard", "Draft".
- Tombol memakai kata kerja: "Simpan", "Ajukan", "Setujui", "Tolak", "Tandai sudah diambil".
- Pesan kosong menjelaskan langkah berikutnya: "Belum ada relawan. Tambahkan relawan pertama atau impor dari spreadsheet."
- Format tanggal: "Sabtu, 17 Agustus 2026, 08.00 WIB". Format angka: 1.250.000 (titik sebagai pemisah ribuan).

## 10. Halaman Kosong dan Onboarding

- Saat EO baru dibuat, dashboard menampilkan checklist: buat event, undang Head divisi, buat divisi, impor relawan.
- Setiap checklist item mengarah langsung ke halaman terkait.
- Checklist hilang setelah semua item selesai, atau bisa disembunyikan.

## 11. Komponen Inti yang Harus Dibuat

Daftar komponen reusable (folder `components/ui` dan `components/features`):

- `AppShell`, `Sidebar`, `Header`, `EventSwitcher`, `MobileNav`
- `DataTable` (sort, filter, kolom, aksi massal, pagination cursor)
- `StatusBadge`, `PriorityBadge`
- `EntityHeader` (judul, status, aksi)
- `TimelineStatus` (riwayat perubahan)
- `FormField`, `DateTimeZoneInput` (input tanggal dengan zona WIB)
- `EmptyState`, `Skeleton`, `ErrorState`
- `ConfirmDialog`, `Toast`
- `QuantityStepper` (jumlah kaos, makan)
- `ProgressSummary` (angka "X dari Y")
- `QrScanner`
- `OfflineIndicator`, `SyncQueueStatus`
- `FileUploader` (drag and drop, pratinjau)
- `MentionInput` (komentar dengan @mention)

## 12. Mode Gelap dan Cetak

- Mode gelap mengikuti preferensi sistem, bisa diubah manual di profil.
- Halaman cetak untuk label, ID card, dan sertifikat memakai CSS `@media print` terpisah dengan ukuran kertas yang tepat (A4, label 10x5 cm, ID card 8,6 x 5,4 cm).

## 13. Checklist Desain Sebelum Rilis

- [ ] Setiap halaman sudah diuji di lebar 375 px, 768 px, dan 1280 px.
- [ ] Kontras warna lolos WCAG AA di kedua tema.
- [ ] Semua status memiliki teks, bukan hanya warna.
- [ ] Tombol berbahaya memiliki konfirmasi.
- [ ] Alur H-day bisa diselesaikan dengan satu tangan di ponsel.
- [ ] Pesan error dan kosong sudah ditulis dalam Bahasa Indonesia yang jelas.
- [ ] Navigasi keyboard berfungsi di semua form dan tabel.
