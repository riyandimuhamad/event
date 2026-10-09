'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Calendar,
  Users,
  Utensils,
  Wallet,
  QrCode,
  Layers,
  FileCheck,
  X,
  LogIn,
  KeyRound,
  Check,
  Boxes,
  ClipboardList,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface LandingPageProps {
  dashboardUrl: string;
}

export function LandingPageClient({ dashboardUrl }: LandingPageProps) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRoleEmail, setSelectedRoleEmail] = useState('budi.owner@nusantaracreative.id');
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<'logistik' | 'hari_h' | 'pasca'>('hari_h');

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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-800 selection:text-white">
      {/* Top Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-tight">
                EO
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                EventOps
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
              <a href="#fitur" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Fitur Produk
              </a>
              <a href="#alur" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Alur Operasional
              </a>
              <a href="#keamanan" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                Hak Akses & Audit
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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
              className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-colors"
            >
              Buka Aplikasi
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section (General Product Value Proposition) */}
      <section className="pt-28 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-medium mb-5">
          <span>Perangkat Lunak Manajemen Operasional Acara</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          Sistem manajemen operasional terpadu untuk event organizer.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Kelola pengadaan kebutuhan antar-divisi, presensi staf dan relawan via QR, distribusi
          konsumsi lapangan, serta verifikasi pencairan honorarium dalam satu aplikasi terpusat.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={dashboardUrl}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span>Coba Demo Interaktif</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pilih Akun Demo & Masuk</span>
          </button>
        </div>
      </section>

      {/* Simulated Product UI Frame */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto pb-16">
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 p-2 sm:p-3 shadow-xl">
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
            {/* Top Bar of Window */}
            <div className="h-9 bg-zinc-100 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              </div>
              <span className="font-mono text-[10px]">app.eventops.id/workspace/command-center</span>
              <span className="text-[10px] text-zinc-400">Pratinjau Antarmuka</span>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400">Ringkasan Operasional</div>
                  <div className="text-base font-bold text-zinc-900 dark:text-zinc-100">Command Center Acara</div>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium">
                    Fase Hari H
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    Kesiapan Lapangan: 85%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 font-medium">Pengadaan Antar-Divisi</div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1">Status: Disetujui & Dikerjakan</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Validasi alur divisi transparan</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 font-medium">Presensi & Stasiun QR</div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1">Check-in Terverifikasi</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Otomatis membuka jatah konsumsi</div>
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <div className="text-[11px] text-zinc-500 font-medium">Pencairan Honorarium</div>
                  <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 mt-1">Verifikasi Bukti Transfer</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">Append-only audit logging aktif</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="fitur" className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Kemampuan Utama Sistem
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Dirancang untuk mengatasi friksi umum antara divisi logistik, konsumsi, dan kepanitiaan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Layers className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pengadaan Kebutuhan (Requisitions)
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Alur pengajuan barang dan jasa antar-divisi dengan status terkontrol (Draft, Diajukan, Disetujui,
                Dikerjakan, Terpenuhi, Ditutup). Penolakan wajib menyertakan alasan tertulis minimal 10 karakter.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <QrCode className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Presensi Relawan & Kru Lapangan
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Stasiun check-in berbasis kode QR unik per personil. Mengelompokkan penugasan shift dan
                secara otomatis memverifikasi kehadiran sebelum memberikan hak akses konsumsi.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Utensils className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Distribusi Konsumsi Hari H
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Manajemen kuota makanan per slot waktu. Sistem membatasi satu penerima hanya mendapatkan
                satu porsi per sesi, serta mendukung antrean lokal offline jika sinyal seluler di venue terganggu.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Boxes className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Inventaris & Logistik Atribut
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pelacakan stok kaos per varian ukuran (S, M, L, XL, XXL) dan ID card. Membandingkan sisa fisik
                terhadap jumlah personil terdaftar untuk mencegah kekurangan sebelum hari pelaksanaan.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Wallet className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pencairan Fee & Sertifikat
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pencairan honorarium panitia memerlukan nomor transaksi dan lampiran bukti transfer. Penerbitan
                piagam penghargaan digital dengan nomor registrasi unik resmi.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Keamanan & Append-Only Audit Log
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                8 tingkatan hak akses berbasis peran (RBAC), enkripsi AES-256-GCM untuk data kontak personil,
                dan pencatatan jejak audit permanen yang tidak dapat diubah atau dihapus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Workflow Tabs */}
      <section id="alur" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Alur Kerja Siklus Acara
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Data terhubung dari tahap persiapan, koordinasi lapangan, hingga rekonsiliasi pasca-event.
          </p>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-6 text-xs">
          <button
            onClick={() => setActiveWorkflowTab('logistik')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeWorkflowTab === 'logistik'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Fase Pra-Event (Persiapan & Logistik)
          </button>
          <button
            onClick={() => setActiveWorkflowTab('hari_h')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeWorkflowTab === 'hari_h'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Fase Hari H (Operasional Lapangan)
          </button>
          <button
            onClick={() => setActiveWorkflowTab('pasca')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeWorkflowTab === 'pasca'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Fase Pasca-Event (Keuangan & Benefit)
          </button>
        </div>

        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-600 dark:text-zinc-400 space-y-2 leading-relaxed">
          {activeWorkflowTab === 'logistik' && (
            <>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Penyusunan Divisi, Rekrutmen Relawan, dan Pengadaan Kebutuhan
              </div>
              <p>
                Koordinator mengatur struktur kepanitiaan, membuka pendaftaran relawan, dan menginput
                permohonan logistik antar-divisi. Kepala divisi tujuan memeriksa dan menyetujui atau menolak
                pengajuan langsung di dalam platform.
              </p>
            </>
          )}

          {activeWorkflowTab === 'hari_h' && (
            <>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Check-in QR di Gerbang dan Distribusi Konsumsi Berjadwal
              </div>
              <p>
                Setiap relawan dan kru lapangan memindai kode identitas saat tiba di venue. Tim konsumsi
                mendistribusikan makanan sesuai slot yang aktif, dengan sistem memvalidasi presensi dan
                memblokir pengambilan ganda.
              </p>
            </>
          )}

          {activeWorkflowTab === 'pasca' && (
            <>
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Pencairan Honorarium Terverifikasi dan Penerbitan Piagam
              </div>
              <p>
                Bagian keuangan dan event manager mencairkan fee dengan melampirkan berkas bukti transfer.
                Relawan mendapatkan kartu tanda terima dan piagam penghargaan digital dengan nomor registrasi unik.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Security & Access Section */}
      <section id="keamanan" className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Tata Kelola Hak Akses & Jejak Audit
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Memastikan setiap peran panitia hanya dapat mengakses dan menyetujui modul sesuai wewenangnya.
                Tindakan administratif tercatat permanen di riwayat audit.
              </p>

              <div className="space-y-2 pt-1 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                  <span>Isolasi data organisasi multi-tenant pada setiap kueri database</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                  <span>Enkripsi AES-256-GCM untuk nomor kontak dan identitas personal panitia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                  <span>Pencatatan audit log append-only dengan sanitasi otomatis data rahasia</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono space-y-2">
              <div className="text-[11px] text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Struktur Peran dalam Sistem (RBAC):
              </div>
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">OWNER / EVENT_MANAGER</span>
                  <span className="text-zinc-500">Akses penuh, pencairan fee, persetujuan</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">DIVISION_HEAD</span>
                  <span className="text-zinc-500">Persetujuan kebutuhan divisi, seleksi relawan</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">COMMITTEE / OPERATOR</span>
                  <span className="text-zinc-500">Distribusi konsumsi, presensi QR lapangan</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-zinc-50 dark:bg-zinc-800/40">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">VOLUNTEER / VENDOR</span>
                  <span className="text-zinc-500">Lihat shift, ID card, dan piagam digital</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">EventOps</span>
            <span>·</span>
            <span>Platform Operasional Event Organizer</span>
          </div>

          <div className="flex items-center gap-5">
            <a href="#fitur" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Fitur
            </a>
            <a href="#alur" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Alur Kerja
            </a>
            <Link href={dashboardUrl} className="font-semibold text-zinc-800 dark:text-zinc-200">
              Masuk Dashboard
            </Link>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-5 shadow-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  Masuk ke EventOps
                </h3>
                <p className="text-[11px] text-zinc-500 mt-0.5">Pilih akun demonstrasi untuk mencoba sistem</p>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Demo Switcher */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 mb-1">
                Pilih Akun Demo:
              </label>
              {demoAccounts.map((acc) => {
                const isSelected = selectedRoleEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setSelectedRoleEmail(acc.email)}
                    className={`w-full p-2 rounded-lg border text-left text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-zinc-800 dark:text-zinc-200">{acc.name}</div>
                      <div className="text-[10px] text-zinc-400">{acc.role}</div>
                    </div>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Input Email Display */}
            <div className="pt-1">
              <label className="block text-[10px] font-semibold text-zinc-500 mb-1">
                Email Pengguna
              </label>
              <input
                type="email"
                readOnly
                value={selectedRoleEmail}
                className="w-full text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 p-2 bg-zinc-50 dark:bg-zinc-900 font-mono text-zinc-700 dark:text-zinc-300"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg"
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
                className="px-4 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg inline-flex items-center gap-1.5"
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
