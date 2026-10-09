'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Calendar,
  Users,
  Utensils,
  Wallet,
  Sparkles,
  QrCode,
  Lock,
  Layers,
  ChevronRight,
  FileCheck,
  Activity,
  Laptop,
  Check,
  X,
  LogIn,
  KeyRound,
  UserCheck,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface LandingPageProps {
  dashboardUrl: string;
  eventName: string;
  orgName: string;
}

export function LandingPageClient({
  dashboardUrl,
  eventName,
  orgName,
}: LandingPageProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRoleEmail, setSelectedRoleEmail] = useState('budi.owner@nusantaracreative.id');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'pre' | 'dayof' | 'post'>('dayof');

  const demoAccounts = [
    {
      name: 'Budi Santoso',
      role: 'Owner Organisasi',
      email: 'budi.owner@nusantaracreative.id',
      badge: 'OWNER',
    },
    {
      name: 'Siti Rahmawati',
      role: 'Event Manager',
      email: 'siti.manager@nusantaracreative.id',
      badge: 'EVENT_MANAGER',
    },
    {
      name: 'Dewi Lestari',
      role: 'Kepala Divisi Konsumsi',
      email: 'dewi.konsumsi@nusantaracreative.id',
      badge: 'DIVISION_HEAD',
    },
    {
      name: 'Rian Pratama',
      role: 'Relawan Operasional',
      email: 'volunteer.0001@eventops.id',
      badge: 'VOLUNTEER',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
                EO
              </div>
              <span className="font-bold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                EventOps
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <a href="#fitur" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Fitur Utama
              </a>
              <a href="#alur-kerja" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Alur Siklus Acara
              </a>
              <a href="#keamanan" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Keamanan & Audit
              </a>
              <a href="#harga" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Harga
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>

            <Link
              href={dashboardUrl}
              className="px-4 py-2 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg shadow-sm transition-all hover:shadow"
            >
              Buka Command Center
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Release Tag Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>Platform Manajemen Operasional Event Generasi Baru</span>
          <span className="text-zinc-400">·</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">v0.2</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 max-w-4xl mx-auto leading-tight">
          Kelola Seluruh Operasional Event Organizer{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600">
            Tanpa Meleset.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Dari pengadaan logistik antar-divisi, presensi relawan QR, distribusi konsumsi instan hari
          H, hingga pencairan honorarium dengan jejak audit permanen—semuanya tersinkronisasi dalam
          satu sistem komando.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={dashboardUrl}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2"
          >
            <span>Buka Dashboard ({eventName})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3 text-sm font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl transition-colors inline-flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-700"
          >
            <KeyRound className="w-4 h-4 text-zinc-500" />
            <span>Pilih Akun Demo & Masuk</span>
          </button>
        </div>

        {/* Trust Badges Bar */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
          <div className="space-y-1">
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">150+</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Relawan Terkoordinasi</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">0%</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Duplikasi Jatah Konsumsi</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tabular-nums">36 Model</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Skema Data PostgreSQL</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums">100%</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Append-Only Audit Trail</div>
          </div>
        </div>
      </section>

      {/* Interactive App Preview Frame */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-24">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/50 p-2 sm:p-3 shadow-2xl">
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-inner">
            {/* Mock browser top chrome */}
            <div className="h-9 bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="font-mono text-[10px] text-zinc-500 bg-white dark:bg-zinc-900 px-3 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                app.eventops.id/{orgName.toLowerCase().replace(/\s+/g, '-')}/command-center
              </div>
              <div className="w-12" />
            </div>

            {/* Simulated Dashboard UI */}
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                    Live Operational Command Center
                  </div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                    {eventName}
                  </h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Kesiapan Lapangan: 85%
                </span>
              </div>

              {/* Mini cards preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="text-[11px] text-zinc-500 font-medium">Kebutuhan Disetujui</div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">8 / 10 Item</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-1">✓ Berjalan Sesuai Jadwal</div>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="text-[11px] text-zinc-500 font-medium">Relawan Presensi QR</div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">112 / 150 Orang</div>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-1">✓ Jatah Makan Aktif Otomatis</div>
                </div>
                <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40">
                  <div className="text-[11px] text-zinc-500 font-medium">Realisasi Honorarium</div>
                  <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">Rp 16.500.000</div>
                  <div className="text-[10px] text-zinc-500 font-semibold mt-1">100% Bukti Terverifikasi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillar Grid Section */}
      <section id="fitur" className="py-20 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
              Dibangun Khusus untuk Dinamika Event Nyata
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Menghilangkan spreadsheet terpisah, grup chat yang tenggelam, dan selisih logistik
              dengan arsitektur state machine yang tegas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-900">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pengadaan Kebutuhan Antar-Divisi
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Alur permohonan barang/jasa antar divisi terkontrol ketat (Draft ➔ Diajukan ➔ Disetujui ➔
                Dikerjakan ➔ Terpenuhi). Penolakan wajib menyertakan alasan tertulis minimal 10 karakter.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900">
                <Utensils className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Presensi & Konsumsi Hari H Real-time
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Relawan yang check-in seketika berstatus memenuhi syarat makan. Sistem mencegah
                pemberian ganda per slot dan mendukung antrean offline menggunakan <code>client_op_id</code>.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center border border-violet-200 dark:border-violet-900">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Pencairan Fee & Piagam Digital
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pencairan honorarium wajib melampirkan berkas bukti transfer, dibatasi hanya untuk Owner /
                Event Manager, dan penerbitan piagam digital dengan nomor registrasi unik resmi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Workflow Section */}
      <section id="alur-kerja" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
            Satu Siklus Penuh: Dari Rencana ke Rekonsiliasi
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Klik tahapan di bawah untuk melihat bagaimana EventOps menyatukan seluruh divisi.
          </p>
        </div>

        {/* Workflow Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setActiveWorkflowTab('pre')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeWorkflowTab === 'pre'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              1. Fase Pra-Event (Logistik)
            </button>
            <button
              onClick={() => setActiveWorkflowTab('dayof')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeWorkflowTab === 'dayof'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              2. Fase Hari H (Operasional)
            </button>
            <button
              onClick={() => setActiveWorkflowTab('post')}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeWorkflowTab === 'post'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              3. Fase Pasca-Event (Keuangan)
            </button>
          </div>
        </div>

        {/* Workflow Tab Details */}
        <div className="p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-w-4xl mx-auto shadow-sm">
          {activeWorkflowTab === 'pre' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-600" />
                <span>Distribusi Kaos, Perizinan Vendor & Penugasan Shift</span>
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Stok kaos dan ID card dilacak per varian ukuran (S, M, L, XL, XXL). PIC dapat memantau
                sisa stok fisik vs kuantitas yang telah diambil relawan, mencegah kekurangan atribut pada hari H.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Katalog Vendor & Riders Talent</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Penetapan jadwal soundcheck & vendor crew pass.</div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Sponsor Deliverables Tracker</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Pemeriksaan logo booth, banner, dan jatah tiket VIP.</div>
                </div>
              </div>
            </div>
          )}

          {activeWorkflowTab === 'dayof' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <span>Stasiun Presensi QR & Pembagian Jatah Makan Tanpa Meleset</span>
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Relawan memindai QR code di gerbang kedatangan. Begitu terverifikasi hadir, sistem
                membuka kelayakan pembagian makan pada slot aktif (makan siang/malam). Hak akses terkunci
                otomatis jika relawan belum hadir atau sudah mengambil makanan di slot yang sama.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Offline-First Queue Sync</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Koneksi lapangan terputus? Transaksi tersimpan lokal dan tersinkronisasi otomatis saat online.</div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Slot Consumption Enforcement</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Slot yang ditutup (CLOSED) menolak distribusi baru dengan notifikasi jelas.</div>
                </div>
              </div>
            </div>
          )}

          {activeWorkflowTab === 'post' && (
            <div className="space-y-4">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <span>Rekonsiliasi Anggaran, Pencairan Honorarium & E-Sertifikat</span>
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pengeluaran dana operasional dipertanggungjawabkan dengan nomor referensi transfer bank
                dan lampiran bukti bayar. Relawan menerima sertifikat apresiasi resmi dengan kode verifikasi
                unik yang dapat dicetak atau diunduh langsung.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Audit Trail Append-Only</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Seluruh tindakan penting tercatat permanen tanpa bisa dihapus atau dimanipulasi.</div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">Piagam Penghargaan Resmi</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Format standar institusi dengan tanda tangan komite pelaksana.</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Security & RBAC Section */}
      <section id="keamanan" className="py-20 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Enterprise Grade Security</span>
              </div>
              <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-50">
                Privasi Terjamin, Isolasi Tenant & Audit Log Permanen
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Platform dirancang dengan kepatuhan isolasi data multi-tenant ketat. Informasi kontak
                personal (email dan nomor telepon) dilindungi enkripsi AES-256-GCM.
              </p>

              <div className="space-y-2.5 pt-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>8 Tingkatan Wewenang RBAC (Owner, Manager, Head Divisi, Kru, Relawan)</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Sanitasi otomatis data sensitif pada pencatatan audit log</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pemisahan scope organisasi (Tenant Isolation) di setiap kueri database</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 text-[11px]">Audit Log Stream (Simulasi)</span>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  Immutable
                </span>
              </div>
              <div className="space-y-2 text-[11px] leading-relaxed">
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">consumption.distributed</span>
                  <div className="text-zinc-400 text-[10px]">Actor: Dewi Lestari (Head Konsumsi) · Slot: SIANG-D1</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">requisition.approved</span>
                  <div className="text-zinc-400 text-[10px]">Actor: Siti Rahmawati (Event Manager) · Code: REQ-0004</div>
                </div>
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">benefit.fee_disbursed</span>
                  <div className="text-zinc-400 text-[10px]">Actor: Budi Santoso (Owner) · Ref: TRX-882194</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Call to Action */}
      <section id="harga" className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 text-white shadow-2xl space-y-6 border border-zinc-800">
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center mx-auto border border-white/10">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Mulai Gunakan EventOps untuk Event Anda
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Tersedia untuk panitia festival musik, konferensi akademik, pameran expo, dan event organizer profesional.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href={dashboardUrl}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all shadow-md"
            >
              Jelajahi Command Center ({eventName})
            </Link>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors border border-zinc-700"
            >
              Masuk dengan Akun Uji Coba
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-10 text-xs text-zinc-500 dark:text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-[10px]">
              EO
            </div>
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">EventOps Platform</span>
            <span>·</span>
            <span>© 2026 {orgName}. Hak Cipta Dilindungi.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#fitur" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Fitur
            </a>
            <a href="#keamanan" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              Audit & Kepatuhan
            </a>
            <Link href={dashboardUrl} className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-medium">
              Buka Aplikasi
            </Link>
          </div>
        </div>
      </footer>

      {/* Interactive Login Modal (SaaS Standard) */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-tight">
                  EO
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
                    Masuk ke EventOps
                  </h3>
                  <p className="text-[11px] text-zinc-500">Pilih akun demonstrasi atau masuk dengan email</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Switcher */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
                Pilih Akun Peran (1-Click Test Access):
              </label>
              <div className="space-y-2">
                {demoAccounts.map((acc) => {
                  const isSelected = selectedRoleEmail === acc.email;
                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => setSelectedRoleEmail(acc.email)}
                      className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-zinc-900 dark:text-zinc-100'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-zinc-800 dark:text-zinc-200">{acc.name}</div>
                        <div className="text-[11px] text-zinc-400">{acc.role}</div>
                      </div>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                        {acc.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standard Login Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Alamat Email
                </label>
                <input
                  type="email"
                  value={selectedRoleEmail}
                  onChange={(e) => setSelectedRoleEmail(e.target.value)}
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-50 dark:bg-zinc-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value="••••••••••••"
                  readOnly
                  className="w-full text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 font-mono"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl"
              >
                Batal
              </button>

              <Link
                href={dashboardUrl}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('eventops_active_role_email', selectedRoleEmail);
                  }
                  setIsLoginModalOpen(false);
                }}
                className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm inline-flex items-center gap-1.5"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
