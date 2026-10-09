import React from 'react';
import {
  Pencil,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  CheckSquare,
  Lock,
  MapPin,
  Wallet,
  FileText,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';
import { t } from '@/lib/i18n';

interface StatusBadgeProps {
  status: string;
  context?: 'requisition' | 'volunteer' | 'benefit' | 'certificate' | 'event' | 'priority';
}

export function StatusBadge({ status, context = 'requisition' }: StatusBadgeProps) {
  let label = status;
  let colorClass = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  let Icon = Clock;

  if (context === 'requisition') {
    switch (status) {
      case 'DRAFT':
        label = t('requisition.status.DRAFT');
        colorClass = 'bg-stone-100 text-stone-700 dark:bg-stone-900/60 dark:text-stone-300 border-stone-200 dark:border-stone-800';
        Icon = Pencil;
        break;
      case 'SUBMITTED':
        label = t('requisition.status.SUBMITTED');
        colorClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800';
        Icon = Send;
        break;
      case 'APPROVED':
        label = t('requisition.status.APPROVED');
        colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        Icon = CheckCircle2;
        break;
      case 'REJECTED':
        label = t('requisition.status.REJECTED');
        colorClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        Icon = XCircle;
        break;
      case 'IN_PROGRESS':
        label = t('requisition.status.IN_PROGRESS');
        colorClass = 'bg-accent-subtle text-accent dark:text-[#FFC46B] border-accent/25 dark:border-accent/40';
        Icon = Clock;
        break;
      case 'FULFILLED':
        label = t('requisition.status.FULFILLED');
        colorClass = 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800';
        Icon = CheckSquare;
        break;
      case 'CLOSED':
        label = t('requisition.status.CLOSED');
        colorClass = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700';
        Icon = Lock;
        break;
    }
  } else if (context === 'priority') {
    switch (status) {
      case 'LOW':
        label = t('requisition.priority.LOW');
        colorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        break;
      case 'MEDIUM':
        label = t('requisition.priority.MEDIUM');
        colorClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        break;
      case 'HIGH':
        label = t('requisition.priority.HIGH');
        colorClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        Icon = AlertTriangle;
        break;
      case 'URGENT':
        label = t('requisition.priority.URGENT');
        colorClass = 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800 font-bold animate-pulse';
        Icon = AlertTriangle;
        break;
    }
  } else if (context === 'volunteer') {
    switch (status) {
      case 'PENDING':
        label = t('volunteers.status.PENDING');
        colorClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        Icon = Clock;
        break;
      case 'APPROVED':
        label = t('volunteers.status.APPROVED');
        colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        Icon = CheckCircle2;
        break;
      case 'REJECTED':
        label = t('volunteers.status.REJECTED');
        colorClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200 dark:border-rose-800';
        Icon = XCircle;
        break;
      case 'CHECKED_IN':
        label = 'Checked-in';
        colorClass = 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800';
        Icon = MapPin;
        break;
    }
  } else if (context === 'benefit') {
    switch (status) {
      case 'UNPAID':
        label = t('postEvent.feeStatus.UNPAID');
        colorClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        Icon = Wallet;
        break;
      case 'PROCESSING':
        label = t('postEvent.feeStatus.PROCESSING');
        colorClass = 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200 dark:border-sky-800';
        Icon = Clock;
        break;
      case 'PAID':
        label = t('postEvent.feeStatus.PAID');
        colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        Icon = CheckCircle2;
        break;
    }
  } else if (context === 'certificate') {
    switch (status) {
      case 'NOT_PRINTED':
        label = t('postEvent.certStatus.NOT_PRINTED');
        colorClass = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
        Icon = FileText;
        break;
      case 'PRINTED':
        label = t('postEvent.certStatus.PRINTED');
        colorClass = 'bg-accent-subtle text-accent dark:text-[#FFC46B] border-accent/25 dark:border-accent/40';
        Icon = FileCheck;
        break;
      case 'DELIVERED':
        label = t('postEvent.certStatus.DELIVERED');
        colorClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
        Icon = CheckCircle2;
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border font-medium ${colorClass}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
}
