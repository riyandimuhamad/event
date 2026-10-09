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
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs">
                EO
              </div>
              <span className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                EventOps
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-5 text-xs text-zinc-600 dark:text-zinc-400">
              <a href="#modul" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Modul Lapangan
              </a>
              <a href="#tahapan" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Tahapan Acara
              </a>
              <a href="#keamanan" className="hover:text-zinc-900 dark:hover:text-zinc-100">
                Hak Akses & Log
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <ThemeToggle />

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>

            <Link
              href={dashboardUrl}
              className="px-3.5 py-1.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-colors"
            >
              Buka Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 text-xs font-medium mb-5">
          <span>{orgName}</span>
          <span>·</span>
          <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{eventName}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
          Sistem koordinasi lapangan dan logistik kepanitiaan event.
        </h1>

        <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Mencatat pengadaan antar-divisi, presensi relawan via QR, pembagian makanan per slot waktu,
          dan verifikasi transfer honorarium dalam satu sistem terintegrasi.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={dashboardUrl}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-lg transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <span>Masuk ke Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors inline-flex items-center justify-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-zinc-400" />
            <span>Pilih Akun Demo Pengujian</span>
          </button>
        </div>

        {/* Operational Metrics */}
        <div className="mt-14 pt-6 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">150</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Relawan dengan Shift</div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">6 Divisi</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Struktur Kepanitiaan</div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">6 Slot</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Jadwal Distribusi Makan</div>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">10</div>
            <div className="text-[11px] text-zinc-500 mt-0.5">Pengadaan Antar-Divisi</div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modul" className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              Modul Operasional Utama
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Aturan validasi langsung berjalan di backend untuk mencegah kesalahan di lapangan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Layers className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pengadaan Kebutuhan (Requisition)
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pengajuan barang antar divisi melalui tahapan Draft, Diajukan, Disetujui, Dikerjakan, Terpenuhi,
                dan Ditutup. Penolakan wajib menyertakan alasan tertulis minimal 10 karakter.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Utensils className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Presensi & Jatah Makan Hari H
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Relawan memindai QR code saat hadir. Jatah konsumsi hanya terbuka bagi yang sudah check-in.
                Satu orang hanya dapat mengambil 1 jatah per slot untuk mencegah duplikasi.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2.5">
              <div className="w-8 h-8 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center justify-center">
                <Wallet className="w-4 h-4 stroke-[1.75]" />
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Pencairan Fee & Piagam Penghargaan
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Pencairan honorarium wajib melampirkan berkas bukti transfer dan dibatasi khusus untuk Owner atau
                Event Manager. Sertifikat resmi diterbitkan dengan nomor registrasi unik.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Tabs */}
      <section id="tahapan" className="py-16 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Tiga Fase Pelaksanaan Event
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Data dari persiapan awal mengalir langsung ke stasiun lapangan tanpa rekap manual berulang.
          </p>
        </div>

        <div className="flex border-b border-zinc-200 dark:border-zinc-800 space-x-6 text-xs">
          <button
            onClick={() => setActiveWorkflowTab('pre')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeWorkflowTab === 'pre'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            1. Pra-Event (Logistik & Persiapan)
          </button>
          <button
            onClick={() => setActiveWorkflowTab('dayof')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeWorkflowTab === 'dayof'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            2. Hari H (Operasional Lapangan)
          </button>
          <button
            onClick={() => setActiveWorkflowTab('post')}
            className={`pb-2.5 font-semibold transition-colors border-b-2 ${
              activeWorkflowTab === 'post'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            3. Pasca-Event (Keuangan & Sertifikat)
          </button>
        </div>

        <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          {activeWorkflowTab === 'pre' && (
            <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Distribusi atribut, konfirmasi vendor, dan penugasan shift
              </div>
              <p>
                Stok fisik kaos dicatat per varian ukuran (S, M, L, XL, XXL). Sistem membandingkan sisa
                stok dengan jumlah yang sudah diambil oleh panitia dan relawan agar kekurangan terdeteksi
                sebelum acara dimulai.
              </p>
              <div className="pt-2 text-[11px] text-zinc-500">
                Mencakup riders teknis penampil panggung dan pemenuhan deliverables kontrak sponsor.
              </div>
            </div>
          )}

          {activeWorkflowTab === 'dayof' && (
            <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Stasiun check-in QR dan pembagian konsumsi per jadwal
              </div>
              <p>
                Koordinator lapangan memvalidasi kehadiran via pemindai QR. Begitu relawan tercatat hadir,
                opsi pembagian makanan di slot yang sedang buka langsung aktif. Sistem menolak pembagian jika
                slot berstatus ditutup atau orang tersebut sudah pernah menerima di sesi yang sama.
              </p>
              <div className="pt-2 text-[11px] text-zinc-500">
                Mendukung pencatatan antrean lokal jika jaringan seluler di lokasi konser mengalami gangguan.
              </div>
            </div>
          )}

          {activeWorkflowTab === 'post' && (
            <div className="space-y-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
              <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                Pencairan honorarium panitia dan penerbitan piagam resmi
              </div>
              <p>
                Setiap pembayaran fee mencatat nomor transaksi transfer dan ID file bukti transfer. Relawan
                mendapatkan kartu piagam penghargaan dengan nomor registrasi unik yang siap dicetak.
              </p>
              <div className="pt-2 text-[11px] text-zinc-500">
                Riwayat perubahan tercatat permanen di append-only audit log untuk pertanggungjawaban panitia.
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Security & Access Section */}
      <section id="keamanan" className="py-16 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Hak Akses Berbasis Peran & Audit Log
              </h2>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Tiap pengguna memiliki wewenang spesifik (Owner, Event Manager, Kepala Divisi, Panitia, Relawan,
                hingga Vendor). Aksi penting seperti persetujuan logistik dan pencairan dana dicatat permanen di
                tabel log tanpa opsi hapus.
              </p>

              <div className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                  <span>Enkripsi AES-256-GCM untuk nomor telepon dan kontak identitas panitia</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                  <span>Isolasi data organisasi (Tenant Isolation) pada setiap kueri database</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 flex-shrink-0" />
                  <span>Sanitasi otomatis agar password dan token tidak masuk ke riwayat audit</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-mono space-y-2">
              <div className="text-[11px] text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Contoh Catatan Riwayat Audit (Append-Only):
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-100 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">action: consumption.distributed</div>
                  <div className="text-zinc-500 text-[10px]">actor: Dewi Lestari · slot: SIANG-D1 · qty: 1</div>
                </div>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-100 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">action: requisition.approved</div>
                  <div className="text-zinc-500 text-[10px]">actor: Siti Rahmawati · code: REQ-0004</div>
                </div>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-100 dark:border-zinc-800">
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200">action: benefit.fee_disbursed</div>
                  <div className="text-zinc-500 text-[10px]">actor: Budi Santoso · ref: TRX-882194</div>
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
            <span>{orgName}</span>
          </div>

          <div className="flex items-center gap-5">
            <a href="#modul" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Modul
            </a>
            <a href="#tahapan" className="hover:text-zinc-800 dark:hover:text-zinc-200">
              Tahapan
            </a>
            <Link href={dashboardUrl} className="font-semibold text-zinc-800 dark:text-zinc-200">
              Buka Dashboard
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
                <p className="text-[11px] text-zinc-500 mt-0.5">Pilih akun pengujian untuk mencoba sistem</p>
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
