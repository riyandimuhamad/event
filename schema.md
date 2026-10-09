# Schema — EventOps

Dokumen ini mendefinisikan struktur database PostgreSQL. Implementasi utamanya ada di `packages/db/prisma/schema.prisma`. Lihat `architecture.md` untuk konteks dan `rules.md` untuk aturan integritas data.

Konvensi umum:
- Semua primary key: `id` bertipe UUID (v7 untuk urutan waktu).
- Semua tabel bisnis: `organization_id` (FK), `created_at`, `updated_at`, `created_by`, `updated_by`.
- Soft delete dengan `deleted_at` pada tabel data manusia dan transaksi.
- Nama tabel jamak, snake_case. Nama kolom snake_case.
- Waktu disimpan dalam `timestamptz` (UTC).
- Uang disimpan dalam `bigint` dengan satuan Rupiah (tanpa desimal).
- Status memakai `enum` PostgreSQL atau kolom `text` dengan check constraint.

---

## 1. Diagram Relasi (Ringkas)

```
organizations ─┬─< organization_members >─ users
               │
               └─< events ─┬─< divisions ─┬─< division_members
                           │              ├─< tasks
                           │              └─< requisitions (from / to)
                           │
                           ├─< event_phases
                           ├─< volunteers ─┬─< volunteer_shifts >─ shifts
                           │               ├─< volunteer_logistics
                           │               └─< benefits
                           ├─< committee_members ─< benefits
                           ├─< vendors ─┬─< vendor_orders
                           │            └─< vendor_crew ─< crew_attendance
                           ├─< talents ─┬─< talent_shows
                           │            └─< talent_contacts
                           ├─< sponsors ─< sponsor_deliverables
                           ├─< inventory_items ─< distributions
                           ├─< consumption_slots ─< consumption_distributions
                           └─< audit_logs
```

---

## 2. Tabel Identitas dan Tenant

### 2.1 `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| email | citext UNIQUE NOT NULL | Login utama |
| full_name | text NOT NULL | |
| phone | text NULL | Tersamarkan di log |
| avatar_url | text NULL | |
| locale | text DEFAULT 'id-ID' | |
| timezone | text DEFAULT 'Asia/Jakarta' | |
| last_login_at | timestamptz NULL | |
| created_at, updated_at | timestamptz | |

### 2.2 `organizations`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| slug | text UNIQUE NOT NULL | Dipakai di URL |
| name | text NOT NULL | Nama EO |
| description | text NULL | |
| logo_url | text NULL | |
| created_at, updated_at | timestamptz | |

### 2.3 `organization_members`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| user_id | uuid FK | |
| role | text | `OWNER`, `ADMIN`, `MEMBER` |
| joined_at | timestamptz | |
| UNIQUE | (organization_id, user_id) | |

---

## 3. Event dan Divisi

### 3.1 `events`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK NOT NULL | |
| name | text NOT NULL | |
| slug | text NOT NULL | UNIQUE per organization |
| description | text NULL | |
| venue_name | text NULL | |
| venue_address | text NULL | |
| venue_lat, venue_lng | numeric(9,6) NULL | |
| starts_at | timestamptz NOT NULL | |
| ends_at | timestamptz NOT NULL | CHECK ends_at > starts_at |
| timezone | text DEFAULT 'Asia/Jakarta' | |
| status | text | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| current_phase | text | `PRE_EVENT`, `DAY_OF`, `POST_EVENT`, `CLOSED` |
| expected_attendees | int NULL | |
| deleted_at | timestamptz NULL | |

### 3.2 `event_phases`
Menyimpan jadwal milestone per fase (misal "Pengambilan kaos dibuka", "Gladi bersih").

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| phase | text | `PRE_EVENT`, `DAY_OF`, `POST_EVENT` |
| title | text | |
| starts_at, ends_at | timestamptz | |
| status | text | `PLANNED`, `ACTIVE`, `DONE` |

### 3.3 `divisions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | Denormalisasi untuk filter tenant |
| event_id | uuid FK | |
| name | text NOT NULL | Acara, Logistik, Konsumsi, dst. |
| code | text NOT NULL | Kode pendek, misal `ACR`, `LOG`, `KSM` |
| description | text NULL | |
| head_user_id | uuid FK NULL | |
| sort_order | int DEFAULT 0 | |
| deleted_at | timestamptz NULL | |
| UNIQUE | (event_id, code) | |

### 3.4 `division_members`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| division_id | uuid FK | |
| user_id | uuid FK | |
| role | text | `HEAD`, `MEMBER` |
| UNIQUE | (division_id, user_id) | |

---

## 4. Committee dan Volunteer

### 4.1 `committee_members`
Panitia resmi. Satu baris per orang per event.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| event_id | uuid FK | |
| user_id | uuid FK NULL | Null jika belum punya akun |
| division_id | uuid FK | |
| full_name | text NOT NULL | |
| email | citext NULL | |
| phone | text NULL | Terenkripsi |
| national_id_encrypted | bytea NULL | Terenkripsi AES-256-GCM |
| position | text | Jabatan di divisi |
| employment_type | text | `VOLUNTEER_COMMITTEE`, `PAID`, `CONTRACT` |
| agreement_status | text | `DRAFT`, `SIGNED`, `TERMINATED` |
| joined_at | date NULL | |
| confirmed | boolean DEFAULT false | |
| deleted_at | timestamptz NULL | |
| UNIQUE | (event_id, user_id) WHERE user_id IS NOT NULL | |

### 4.2 `volunteers`
Official Volunteer. Relawan bisa mendaftar sendiri atau diundang EO.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| event_id | uuid FK | |
| user_id | uuid FK NULL | |
| code | text NOT NULL | Kode relawan, misal `VOL-0042`, untuk QR |
| full_name | text NOT NULL | |
| email | citext NULL | |
| phone | text NULL | Terenkripsi |
| national_id_encrypted | bytea NULL | Terenkripsi |
| shirt_size | text NULL | `XS`, `S`, `M`, `L`, `XL`, `XXL`, `XXXL` |
| division_id | uuid FK NULL | Divisi penempatan |
| registration_status | text | `PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN` |
| reviewed_by | uuid FK NULL | |
| reviewed_at | timestamptz NULL | |
| notes | text NULL | Catatan internal EO |
| deleted_at | timestamptz NULL | |
| UNIQUE | (event_id, code) | |

### 4.3 `shifts`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| division_id | uuid FK | |
| name | text | misal "Shift Pagi" |
| starts_at, ends_at | timestamptz | CHECK ends_at > starts_at |
| capacity | int NULL | |

### 4.4 `volunteer_shifts`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| volunteer_id | uuid FK | |
| shift_id | uuid FK | |
| status | text | `ASSIGNED`, `CONFIRMED`, `CANCELLED`, `NO_SHOW`, `COMPLETED` |
| checked_in_at | timestamptz NULL | |
| checked_out_at | timestamptz NULL | |
| checked_in_by | uuid FK NULL | Petugas |
| UNIQUE | (volunteer_id, shift_id) | |

---

## 5. Logistik Pra-event dan Perlengkapan

### 5.1 `inventory_items`
Barang yang didistribusikan atau dicetak: kaos, ID card, lanyard, wristband, sertifikat cetak.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| category | text | `SHIRT`, `ID_CARD`, `LANYARD`, `WRISTBAND`, `CERTIFICATE`, `OTHER` |
| variant | text NULL | misal ukuran atau warna |
| name | text | |
| total_stock | int | Stok fisik yang disiapkan |
| reserved | int DEFAULT 0 | |
| distributed | int DEFAULT 0 | Dihitung dari distributions |

Catatan: `distributed` tidak boleh diubah langsung. Hanya dihitung ulang dari `inventory_distributions` (lihat aturan di `rules.md`).

### 5.2 `inventory_distributions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| inventory_item_id | uuid FK | |
| recipient_type | text | `VOLUNTEER`, `COMMITTEE`, `VENDOR_CREW`, `TALENT`, `SPONSOR` |
| recipient_id | uuid NOT NULL | Polimorfik, divalidasi di service |
| quantity | int CHECK > 0 | |
| status | text | `PENDING`, `TAKEN`, `CANCELLED` |
| taken_at | timestamptz NULL | |
| handed_by | uuid FK NULL | Petugas |
| client_op_id | uuid UNIQUE NULL | Idempotensi untuk sync offline |

### 5.3 `print_jobs`
Untuk ID card dan sertifikat.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| type | text | `ID_CARD`, `CERTIFICATE`, `LABEL` |
| status | text | `QUEUED`, `PRINTED`, `FAILED` |
| target_ids | uuid[] | Daftar penerima |
| printed_at | timestamptz NULL | |

---

## 6. Kebutuhan Antar-Divisi (Requisition)

### 6.1 `requisitions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| event_id | uuid FK | |
| code | text | misal `REQ-0007`, UNIQUE per event |
| title | text NOT NULL | |
| description | text NULL | |
| from_division_id | uuid FK | Divisi pembuat |
| to_division_id | uuid FK | Divisi yang diminta |
| priority | text | `LOW`, `MEDIUM`, `HIGH`, `URGENT` |
| needed_by | timestamptz NULL | |
| status | text | `DRAFT`, `SUBMITTED`, `APPROVED`, `REJECTED`, `IN_PROGRESS`, `FULFILLED`, `CLOSED` |
| requested_by | uuid FK | |
| approved_by | uuid FK NULL | |
| version | int DEFAULT 1 | Optimistic locking |
| CHECK | from_division_id <> to_division_id | |

### 6.2 `requisition_items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| requisition_id | uuid FK | |
| name | text | |
| quantity | numeric(12,2) | |
| unit | text | misal `pcs`, `porsi`, `unit`, `jam` |
| notes | text NULL | |

### 6.3 `requisition_events`
Riwayat transisi status. Append-only.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| requisition_id | uuid FK | |
| from_status | text NULL | |
| to_status | text | |
| actor_id | uuid FK | |
| reason | text NULL | Wajib untuk REJECTED |
| created_at | timestamptz | |

### 6.4 `comments`
Komentar polimorfik untuk requisition, vendor order, dan entitas lain.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| entity_type | text | |
| entity_id | uuid | |
| author_id | uuid FK | |
| body | text | |
| mentions | uuid[] | |
| deleted_at | timestamptz NULL | |

### 6.5 `tasks`
Tugas internal divisi.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| division_id | uuid FK | |
| title | text | |
| assignee_id | uuid FK NULL | |
| due_at | timestamptz NULL | |
| status | text | `TODO`, `IN_PROGRESS`, `DONE` |
| requisition_id | uuid FK NULL | Jika tugas berasal dari kebutuhan |

---

## 7. Vendor dan Crew

### 7.1 `vendors`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | Vendor bisa dipakai banyak event, tapi di level EO |
| name | text | |
| category | text | `CATERING`, `SOUND`, `DECORATION`, `EQUIPMENT`, `SECURITY`, `OTHER` |
| contact_name | text | |
| contact_phone | text NULL | |
| contact_email | citext NULL | |
| deleted_at | timestamptz NULL | |

### 7.2 `vendor_orders`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| vendor_id | uuid FK | |
| requisition_id | uuid FK NULL | Kebutuhan pemicu |
| division_id | uuid FK | Divisi penanggung jawab |
| description | text | |
| amount | bigint | Rupiah |
| status | text | `DRAFT`, `CONFIRMED`, `DELIVERED`, `PAID`, `CANCELLED` |
| due_at | timestamptz NULL | |

### 7.3 `vendor_crew`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| vendor_id | uuid FK | |
| full_name | text | |
| role | text | misal "Juru masak", "Operator sound" |
| phone | text NULL | Terenkripsi |
| national_id_encrypted | bytea NULL | |
| shirt_size | text NULL | |
| status | text | `ACTIVE`, `REMOVED` |

### 7.4 `crew_attendance`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| vendor_crew_id | uuid FK | |
| shift_id | uuid FK NULL | |
| checked_in_at | timestamptz NULL | |
| checked_out_at | timestamptz NULL | |

---

## 8. Talent

### 8.1 `talents`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| name | text | Nama panggung |
| category | text | misal "Musik", "Komedi", "Pembicara" |
| management_name | text NULL | Nama agency atau manajer |
| management_contact | text NULL | |
| management_email | citext NULL | |
| rider_notes | text NULL | Kebutuhan teknis dan akomodasi |
| fee | bigint NULL | |
| contract_status | text | `DRAFT`, `SIGNED`, `CANCELLED` |

### 8.2 `talent_shows`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| talent_id | uuid FK | |
| stage_name | text | Nama panggung di venue (bukan nama talent) |
| starts_at, ends_at | timestamptz | CHECK ends_at > starts_at |
| status | text | `SCHEDULED`, `SOUNDCHECK`, `PERFORMED`, `CANCELLED` |

### 8.3 `talent_communications`
Riwayat komunikasi dengan pihak manajemen talent.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| talent_id | uuid FK | |
| channel | text | `EMAIL`, `PHONE`, `WHATSAPP`, `IN_PERSON` |
| summary | text | |
| occurred_at | timestamptz | |
| logged_by | uuid FK | |

---

## 9. Sponsor

### 9.1 `sponsors`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| company_name | text | |
| package_name | text | |
| package_value | bigint | Rupiah |
| payment_status | text | `UNPAID`, `PARTIAL`, `PAID` |
| amount_paid | bigint DEFAULT 0 | |
| rep_name | text NULL | |
| rep_email | citext NULL | |
| rep_user_id | uuid FK NULL | Jika perwakilan punya akun |

### 9.2 `sponsor_deliverables`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| sponsor_id | uuid FK | |
| title | text | misal "Logo di banner utama" |
| status | text | `PENDING`, `IN_PROGRESS`, `DELIVERED` |
| delivered_at | timestamptz NULL | |
| asset_file_id | uuid FK NULL | |

---

## 10. Konsumsi (Hari H)

### 10.1 `consumption_slots`
Slot distribusi per event. Bisa dibuat per hari.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| kind | text | `BREAKFAST`, `LUNCH`, `DINNER`, `DRINK`, `SNACK` |
| label | text | misal "Makan Siang Hari 1" |
| starts_at, ends_at | timestamptz | |
| target_recipients | int | Jumlah seharusnya menerima |
| served_count | int DEFAULT 0 | Counter, diperbarui oleh service |
| status | text | `OPEN`, `CLOSED` |
| CHECK | ends_at > starts_at | |

### 10.2 `consumption_distributions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| slot_id | uuid FK | |
| recipient_type | text | `VOLUNTEER`, `COMMITTEE`, `VENDOR_CREW`, `TALENT`, `SPONSOR` |
| recipient_id | uuid | |
| quantity | int DEFAULT 1 CHECK > 0 | |
| distributed_at | timestamptz | |
| distributed_by | uuid FK | |
| client_op_id | uuid UNIQUE NULL | Idempotensi offline |
| UNIQUE | (slot_id, recipient_type, recipient_id) | Satu penerima satu kali per slot, kecuali kebijakan berbeda |

### 10.3 Catatan Konsumsi
Konsumsi untuk vendor crew dan talent dicatat di tabel yang sama. Makan dan minum dibedakan lewat `kind` pada slot, bukan pada distribusi.

---

## 11. Benefit (Fee dan Sertifikat)

### 11.1 `benefits`
Satu baris per penerima per jenis benefit.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| event_id | uuid FK | |
| recipient_type | text | `VOLUNTEER`, `COMMITTEE`, `TALENT`, `VENDOR_CREW` |
| recipient_id | uuid NOT NULL | |
| kind | text | `FEE`, `CERTIFICATE` |
| amount | bigint NULL | Untuk FEE |
| status | text | FEE: `UNPAID`, `PROCESSING`, `PAID`. CERTIFICATE: `NOT_PRINTED`, `PRINTED`, `DELIVERED` |
| paid_at | timestamptz NULL | |
| proof_file_id | uuid FK NULL | Bukti transfer |
| certificate_number | text NULL | UNIQUE per event |
| UNIQUE | (event_id, recipient_type, recipient_id, kind) | |
| CHECK | kind = 'FEE' OR amount IS NULL | |

### 11.2 `benefit_events`
Riwayat perubahan status benefit. Append-only.

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| benefit_id | uuid FK | |
| from_status, to_status | text | |
| actor_id | uuid FK | |
| note | text NULL | |
| created_at | timestamptz | |

---

## 12. File dan Lampiran

### 12.1 `files`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid FK | |
| storage_key | text UNIQUE | Path acak di object storage |
| original_name | text | |
| mime_type | text | Whitelist |
| size_bytes | bigint | Maksimal 5.242.880 |
| sha256 | text | |
| uploaded_by | uuid FK | |

Relasi polimorfik ke entitas (bukti transfer, lampiran kebutuhan) lewat tabel `file_links (file_id, entity_type, entity_id)`.

---

## 13. Audit dan Notifikasi

### 13.1 `audit_logs`
Append-only. Tidak boleh di-UPDATE atau DELETE (lihat `rules.md`).

| Kolom | Tipe | Keterangan |
|---|---|---|
| id | bigserial PK | |
| organization_id | uuid | |
| event_id | uuid NULL | |
| actor_id | uuid NULL | Null untuk sistem |
| action | text | misal `benefit.status_changed` |
| entity_type | text | |
| entity_id | uuid | |
| before | jsonb NULL | Hanya field yang berubah |
| after | jsonb NULL | |
| ip | inet NULL | |
| user_agent | text NULL | |
| created_at | timestamptz DEFAULT now() | |

Index: `(organization_id, created_at DESC)`, `(entity_type, entity_id)`.
Partisi bulanan disiapkan untuk jangka panjang.

### 13.2 `notifications`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| type | text | |
| title | text | |
| body | text | |
| link | text NULL | |
| read_at | timestamptz NULL | |
| created_at | timestamptz | |

---

## 14. Constraint dan Index Penting

| Tabel | Constraint / Index | Tujuan |
|---|---|---|
| volunteers | UNIQUE (event_id, code) | Kode QR unik |
| volunteer_shifts | UNIQUE (volunteer_id, shift_id) | Satu penugasan per shift |
| consumption_distributions | UNIQUE (slot_id, recipient_type, recipient_id) | Cegah pemberian ganda |
| consumption_distributions | UNIQUE client_op_id | Idempotensi sync |
| inventory_distributions | UNIQUE client_op_id | Idempotensi sync |
| benefits | UNIQUE (event_id, recipient_type, recipient_id, kind) | Satu fee dan satu sertifikat per orang |
| requisitions | CHECK from <> to | Tidak minta ke divisi sendiri |
| audit_logs | Index (organization_id, created_at) | Dashboard aktivitas |
| volunteers | Index (event_id, registration_status) | Filter daftar |
| requisitions | Index (to_division_id, status) | Kotak masuk divisi |

## 15. Query Penting

- Daftar relawan per divisi dengan jumlah check-in: join `volunteers` dengan `volunteer_shifts` dan agregasi.
- Progres konsumsi per slot: `served_count / target_recipients`, dihitung di service dan disimpan sebagai counter, bukan query agregasi tiap refresh.
- Kebutuhan masuk divisi: `requisitions WHERE to_division_id = ? AND status IN ('SUBMITTED', 'APPROVED', 'IN_PROGRESS') ORDER BY priority, needed_by`.
- Ringkasan benefit: `GROUP BY kind, status` dengan filter `event_id`.

## 16. Seed Data Pengembangan

Seed untuk lokal berisi:
- 1 organisasi, 1 event, 6 divisi (Acara, Logistik, Konsumsi, Sponsorship, Humas, Keuangan)
- 3 Head divisi, 20 committee, 150 volunteer (acak, dengan data palsu, tanpa data nyata)
- 4 vendor, 10 crew, 2 talent, 3 sponsor
- 10 kebutuhan dengan berbagai status
- 3 slot konsumsi per hari untuk 2 hari
- 1 akun per peran untuk pengujian RBAC

Seed tidak boleh berisi data personal nyata dari siapa pun.
