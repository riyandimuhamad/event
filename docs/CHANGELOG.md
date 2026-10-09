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
