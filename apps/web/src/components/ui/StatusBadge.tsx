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
import { t, TranslationKey } from '@/lib/i18n';

interface StatusBadgeProps {
  status: string;
  context?: 'requisition' | 'volunteer' | 'benefit' | 'certificate' | 'event' | 'priority';
}

export function StatusBadge({ status, context = 'requisition' }: StatusBadgeProps) {
  let label = status;
  let colorClass = 'bg-gray-100 text-gray-700 border-gray-200';
  let Icon = Clock;

  if (context === 'requisition') {
    switch (status) {
      case 'DRAFT':
        label = t('requisition.status.DRAFT');
        colorClass = 'bg-stone-100 text-stone-700 border-stone-200';
        Icon = Pencil;
        break;
      case 'SUBMITTED':
        label = t('requisition.status.SUBMITTED');
        colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
        Icon = Send;
        break;
      case 'APPROVED':
        label = t('requisition.status.APPROVED');
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = CheckCircle2;
        break;
      case 'REJECTED':
        label = t('requisition.status.REJECTED');
        colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
        Icon = XCircle;
        break;
      case 'IN_PROGRESS':
        label = t('requisition.status.IN_PROGRESS');
        colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
        Icon = Clock;
        break;
      case 'FULFILLED':
        label = t('requisition.status.FULFILLED');
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = CheckSquare;
        break;
      case 'CLOSED':
        label = t('requisition.status.CLOSED');
        colorClass = 'bg-zinc-100 text-zinc-600 border-zinc-200';
        Icon = Lock;
        break;
    }
  } else if (context === 'priority') {
    switch (status) {
      case 'LOW':
        label = t('requisition.priority.LOW');
        colorClass = 'bg-slate-100 text-slate-700 border-slate-200';
        break;
      case 'MEDIUM':
        label = t('requisition.priority.MEDIUM');
        colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
        break;
      case 'HIGH':
        label = t('requisition.priority.HIGH');
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        Icon = AlertTriangle;
        break;
      case 'URGENT':
        label = t('requisition.priority.URGENT');
        colorClass = 'bg-red-50 text-red-700 border-red-200 font-semibold';
        Icon = AlertTriangle;
        break;
    }
  } else if (context === 'volunteer') {
    switch (status) {
      case 'PENDING':
        label = t('volunteers.status.PENDING');
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        Icon = Clock;
        break;
      case 'APPROVED':
        label = t('volunteers.status.APPROVED');
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = CheckCircle2;
        break;
      case 'REJECTED':
        label = t('volunteers.status.REJECTED');
        colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
        Icon = XCircle;
        break;
      case 'CHECKED_IN':
        label = 'Checked-in';
        colorClass = 'bg-teal-50 text-teal-700 border-teal-200';
        Icon = MapPin;
        break;
    }
  } else if (context === 'benefit') {
    switch (status) {
      case 'UNPAID':
        label = t('postEvent.feeStatus.UNPAID');
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        Icon = Wallet;
        break;
      case 'PROCESSING':
        label = t('postEvent.feeStatus.PROCESSING');
        colorClass = 'bg-sky-50 text-sky-700 border-sky-200';
        Icon = Clock;
        break;
      case 'PAID':
        label = t('postEvent.feeStatus.PAID');
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = CheckCircle2;
        break;
    }
  } else if (context === 'certificate') {
    switch (status) {
      case 'NOT_PRINTED':
        label = t('postEvent.certStatus.NOT_PRINTED');
        colorClass = 'bg-zinc-100 text-zinc-700 border-zinc-200';
        Icon = FileText;
        break;
      case 'PRINTED':
        label = t('postEvent.certStatus.PRINTED');
        colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
        Icon = FileCheck;
        break;
      case 'DELIVERED':
        label = t('postEvent.certStatus.DELIVERED');
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        Icon = CheckCircle2;
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border font-medium ${colorClass}`}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span>{label}</span>
    </span>
  );
}
