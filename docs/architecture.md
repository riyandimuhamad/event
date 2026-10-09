# Architecture — EventOps

Dokumen ini menjelaskan arsitektur teknis. Baca bersama `prd.md` (apa yang dibangun), `schema.md` (struktur data), `design.md` (tampilan), dan `rules.md` (aturan eksekusi).

---

## 1. Gambaran Umum

EventOps adalah aplikasi web monolitik modular dengan pola multi-tenant berbasis `organization_id`. Pendekatan monolit dipilih karena tim kecil, kebutuhan transaksi kuat (distribusi, check-in, benefit), dan kemudahan deployment.

```
┌──────────────────────────────────────────────────────────┐
│                       Browser / PWA                      │
│  Next.js (App Router) + React + Tailwind + TanStack Query│
│  IndexedDB (cache offline untuk H-day)                   │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS (REST + Server Actions)
┌───────────────────────────▼──────────────────────────────┐
│                  Application Server (Next.js)            │
│  ┌────────────┐ ┌────────────┐ ┌────────────────────┐    │
│  │ Auth/RBAC  │ │ Domain     │ │ Notifikasi &       │    │
│  │ Middleware │ │ Services   │ │ Job Queue (BullMQ) │    │
│  └────────────┘ └────────────┘ └────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Audit Logger (append-only)                         │  │
│  └────────────────────────────────────────────────────┘  │
└───────┬───────────────────────────┬──────────────────────┘
        │                           │
┌───────▼────────┐        ┌─────────▼─────────┐   ┌───────────────┐
│ PostgreSQL 16  │        │ Redis (queue,     │   │ Object Storage│
│ (data utama)   │        │ rate limit, cache)│   │ (S3 compatible│
└────────────────┘        └───────────────────┘   │ untuk bukti,  │
                                                  │ lampiran)     │
                                                  └───────────────┘
```

## 2. Stack Teknologi

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend dan server | Next.js 14+ (App Router), TypeScript | Satu codebase, server components, server actions |
| UI | Tailwind CSS, shadcn/ui | Cepat dibangun, konsisten, mudah dikustomisasi |
| State data | TanStack Query | Cache, retry, optimistic update |
| Form | React Hook Form + Zod | Validasi dipakai sama di client dan server |
| ORM | Prisma | Migrasi, type safety, dokumentasi bagus |
| Database | PostgreSQL 16 | Transaksi kuat, JSONB untuk field fleksibel, constraint kaya |
| Cache dan queue | Redis + BullMQ | Job notifikasi, pengingat terjadwal, rate limit |
| Auth | Auth.js (NextAuth) dengan email magic link atau Google | Mengurangi risiko keamanan dari implementasi sendiri |
| File | S3 compatible (MinIO untuk lokal) | Bukti transfer, lampiran kebutuhan, template sertifikat |
| Testing | Vitest (unit), Playwright (E2E), Supertest untuk API | Standar industri |
| Lint dan format | ESLint, Prettier, TypeScript strict | Konsistensi kode |
| Deployment | Docker Compose untuk dev dan staging, VPS atau Vercel + managed Postgres untuk produksi | Fleksibel |
| Observabilitas | Pino (log), Sentry (error), health endpoint | Mudah didiagnosis |

## 3. Struktur Proyek

```
eventops/
├── apps/
│   └── web/                     # Next.js application
│       ├── app/
│       │   ├── (auth)/          # login, verifikasi
│       │   ├── (dashboard)/
│       │   │   └── [orgSlug]/
│       │   │       └── events/
│       │   │           └── [eventId]/
│       │   │               ├── overview/
│       │   │               ├── divisions/
│       │   │               ├── committee/
│       │   │               ├── volunteers/
│       │   │               ├── requisitions/
│       │   │               ├── vendors/
│       │   │               ├── talents/
│       │   │               ├── sponsors/
│       │   │               ├── pre-event/
│       │   │               ├── day-of/
│       │   │               └── post-event/
│       │   └── api/
│       ├── components/
│       │   ├── ui/              # shadcn primitives
│       │   └── features/        # komponen per modul
│       ├── lib/
│       │   ├── auth/            # session, guard
│       │   ├── rbac/            # matriks permission
│       │   ├── db/              # prisma client
│       │   ├── audit/
│       │   └── validators/      # zod schema bersama
│       └── server/
│           ├── services/        # logika domain
│           ├── actions/         # server actions
│           └── jobs/            # worker BullMQ
├── packages/
│   ├── db/                      # prisma schema, migrasi, seed
│   └── shared/                  # tipe, konstanta, enum status
├── docs/                        # prd, architecture, design, schema, rules
├── docker-compose.yml
└── .env.example
```

Prinsip: logika bisnis ada di `server/services`. Komponen UI tidak boleh memanggil Prisma langsung.

## 4. Lapisan Arsitektur

### 4.1 Presentation
- Halaman menggunakan React Server Components untuk data awal.
- Interaksi (form, tombol status) memakai Server Actions atau route handler `api/`.
- Komponen tidak mengetahui aturan bisnis. Ia hanya memanggil service dan menampilkan hasil.

### 4.2 Application (Services)
Setiap modul memiliki service sendiri:
- `OrganizationService`, `EventService`, `DivisionService`
- `CommitteeService`, `VolunteerService`
- `RequisitionService` (berisi state machine kebutuhan)
- `VendorService`, `CrewService`
- `TalentService`, `SponsorService`
- `LogisticsService` (kaos, ID card, perlengkapan)
- `ConsumptionService` (distribusi makan dan minum)
- `BenefitService` (fee, sertifikat)
- `AuditService`, `NotificationService`

Setiap method service menerima `actor` (user yang melakukan aksi, termasuk peran dan divisinya) dan `organizationId`. Service memeriksa izin dengan `rbac.can(actor, action, resource)` sebelum mengubah data.

### 4.3 Domain
- Status diatur oleh state machine yang eksplisit, bukan if-else tersebar.
- Contoh: `RequisitionStateMachine` menolak transisi `Draft → Fulfilled` langsung.

### 4.4 Persistence
- Prisma sebagai satu-satunya akses database.
- Setiap tabel data bisnis memiliki `organization_id`. Query selalu difilter dengan `organization_id` dari session, tidak dari input user.
- Soft delete dengan `deleted_at` untuk data relawan dan transaksi. Hard delete hanya untuk data sementara.

## 5. Multi-tenancy dan Isolasi Data

- Satu database, satu skema. Isolasi dengan `organization_id` di setiap tabel.
- Middleware membaca `orgSlug` dari URL dan memverifikasi bahwa user adalah anggota EO tersebut. Jika tidak, respons 404 (bukan 403) agar keberadaan EO tidak bocor.
- Helper `withOrgScope(orgId)` dipakai di semua query. Dilarang menulis query tanpa filter tenant (ditegakkan lewat lint rule atau code review).
- Uji wajib: satu test per endpoint yang memastikan user dari EO A tidak bisa membaca atau mengubah data EO B.

## 6. Autentikasi dan Otorisasi (RBAC)

### 6.1 Autentikasi
- Login dengan magic link (email) atau Google OAuth.
- Session disimpan di cookie httpOnly, secure, sameSite=lax.
- Session expiry 30 hari dengan rotasi token.

### 6.2 Otorisasi
Model RBAC dengan tiga lapis:
1. **Peran tingkat organisasi**: Owner, Admin, Member.
2. **Peran tingkat event**: Event Manager, Division Head, Committee, Volunteer, Talent Manager, Sponsor Rep, Vendor Admin, Vendor Crew.
3. **Cakupan divisi**: anggota divisi A tidak otomatis punya akses ke divisi B, kecuali lewat permission khusus (misalnya membaca kebutuhan yang ditujukan ke divisinya).

Permission dinyatakan dalam bentuk `resource:action:scope`, contoh:
- `volunteer:read:own`
- `volunteer:read:division`
- `volunteer:write:division`
- `requisition:create:any`
- `requisition:approve:target_division`
- `benefit:disburse:event`

Matriks lengkap ada di `rules.md`.

## 7. Alur Data Penting

### 7.1 Alur Kebutuhan Antar-Divisi
```
Client ──► RequisitionAction.submit(id)
             │
             ├─► rbac.can(actor, 'requisition:submit', req)
             ├─► RequisitionStateMachine.transition(req, 'SUBMITTED')
             ├─► tx: update requisition + insert requisition_event + insert audit_log
             ├─► enqueue notification (Head divisi tujuan)
             └─► return updated requisition
```

### 7.2 Alur Distribusi Makan
```
Petugas (mobile) ──► ConsumptionAction.distribute(slotId, recipientIds, qty)
                       │
                       ├─► validasi: slot aktif, recipient sudah check-in
                       ├─► tx dengan row lock pada consumption_slot_recipient
                       │     (mencegah ganda pemberian)
                       ├─► insert consumption_distribution
                       └─► update ringkasan slot (counter)
```

### 7.3 Alur Benefit
Fee dan sertifikat dicatat sebagai baris terpisah dengan status. Perubahan status hanya lewat `BenefitService`, dan setiap perubahan menghasilkan audit log.

## 8. Mode Offline untuk Hari H

Lokasi event sering memiliki sinyal lemah. Strategi:

1. Saat event dibuka, aplikasi mengunduh daftar relawan dan slot aktif ke IndexedDB (hanya data yang dibutuhkan petugas itu).
2. Aksi check-in dan distribusi makan disimpan dalam antrean lokal dengan `client_op_id` (UUID) dan timestamp.
3. Saat online, antrean dikirim ke endpoint `sync`. Server memproses idempoten berdasarkan `client_op_id`, sehingga pengiriman ulang tidak menggandakan data.
4. Konflik: jika slot sudah habis di server, operasi lokal ditandai `REJECTED` dengan alasan, dan petugas diberi tahu.
5. Scope offline dibatasi: hanya check-in, distribusi, dan lihat jadwal. Edit data lain tetap butuh koneksi.

## 9. API

Gaya REST dengan prefix `/api/v1`. Setiap respons memakai format:

```json
{
  "data": {},
  "error": null,
  "meta": { "requestId": "..." }
}
```

Error memakai format:

```json
{
  "data": null,
  "error": { "code": "REQUISITION_INVALID_TRANSITION", "message": "...", "details": {} },
  "meta": { "requestId": "..." }
}
```

Contoh endpoint utama:

| Method | Path | Fungsi |
|---|---|---|
| GET | `/orgs/:orgSlug/events` | Daftar event |
| POST | `/orgs/:orgSlug/events/:eventId/divisions` | Buat divisi |
| GET | `/events/:eventId/volunteers?divisionId=&status=` | Daftar relawan (paginated) |
| POST | `/events/:eventId/requisitions` | Buat kebutuhan |
| POST | `/requisitions/:id/transitions` | Ubah status kebutuhan (body: `to`, `reason`) |
| POST | `/events/:eventId/consumption/distributions` | Catat distribusi makan |
| POST | `/events/:eventId/sync` | Kirim antrean offline |
| POST | `/events/:eventId/benefits/:id/disburse` | Tandai fee dibayar |

Pagination dengan cursor (`?cursor=&limit=`), bukan offset, untuk daftar besar.

## 10. Notifikasi dan Job

- Kejadian domain (misal `RequisitionSubmitted`) memasukkan job ke BullMQ.
- Worker mengirim notifikasi dalam aplikasi, dan email untuk kejadian penting.
- Pengingat jadwal dijadwalkan H-1 dan H-0 pagi, dihitung dari zona waktu event.
- Job wajib idempoten dan memiliki retry dengan exponential backoff.

## 11. Keamanan

- Validasi input dengan Zod di setiap server action dan endpoint.
- Rate limit untuk login dan endpoint sync (Redis).
- Upload file: batasi tipe (PDF, JPG, PNG), ukuran maksimal 5 MB, dan simpan dengan nama acak. Tidak ada eksekusi file yang diunggah.
- Header keamanan: CSP, HSTS, X-Frame-Options, Referrer-Policy.
- Enkripsi data sensitif at rest untuk nomor identitas (AES-256-GCM, kunci dari environment).
- Log tidak boleh mencatat data personal (email, nomor HP, nomor identitas). Gunakan masking.
- Dependensi dicek dengan `npm audit` di CI.

## 12. Audit Log

Tabel `audit_logs` bersifat append-only. Setiap entri berisi:
- `actor_id`, `organization_id`, `event_id`
- `action` (misal `benefit.disbursed`)
- `entity_type`, `entity_id`
- `before` dan `after` (JSONB, hanya field yang berubah)
- `ip`, `user_agent`, `created_at`

Tidak ada endpoint untuk mengubah atau menghapus audit log.

## 13. Pengujian

| Jenis | Cakupan | Alat |
|---|---|---|
| Unit | State machine, RBAC, validator, kalkulasi konsumsi | Vitest |
| Integrasi | Service dengan database test (Docker) | Vitest + Testcontainers |
| Isolasi tenant | Setiap endpoint, cross-org access ditolak | Vitest |
| E2E | Alur A sampai D di `prd.md` | Playwright |
| Konkurensi | Dua petugas mendistribusikan slot yang sama | Script k6 atau Vitest paralel |
| Offline | Antrean dan sinkronisasi ulang | Playwright dengan network throttle |

Target coverage: 80% untuk `services/` dan `rbac/`.

## 14. Deployment dan Lingkungan

- Tiga lingkungan: `local` (Docker Compose), `staging`, `production`.
- CI: lint, typecheck, test, build pada setiap PR. Deploy staging otomatis dari branch `main`.
- Migrasi Prisma dijalankan sebagai langkah terpisah sebelum deploy, dan selalu memiliki rencana rollback.
- Backup database harian dengan retensi 14 hari, dan uji restore bulanan.
- Variabel lingkungan wajib didokumentasikan di `.env.example`. Secret tidak pernah di-commit.

## 15. Keputusan Arsitektur (ADR ringkas)

| ID | Keputusan | Alasan | Konsekuensi |
|---|---|---|---|
| ADR-01 | Monolit modular | Tim kecil, transaksi kuat | Perlu disiplin batas modul |
| ADR-02 | Satu database dengan `organization_id` | Sederhana untuk skala MVP | Perlu pengujian isolasi ketat |
| ADR-03 | Prisma | Type safety dan migrasi | Query kompleks perlu `$queryRaw` |
| ADR-04 | Offline-first hanya untuk H-day | Kebutuhan lapangan nyata, cakupan terbatas | Perlu logika sinkronisasi |
| ADR-05 | State machine eksplisit | Status kebutuhan dan benefit harus bisa diaudit | Lebih banyak kode awal |
| ADR-06 | Audit log append-only | Akuntabilitas keuangan dan distribusi | Tabel tumbuh cepat, perlu partisi di masa depan |
