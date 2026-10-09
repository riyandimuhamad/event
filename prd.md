# PRD — Event Management Platform ("EventOps")

Versi: 1.0
Status: Draft untuk eksekusi di Antigravity
Pemilik: Riyandi

---

## 1. Ringkasan

EventOps adalah aplikasi web untuk Event Organizer (EO) mengelola seluruh siklus event, mulai dari persiapan (pre-event), hari pelaksanaan (H-day), hingga pasca-event (post-event). Aplikasi menghubungkan beberapa kelompok pengguna: panitia resmi (Official Committee), relawan (Official Volunteer), talent, sponsor, dan vendor beserta crew-nya.

Masalah yang diselesaikan:
- Koordinasi antar-divisi di EO sering berjalan lewat chat yang tercecer.
- Kebutuhan logistik (kaos, ID card, konsumsi) tidak terlacak dengan jelas per fase.
- Data relawan, panitia, dan vendor tersebar di spreadsheet berbeda.
- Hak akses tidak jelas: siapa boleh melihat dan mengubah apa.
- Distribusi konsumsi dan benefit (fee, sertifikat) sulit diaudit.

## 2. Tujuan Produk

1. Satu sumber data untuk semua entitas dalam satu event.
2. Setiap divisi bisa mengelola tim dan tugasnya sendiri, dan bisa mengajukan kebutuhan ke divisi lain secara terstruktur.
3. Akses data berbeda untuk setiap peran (Committee punya akses luas, Volunteer terbatas).
4. Jejak audit untuk setiap perubahan penting (distribusi, pembayaran benefit, perubahan status kebutuhan).
5. Alur kerja yang jelas per fase: Pre-event, Hari H, Post-event.

## 3. Pengguna dan Peran

| Peran | Deskripsi | Akses Utama |
|---|---|---|
| Super Admin | Pengelola platform | Semua data, manajemen tenant |
| EO Owner | Pemilik EO / ketua | Semua data dalam satu EO |
| Division Head | Kepala divisi | Penuh di divisinya, baca di divisi lain, approve kebutuhan masuk |
| Committee Member | Anggota panitia resmi | Sesuai divisi dan permission yang diberikan, akses lebih luas dari Volunteer |
| Official Volunteer | Relawan resmi | Jadwal, tugas, check-in, konsumsi miliknya, benefit miliknya |
| Talent Manager | Pihak manajemen talent | Jadwal show, rider, kebutuhan teknis talent |
| Sponsor Representative | Perwakilan sponsor | Paket sponsor, deliverable, dan booth |
| Vendor Admin | Admin vendor | Pesanan, daftar crew vendor |
| Vendor Crew | Crew di lapangan dari vendor | Jadwal kerja dan check-in |

Catatan: Peran bersifat multi-role. Satu user bisa menjadi Committee di satu event dan Volunteer di event lain.

## 4. Konsep Utama

- **Organization (EO)**: tenant. Semua data terisolasi per EO.
- **Event**: satu acara. Memiliki tanggal, lokasi, dan fase.
- **Division**: unit kerja dalam EO, misalnya Acara, Logistik, Konsumsi, Sponsorship, Humas, Talent, Keuangan, Perlengkapan. Divisi bisa ditambah atau diubah per event.
- **Committee**: anggota panitia resmi yang terikat ke divisi.
- **Volunteer**: relawan yang terikat ke divisi dan ke shift tertentu.
- **Requisition (Kebutuhan)**: permintaan resmi dari satu divisi ke divisi lain, misalnya Acara meminta Logistik menyiapkan panggung. Memiliki status dan alur persetujuan.
- **Phase**: fase event. Pre-event (H-30 sampai H-1), H-day, Post-event.
- **Distribution**: pencatatan pemberian barang atau layanan (kaos, ID card, makan, minum).
- **Benefit**: hak relawan atau panitia yang harus diberikan setelah event, misalnya fee dan sertifikat.

## 5. Ruang Lingkup

### 5.1 Modul Wajib (MVP)

**M1. Manajemen Organisasi dan Event**
- Buat EO, undang anggota, atur peran.
- Buat event dengan tanggal, lokasi, dan deskripsi.
- Dashboard ringkas per event: progres fase, jumlah kebutuhan terbuka, jumlah orang per kelompok.

**M2. Manajemen Divisi**
- CRUD divisi dalam satu event.
- Setiap divisi memiliki Head, anggota Committee, dan daftar Volunteer.
- Divisi memiliki daftar tugas (task) dengan status dan deadline.

**M3. Manajemen Committee (Official Committee)**
- Data panitia: nama, kontak, divisi, jabatan, jadwal, status konfirmasi.
- Akses lebih luas: melihat jadwal event, kebutuhan antar-divisi, dan data vendor terkait divisinya.
- Field tambahan karena hubungan langsung dengan EO: nomor identitas internal, tanggal bergabung, status kontrak atau kesepakatan.

**M4. Manajemen Volunteer (Official Volunteer)**
- Pendaftaran dan approval relawan.
- Penugasan ke divisi dan shift.
- Pengelolaan H-day: check-in, check-out, shift.
- Akses terbatas: hanya data miliknya dan jadwal yang relevan.

**M5. Fase Pre-event (Before Acara)**
- Logistik persiapan per relawan dan panitia:
  - Pengambilan kaos (ukuran, jumlah, status diambil)
  - ID card (data cetak, status cetak, status diambil)
  - Perlengkapan pendukung (lanyard, wristband, sertifikat cetak, dll.)
- Pengingat jadwal ke relawan dan panitia.

**M6. Fase Hari H (Day of Event)**
- Check-in dan check-out per shift.
- Distribusi konsumsi dengan slot waktu: Pagi, Siang, Malam, dan minuman.
- Pencatatan jumlah yang diberikan per slot dan per orang.
- Monitoring real-time: jumlah sudah makan vs jumlah seharusnya.

**M7. Fase Post-event (After Acara)**
- Distribusi benefit: fee dan sertifikat.
- Status pembayaran fee (belum, proses, sudah) dengan bukti transfer.
- Status sertifikat (belum dicetak, sudah dicetak, sudah diterima).
- Laporan akhir event.

**M8. Kebutuhan Antar-Divisi (Requisition)**
- Divisi membuat permintaan ke divisi lain dengan detail item, jumlah, deadline, dan prioritas.
- Alur status: Draft → Submitted → Approved / Rejected → In Progress → Fulfilled → Closed.
- Setiap perubahan status tercatat dengan siapa dan kapan.
- Komentar dan lampiran pada tiap kebutuhan.

**M9. Manajemen Vendor dan Crew Vendor**
- Data vendor: nama, kategori (konsumsi, perlengkapan, sound, dekorasi, dll.), kontak, kontrak.
- Pesanan vendor yang terkait dengan divisi dan kebutuhan.
- Daftar crew vendor per vendor: nama, peran, kontak, jadwal kerja, check-in.

**M10. Manajemen Talent**
- Data talent: nama, kategori, kontak manajemen (agency/manajer).
- Jadwal show: tanggal, durasi, panggung, slot.
- Kebutuhan teknis talent (rider): kebutuhan panggung, listrik, akomodasi.
- Riwayat komunikasi dengan pihak manajemen talent.

**M11. Manajemen Sponsor**
- Paket sponsor, nilai, status pembayaran.
- Deliverable yang dijanjikan (logo, booth, slot presentasi) dan status pemenuhannya.
- Perwakilan sponsor dengan akses terbatas.

**M12. Audit dan Notifikasi**
- Audit log untuk perubahan data penting.
- Notifikasi dalam aplikasi untuk kebutuhan baru, perubahan status, dan pengingat jadwal.

### 5.2 Di Luar Ruang Lingkup (MVP)

- Pembayaran online (payment gateway). Pembayaran dicatat manual.
- Penjualan tiket.
- Aplikasi mobile native. Versi web responsif sudah cukup untuk MVP.
- Integrasi dengan sistem absensi biometrik.
- Pencetakan ID card otomatis ke printer fisik.

## 6. Alur Pengguna Utama

**Alur A: Membuat kebutuhan antar-divisi**
1. Head Divisi Acara membuka menu Kebutuhan dan klik Buat Baru.
2. Pilih divisi tujuan (Logistik), isi item, jumlah, deadline, prioritas.
3. Simpan sebagai Draft, lalu Submit.
4. Head Divisi Logistik menerima notifikasi, lalu Approve atau Reject dengan alasan.
5. Jika Approved, Logistik mengubah status ke In Progress lalu Fulfilled.
6. Divisi Acara mengonfirmasi lalu status menjadi Closed.

**Alur B: Distribusi kaos pra-event**
1. Admin Perlengkapan membuka daftar relawan dan panitia event.
2. Filter per divisi, lalu set ukuran dan jumlah kaos.
3. Saat kaos diambil, tandai status Diambil dengan waktu dan petugas.

**Alur C: Distribusi makan Hari H**
1. Petugas Konsumsi membuka slot Siang.
2. Pilih daftar penerima yang sudah check-in.
3. Tandai pemberian per orang atau massal. Sistem menghitung sisa.
4. Dashboard menampilkan total terlayani dan total belum terlayani per slot.

**Alur D: Pencairan benefit pasca-event**
1. Bendahara membuka daftar fee relawan dan panitia.
2. Unggah bukti transfer, lalu ubah status ke Sudah Dibayar.
3. Sertifikat dicetak dan ditandai, lalu relawan menerima notifikasi.

## 7. Persyaratan Non-Fungsional

- **Keamanan**: autentikasi berbasis session atau JWT, RBAC di sisi server, bukan hanya di sisi UI. Data personal (nomor identitas, kontak) hanya bisa dilihat peran yang berhak.
- **Privasi**: data relawan tidak bisa diakses lintas EO. Log akses ke data personal dicatat.
- **Performa**: halaman daftar dengan 1.000 baris harus termuat di bawah 2 detik dengan pagination.
- **Konkurensi**: distribusi makan dan check-in harus aman jika dilakukan beberapa petugas bersamaan (optimistic locking atau transaksi).
- **Ketersediaan**: fitur H-day harus tetap bisa dipakai saat koneksi lemah. Minimal, hasil check-in tersimpan lokal lalu disinkronkan (lihat architecture.md).
- **Responsif**: dapat dipakai di layar ponsel untuk petugas lapangan.
- **Bahasa**: Bahasa Indonesia sebagai default, struktur i18n disiapkan.
- **Zona waktu**: simpan dalam UTC, tampilkan dalam WIB (Asia/Jakarta).

## 8. Metrik Keberhasilan

- Seluruh kebutuhan antar-divisi tercatat dan memiliki status jelas pada akhir Pre-event.
- Waktu rata-rata dari kebutuhan Submitted sampai Approved di bawah 24 jam.
- Selisih jumlah konsumsi terdistribusi dan jumlah terdaftar kurang dari 2%.
- Seluruh fee dan sertifikat memiliki status akhir (dibayar atau dicetak) sebelum 14 hari setelah event.

## 9. Asumsi dan Pertanyaan Terbuka

- Satu user bisa berada di beberapa EO. Diasumsikan ya.
- Satu event hanya memiliki satu lokasi utama. Multi-venue ditunda.
- Jumlah peserta per event diasumsikan di bawah 5.000 orang untuk MVP.
- Pertanyaan: apakah relawan perlu mendaftar sendiri lewat halaman publik, atau hanya diundang oleh EO? Default MVP: keduanya, dengan approval EO.
- Pertanyaan: format sertifikat, apakah template statis atau dibuat dinamis per relawan? Default MVP: template statis dengan placeholder nama.

## 10. Milestone

1. **M0 Fondasi**: setup proyek, autentikasi, RBAC dasar, multi-tenant EO.
2. **M1 Event dan Divisi**: M1 dan M2.
3. **M2 Committee dan Volunteer**: M3 dan M4.
4. **M3 Pre-event**: M5 dan notifikasi dasar.
5. **M4 Kebutuhan dan Vendor**: M8, M9.
6. **M5 Talent dan Sponsor**: M10, M11.
7. **M6 Hari H**: M6 termasuk mode offline sederhana.
8. **M7 Post-event dan Audit**: M7 dan M12.
9. **M8 Hardening**: uji beban, uji keamanan, dokumentasi pengguna.
