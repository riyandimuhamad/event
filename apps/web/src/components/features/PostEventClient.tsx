'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Award,
  CheckCircle2,
  FileText,
  UploadCloud,
  Printer,
  Lock,
  DollarSign,
  FileCheck,
  AlertCircle,
  Building,
  User,
  ShieldCheck,
  Download,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface BenefitData {
  id: string;
  recipientType: string;
  recipientId: string;
  recipientName: string;
  recipientDivision: string;
  kind: string;
  amountNumber: number;
  status: string;
  paidAt: string | null;
  certificateNumber: string | null;
}

interface PostEventClientProps {
  benefits: BenefitData[];
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

export function PostEventClient({
  benefits: initialBenefits,
  actor,
  orgSlug,
  eventId,
}: PostEventClientProps) {
  const router = useRouter();
  const [benefits, setBenefits] = useState<BenefitData[]>(initialBenefits);
  const [activeTab, setActiveTab] = useState<'fee' | 'certificate'>('fee');

  // Disbursement modal state
  const [disbursingBenefit, setDisbursingBenefit] = useState<BenefitData | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('TRANSFER_BCA');
  const [referenceNo, setReferenceNo] = useState(`TRX-${Date.now().toString().slice(-6)}`);
  const [proofFileName, setProofFileName] = useState('bukti_transfer_honorarium.pdf');
  const [isProcessing, setIsProcessing] = useState(false);
  const [disburseError, setDisburseError] = useState<string | null>(null);

  // Certificate preview modal state
  const [selectedCertForPreview, setSelectedCertForPreview] = useState<BenefitData | null>(null);

  const canDisburse = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  const feeBenefits = benefits.filter((b) => b.kind === 'FEE');
  const certBenefits = benefits.filter((b) => b.kind === 'CERTIFICATE');

  // Financial calculations
  const totalFeeBudget = feeBenefits.reduce((acc, b) => acc + (b.amountNumber || 0), 0);
  const paidFeeTotal = feeBenefits
    .filter((b) => b.status === 'PAID')
    .reduce((acc, b) => acc + (b.amountNumber || 0), 0);
  const pendingFeeTotal = totalFeeBudget - paidFeeTotal;
  const issuedCertCount = certBenefits.filter((b) => b.certificateNumber).length;

  const handleDisburseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disbursingBenefit) return;

    setIsProcessing(true);
    setDisburseError(null);
    try {
      const res = await fetch(
        `/api/v1/benefits/${disbursingBenefit.id}/disburse?orgSlug=${orgSlug}&eventId=${eventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proofFileId: crypto.randomUUID(),
            paidAt: new Date().toISOString(),
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Gagal mencairkan fee');
      }

      // Optimistic update
      setBenefits((prev) =>
        prev.map((b) =>
          b.id === disbursingBenefit.id
            ? { ...b, status: 'PAID', paidAt: new Date().toISOString() }
            : b
        )
      );

      setDisbursingBenefit(null);
      router.refresh();
    } catch (err: unknown) {
      setDisburseError((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {t('postEvent.title')}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-0.5">
            {t('postEvent.subtitle')}
          </p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-white dark:bg-zinc-800/80 shadow-sm">
          <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-zinc-400" /> Total Anggaran Fee
          </div>
          <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-1 tabular-nums">
            Rp {totalFeeBudget.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Fee Terbayar
          </div>
          <div className="text-xl font-bold text-emerald-900 dark:text-emerald-300 mt-1 tabular-nums">
            Rp {paidFeeTotal.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-200/60 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5" /> Sisa Menunggu Pencairan
          </div>
          <div className="text-xl font-bold text-amber-900 dark:text-amber-300 mt-1 tabular-nums">
            Rp {pendingFeeTotal.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-accent/25 bg-accent-subtle shadow-sm">
          <div className="text-xs font-semibold text-accent dark:text-[#FFC46B] flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" /> Sertifikat Diterbitkan
          </div>
          <div className="text-xl font-bold text-accent dark:text-[#FFC46B] mt-1 tabular-nums">
            {issuedCertCount} Dokumen
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('fee')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'fee'
              ? 'border-accent text-accent dark:text-[#FFC46B]'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>
            {t('postEvent.feeTab')} ({feeBenefits.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'certificate'
              ? 'border-accent text-accent dark:text-[#FFC46B]'
              : 'border-transparent text-text-muted hover:text-text'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>
            {t('postEvent.certTab')} ({certBenefits.length})
          </span>
        </button>
      </div>

      {/* Tab 1: Fees */}
      {activeTab === 'fee' && (
        <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-border text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Penerima & Divisi</th>
                  <th className="px-6 py-3.5">Nominal Honorarium</th>
                  <th className="px-6 py-3.5">Status Pembayaran</th>
                  <th className="px-6 py-3.5">Tanggal Pencairan</th>
                  <th className="px-6 py-3.5 text-right">Aksi Pencairan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {feeBenefits.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/20">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {b.recipientName}
                      </div>
                      <div className="text-xs text-zinc-400">{b.recipientDivision}</div>
                    </td>
                    <td className="px-6 py-4 font-bold tabular-nums text-zinc-800 dark:text-zinc-200">
                      Rp {b.amountNumber.toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} context="benefit" />
                    </td>
                    <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400">
                      {b.paidAt
                        ? new Date(b.paidAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status !== 'PAID' ? (
                        canDisburse ? (
                          <button
                            onClick={() => setDisbursingBenefit(b)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Cairkan Fee</span>
                          </button>
                        ) : (
                          <span
                            title="Hanya Owner & Event Manager yang berhak"
                            className="inline-flex items-center gap-1 text-xs text-zinc-400"
                          >
                            <Lock className="w-3 h-3" /> Terkunci (Perlu Otorisasi)
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Telah Ditransfer
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Certificates */}
      {activeTab === 'certificate' && (
        <div className="bg-white dark:bg-zinc-800 border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-border text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Penerima & Divisi</th>
                  <th className="px-6 py-3.5">Nomor Registrasi Sertifikat</th>
                  <th className="px-6 py-3.5">Status Cetak</th>
                  <th className="px-6 py-3.5 text-right">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {certBenefits.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/20">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {b.recipientName}
                      </div>
                      <div className="text-xs text-zinc-400">{b.recipientDivision}</div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {b.certificateNumber || 'CERT-EO-' + b.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} context="certificate" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedCertForPreview(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-xl text-xs font-semibold transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Pratinjau / Cetak</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Disbursement Dialog Modal with Audit File Upload */}
      {disbursingBenefit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <span>Konfirmasi Pencairan Honorarium</span>
              </h3>
              <button
                onClick={() => setDisbursingBenefit(null)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            {disburseError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{disburseError}</span>
              </div>
            )}

            <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3.5 rounded-xl border border-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Penerima Dana:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {disbursingBenefit.recipientName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Divisi / Peran:</span>
                <span className="text-zinc-700 dark:text-zinc-300">
                  {disbursingBenefit.recipientDivision}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border">
                <span className="text-zinc-500">Nominal Transfer:</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  Rp {disbursingBenefit.amountNumber.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <form onSubmit={handleDisburseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Metode Penyaluran Dana
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded-xl border border-border p-2 bg-zinc-50 dark:bg-zinc-900"
                >
                  <option value="TRANSFER_BCA">Bank BCA (Transfer Antar Bank)</option>
                  <option value="TRANSFER_MANDIRI">Bank Mandiri</option>
                  <option value="TRANSFER_BRI">Bank BRI</option>
                  <option value="CASH">Kas Tunai / Petty Cash Lapangan</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Nomor Referensi Transaksi
                </label>
                <input
                  type="text"
                  required
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full rounded-xl border border-border p-2 font-mono bg-zinc-50 dark:bg-zinc-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  File Bukti Transfer (Audit Requirement)
                </label>
                <div className="p-3 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 truncate max-w-[200px]">
                      {proofFileName}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Siap Dilampirkan</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  Aksi ini dicatat dalam <strong>Append-Only Audit Log</strong> dengan stempel waktu
                  permanen dan otorisasi ID pengguna Anda.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisbursingBenefit(null)}
                  className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-sm"
                >
                  {isProcessing ? 'Memproses...' : 'Konfirmasi & Rekam Pencairan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate of Appreciation Modal */}
      {selectedCertForPreview && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] dark:bg-[#1E0F0E] rounded-3xl max-w-2xl w-full p-8 sm:p-10 shadow-2xl border-4 border-[#7A2E33]/60 dark:border-[#FFC46B]/50 space-y-6 text-center relative overflow-hidden">
            {/* Top decorative emblem */}
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-subtle border border-accent/25 text-[10px] uppercase font-bold tracking-widest text-accent dark:text-[#FFC46B]">
                <Award className="w-3.5 h-3.5 text-[#FFC46B]" />
                EventOps Management Certificate of Excellence
              </div>
              <h2 className="text-2xl font-serif font-bold text-text uppercase tracking-widest mt-1">
                Piagam Penghargaan
              </h2>
              <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-[#FFC46B] to-transparent mx-auto mt-2" />
            </div>

            <p className="text-xs text-text-muted italic">
              Dengan bangga diberikan kepada saudara/i:
            </p>

            <div className="py-2">
              <h3 className="text-2xl font-extrabold text-text font-serif underline decoration-[#FFC46B] decoration-2 underline-offset-8">
                {selectedCertForPreview.recipientName}
              </h3>
              <p className="text-sm font-semibold text-accent dark:text-[#FFC46B] mt-3">
                Atas dedikasi dan kontribusi luar biasa pada Divisi {selectedCertForPreview.recipientDivision}
              </p>
            </div>

            <p className="text-xs text-text-muted max-w-lg mx-auto leading-relaxed">
              Telah menunjukkan integritas, loyalitas, serta performa operasional berstandar tinggi
              dalam menyukseskan seluruh rangkaian acara EventOps Nusantara.
            </p>

            {/* Bottom credential footer */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border text-left">
              <div>
                <div className="text-[10px] text-text-subtle uppercase font-semibold">Nomor Registrasi Dokumen</div>
                <div className="font-mono text-xs font-bold text-text">
                  {selectedCertForPreview.certificateNumber ||
                    'CERT-EO-' + selectedCertForPreview.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="text-[10px] text-text-muted mt-1">Status: Terverifikasi Digital</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-text-subtle uppercase font-semibold">Komite Pelaksana</div>
                <div className="font-serif font-bold text-xs text-text mt-0.5">
                  EventOps Organizing Committee
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                  ✓ Validated by Cryptographic Signature
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-4 border-t border-border">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-md shadow-accent/20 transition-all hover:scale-105"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Piagam Resmi</span>
              </button>
              <button
                onClick={() => setSelectedCertForPreview(null)}
                className="px-5 py-2.5 bg-surface-muted hover:bg-border text-text text-xs font-semibold rounded-xl border border-border transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
