'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet, Award, CheckCircle2, FileText, UploadCloud, Printer, Lock } from 'lucide-react';
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
  benefits,
  actor,
  orgSlug,
  eventId,
}: PostEventClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'fee' | 'certificate'>('fee');
  const [disbursingId, setDisbursingId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const canDisburse = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  const feeBenefits = benefits.filter((b) => b.kind === 'FEE');
  const certBenefits = benefits.filter((b) => b.kind === 'CERTIFICATE');

  const handleDisburse = async (benefitId: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(
        `/api/v1/benefits/${benefitId}/disburse?orgSlug=${orgSlug}&eventId=${eventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            proofFileId: crypto.randomUUID(), // Mock uploaded proof file ID
            paidAt: new Date().toISOString(),
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error?.message || 'Gagal mencairkan fee');
      }

      setDisbursingId(null);
      alert('Fee berhasil dicairkan dengan jejak audit!');
      router.refresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            {t('postEvent.title')}
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">{t('postEvent.subtitle')}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6">
        <button
          onClick={() => setActiveTab('fee')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'fee'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>{t('postEvent.feeTab')} ({feeBenefits.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('certificate')}
          className={`pb-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'certificate'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{t('postEvent.certTab')} ({certBenefits.length})</span>
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
                  <th className="px-6 py-3.5">Nominal Fee</th>
                  <th className="px-6 py-3.5">Status Pembayaran</th>
                  <th className="px-6 py-3.5">Tanggal Bayar</th>
                  <th className="px-6 py-3.5 text-right">Pencairan</th>
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
                    <td className="px-6 py-4 text-xs text-zinc-500">
                      {b.paidAt
                        ? new Date(b.paidAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {b.status !== 'PAID' ? (
                        canDisburse ? (
                          <button
                            onClick={() => handleDisburse(b.id)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>Cairkan Fee</span>
                          </button>
                        ) : (
                          <span
                            title="Hanya Owner & Event Manager yang berhak"
                            className="inline-flex items-center gap-1 text-xs text-zinc-400"
                          >
                            <Lock className="w-3 h-3" /> Terkunci
                          </span>
                        )
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600 flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
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
                  <th className="px-6 py-3.5">Nomor Sertifikat Unik</th>
                  <th className="px-6 py-3.5">Status Cetak</th>
                  <th className="px-6 py-3.5 text-right">Aksi Cetak</th>
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
                      {b.certificateNumber || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} context="certificate" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-semibold transition-colors"
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
    </div>
  );
}
