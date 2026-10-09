# Changelog — EventOps

Dokumentasi perubahan, penambahan dependensi, dan pencatatan keputusan per milestone sesuai aturan di `rules.md`.

## [0.1.0] - 2026-10-09

### Fondasi & Arsitektur (M0)
- Inisialisasi struktur monorepo (`packages/shared`, `packages/db`, `apps/web`).
- Konfigurasi Prisma ORM dengan PostgreSQL, model lengkap 36 entitas bisnis sesuai `schema.md`.
- Migrasi database awal: `20261009100737_init_schema`.
- Script seed pengembangan (`packages/db/src/seed.ts`):
  - 1 Organisasi: Nusantara Creative Event Organizer
  - 1 Event: Festival Musik Nusantara 2026
  - 6 Divisi: Acara, Logistik, Konsumsi, Sponsorship, Humas, Keuangan
  - 10 Akun pengujian RBAC (Owner, Event Manager, 3 Head Divisi, Committee, Volunteer, Talent Mgr, Sponsor Rep, Vendor Admin)
  - 20 Committee resmi & 150 Volunteer dengan kode `VOL-0001` s/d `VOL-0150`
  - 4 Vendor & 10 kru lapangan
  - 2 Talent (Kunto Aji, Nadin Amizah) & jadwal pertunjukan
  - 3 Sponsor (Telkomsel, BCA, Hydro Coco) beserta paket & deliverables
  - 6 Slot konsumsi untuk 2 hari pelaksanaan
  - 10 Requisition dengan berbagai status dan prioritas
- Enkripsi AES-256-GCM (`lib/security/crypto.ts`) untuk perlindungan data identitas dan kontak personal.
- Helper isolasi tenant `withOrgScope` di `@eventops/db` dan verifikasi event-organization di domain services.

### Event & Divisi (M1)
- Dashboard event overview dengan metrik agregasi: progres fase, kebutuhan terbuka, kehadiran relawan, persentase konsumsi, dan 10 riwayat audit log append-only terbaru.
- Manajemen 6 divisi dengan aturan Rule B2: divisi tidak dapat dihapus jika masih memiliki committee, volunteer, atau kebutuhan aktif.

### Committee & Volunteer (M2)
- Modul pendaftaran dan penugasan shift relawan.
- Fitur approval / reject relawan oleh Head Divisi atau Event Manager.
- Presensi check-in relawan dengan pencegahan check-in ganda di hari yang sama dan penolakan relawan yang berstatus `REJECTED`/`WITHDRAWN`.
- Perlindungan privasi kontak personal di tabel Committee sesuai matriks RBAC.

### Pre-event & Logistik (M3)
- Pelacakan stok fisik kaos (berdasarkan varian ukuran), ID card, dan perlengkapan.
- Perhitungan stok terdistribusi vs sisa stok secara real-time.

### Kebutuhan Antar-Divisi & Vendor (M4)
- State machine formal `RequisitionStateMachine` untuk transisi status:
  - `DRAFT` ➔ `SUBMITTED` ➔ `APPROVED` / `REJECTED` ➔ `IN_PROGRESS` ➔ `FULFILLED` ➔ `CLOSED`
  - Validasi penolakan (`REJECTED`) wajib menyertakan alasan minimal 10 karakter.
  - Pembatasan hak persetujuan hanya untuk Kepala Divisi tujuan.
  - Setiap transisi memicu pencatatan ke `requisition_events` dan `audit_logs`.
- Manajemen vendor, pemesanan logistik, dan absensi kru lapangan.

### Talent & Sponsor (M5)
- Manajemen talent, jadwal tampil panggung (rundown), dan riders teknis.
- Manajemen paket sponsor, pemantauan pembayaran, dan status pemenuhan deliverable.

### Operasional Hari H (M6)
- Distribusi konsumsi per slot waktu dengan validasi relawan harus sudah check-in hari ini.
- Pencegahan distribusi makanan ganda (`ALREADY_SERVED`) per slot per penerima.
- Stasiun presensi check-in via input kode QR.
- Dukungan antrean offline (`client_op_id` & `client_timestamp`) dengan endpoint sinkronisasi idempoten (`/api/v1/sync`).

### Post-event, Benefit & Audit (M7)
- Manajemen pencairan fee panitia/relawan dengan verifikasi file bukti transfer dan jejak audit.
- Restriksi pencairan fee hanya untuk Owner atau Event Manager.
- Pengelolaan nomor sertifikat unik dengan format `CERT/{EVENT}/{YEAR}/{NUM}` dan status cetak.
- Audit logger append-only (`AuditLogger`) dengan sanitasi otomatis data sensitif (phone, email, password, token).

### Pengujian & Kualitas Kode
- 24 unit & integration test melewati Vitest:
  - State machine transisi valid dan invalid.
  - Matriks hak akses RbacGuard dan tenant isolation.
  - Integrasi Requisition, Volunteer, Consumption, Benefit, dan Tenant Scope.
- Typecheck TypeScript strict tanpa error di seluruh workspace.
- Kompilasi production Next.js berhasil.

## [0.2.0] - 2026-10-09 - Audit UI/UX & Cross-Module Synchronization

### Audit & Benchmarking (Komparasi Industri: Cvent, Linear Ops, Rosterfy)
- **Eliminasi UI Bentrok & Collision**: Merombak seluruh kartu kebutuhan (*requisition cards*), tabel relawan, dan aksi pencairan benefit menjadi layout adaptif modular tanpa tabrakan tombol.
- **Sinkronisasi Reaktif Lintas-Modul**:
  - Check-in relawan pada stasiun presensi hari H kini secara instan mengaktifkan hak kelayakan jatah makan pada slot konsumsi tanpa reload halaman.
  - Distribusi makanan langsung menginkrementasi kuota slot konsumsi dan memperbarui kartu metrik secara reaktif.
  - Transisi status kebutuhan langsung memperbarui status badge dan linimasa audit secara optimistik.

### Redesain Command Center & Visual Polishing
- **Executive Command Center (Overview)**:
  - Phase Stepper 3 Tahap (Pre-Event ➔ Hari H ➔ Pasca-Event) dengan indikator aktif & persentase kesiapan operasional (*Readiness Dial*).
  - Quick Action Command Hub untuk navigasi instan antar-modul lapangan.
- **Requisition Management (Pengadaan)**:
  - KPI Stat Bar (Total Kebutuhan, Menunggu Approval, Sedang Dikerjakan, Terpenuhi/Ditutup).
  - Filter chips multi-kategori (Arah Pengajuan, Status workflow, Prioritas, Pencarian teks).
  - Drawer / Modal Linimasa Jejak Audit (*Audit History Timeline*) yang menampilkan seluruh aktor dan riwayat perubahan status.
- **Staff & Volunteer Operations**:
  - Filter presensi multi-kondisi (Semua, Sudah Check-in, Belum Check-in).
  - Modal **Official Volunteer Pass / Lanyard ID Card** dengan kode QR terintegrasi dan opsi cetak.
  - Layout kartu adaptif untuk perangkat mobile (<640px).
- **Post-Event & Finance Hub**:
  - Dialog verifikasi pencairan honorarium dengan unggah bukti transfer dan kanal perbankan.
  - Modal **Piagam Penghargaan / Digital Certificate of Appreciation** berstandar resmi dengan ornamen emas dan nomor registrasi kriptografis.
- **Executive Account Popover**:
  - Penggantian elemen `<select>` akun kasar dengan Role Switcher dropdown berdesain executive card lengkap dengan avatar, role badge, dan deskripsi peran.

## [0.3.0] - 2026-10-09 - Soft UI Dashboard React Layout & Maroon Luxury Palette Harmonization

### Soft UI Dashboard React Architecture
- **Struktur Tata Letak 4-Tier**: Mengadopsi arsitektur hierarki visual referensi Soft UI Dashboard React (`21st.dev/@creativetimofficial/templates/soft-ui-dashboard-react`):
  1. **Tier 1 (4 Mini Stat KPI Cards)**: Grid 4 kartu metrik (Fase Berjalan, Permintaan Logistik, Presensi Relawan, Distribusi Konsumsi) dengan indikator tren dan kotak ikon gradien rounded-square di sisi kanan.
  2. **Tier 2 (Featured Banner & Rocket Card)**: 
     - *Built by Developers Card* (7 kolom): Banner komando event dengan deskripsi orkestrasi 6 divisi, tanggal/venue badge, tautan pengadaan logistik, dan kartu ilustrasi target hadirin di sisi kanan.
     - *Work with the Rockets Card* (5 kolom): Kartu highlight gelap (Maroon Night) dengan indikator radial circular kesiapan Hari-H operasional, metrik presensi/konsumsi, dan inspeksi posko lapangan.
  3. **Tier 3 (Analytics & Charts)**:
     - *Active Users Card* (5 kolom): Kontainer gelap dengan SVG Bar Chart interaktif distribusi beban shift relawan (pagi-malam) + 4 mini metric badge di baris bawah.
     - *Sales Overview Card* (7 kolom): SVG Dual-Line & Area Chart kurva bezier halus dengan gradien Amber Glow & Wine Maroon untuk memantau arus permintaan vs realisasi logistik.
  4. **Tier 4 (Data Tables & Timelines)**:
     - *Projects Table* (8 kolom): Tabel status pemenuhan tugas per divisi lengkap dengan badge inisial divisi, koordinator/anggota tim, jumlah logistik, dan bar progres persentase Soft UI.
     - *Orders Overview Timeline* (4 kolom): Linimasa vertikal histori log audit append-only dengan node lingkaran berwarna dan timestamp WIB.

### Floating Inset Sidebar & Header
- **Floating Sidebar**: Menransformasi sidebar menjadi kartu mengambang (*floating inset card*) dengan radius `rounded-2xl`, border halus, 32x32px square icon box pada setiap menu navigasi, dan widget panduan operasional (SOP & Docs) di bagian bawah.
- **Floating Glass Header**: Mengambang di atas konten dengan breadcrumbs home, input pencarian berestetika Soft UI, pill status online, dan integrasi role switcher.

### Harmonisasi Palet Warna Landing Page (Maroon Luxury & Warm Linen)
- Mengadopsi warna brand landing page secara konsisten di seluruh dashboard:
  - Background kanvas: `#F7F4EE` (Warm Linen)
  - Dark Surface / Header: `#2A1411` (Maroon Night)
  - Brand Accent: `#7A2E33` (Royal Maroon) & `#FFC46B` (Warm Amber Glow)
  - Typography: Espresso ink `#1C1412` dan kontras linen `#EFE9DF`
- Harmonisasi seluruh sub-halaman dashboard (Divisi, Panitia, Relawan, Kebutuhan Antar-Divisi, Vendor, Talent, Pre-Event, Hari H, dan Pasca-Event).

