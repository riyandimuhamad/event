'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Users,
  UserCheck,
  UserX,
  Printer,
  Sparkles,
  Shirt,
  Calendar,
  Building,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Pencil,
  Upload,
  FileSpreadsheet,
  Download,
  Check,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Actor } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface VolunteerData {
  id: string;
  code: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  shirtSize: string | null;
  registrationStatus: string;
  divisionId: string | null;
  division: { id: string; name: string; code: string } | null;
  shifts: Array<{
    id: string;
    status: string;
    checkedInAt: string | null;
    shift: { name: string; startsAt: string; endsAt: string };
  }>;
}

interface VolunteersClientProps {
  initialVolunteers: VolunteerData[];
  divisions: Array<{ id: string; name: string; code: string }>;
  actor: Actor;
  orgSlug: string;
  eventId: string;
}

function parseCsv(text: string): { headers: string[]; rows: Array<Record<string, string>> } {
  const lines = text.split(/\r\n|\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseLine = (line: string) => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  const headers = parseLine(lines[0]);
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i]);
    if (values.length === 0 || (values.length === 1 && !values[0])) continue;
    const rowObj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      rowObj[h] = values[idx] || '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}

function autoDetectMapping(headers: string[]) {
  const mapping = {
    fullName: '',
    email: '',
    phone: '',
    shirtSize: '',
    division: '',
  };

  headers.forEach((h) => {
    const lower = h.toLowerCase();
    if (!mapping.fullName && (lower.includes('nama') || lower.includes('name'))) {
      mapping.fullName = h;
    } else if (!mapping.email && lower.includes('email')) {
      mapping.email = h;
    } else if (!mapping.phone && (lower.includes('phone') || lower.includes('hp') || lower.includes('wa') || lower.includes('telepon') || lower.includes('telp'))) {
      mapping.phone = h;
    } else if (!mapping.shirtSize && (lower.includes('kaos') || lower.includes('baju') || lower.includes('shirt') || lower.includes('size'))) {
      mapping.shirtSize = h;
    } else if (!mapping.division && (lower.includes('divisi') || lower.includes('minat') || lower.includes('pilihan') || lower.includes('role') || lower.includes('division'))) {
      mapping.division = h;
    }
  });

  return mapping;
}

export function VolunteersClient({
  initialVolunteers,
  divisions,
  actor,
  orgSlug,
  eventId,
}: VolunteersClientProps) {
  const router = useRouter();
  const [volunteers, setVolunteers] = useState<VolunteerData[]>(initialVolunteers);
  const [search, setSearch] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPresence, setSelectedPresence] = useState<'all' | 'checked_in' | 'not_checked_in'>('all');
  const [selectedVolunteerForIdCard, setSelectedVolunteerForIdCard] = useState<VolunteerData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // New volunteer form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newDivisionId, setNewDivisionId] = useState(divisions[0]?.id || '');
  const [newShirtSize, setNewShirtSize] = useState('L');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit volunteer form state
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerData | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editDivisionId, setEditDivisionId] = useState('');
  const [editShirtSize, setEditShirtSize] = useState('L');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRegistrationStatus, setEditRegistrationStatus] = useState('APPROVED');
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  // Import CSV state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<Array<Record<string, string>>>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState({
    fullName: '',
    email: '',
    phone: '',
    shirtSize: '',
    division: '',
  });
  const [defaultImportStatus, setDefaultImportStatus] = useState<'PENDING' | 'APPROVED'>('PENDING');
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  const openEditModal = (vol: VolunteerData) => {
    setEditingVolunteer(vol);
    setEditFullName(vol.fullName);
    setEditDivisionId(vol.divisionId || '');
    setEditShirtSize(vol.shirtSize || 'L');
    setEditEmail(vol.email || '');
    setEditPhone(vol.phone || '');
    setEditRegistrationStatus(vol.registrationStatus);
    setEditErrorMessage(null);
  };

  const handleCreateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/volunteers?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: newFullName,
          divisionId: newDivisionId || undefined,
          shirtSize: newShirtSize,
          email: newEmail || undefined,
          phone: newPhone || undefined,
          registrationStatus: 'APPROVED',
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal mendaftarkan volunteer');

      setIsCreateModalOpen(false);
      setNewFullName('');
      setNewEmail('');
      setNewPhone('');
      router.refresh();

      const newVol: VolunteerData = {
        ...json.data,
        shifts: [],
        division: divisions.find((d) => d.id === newDivisionId) || null,
      };
      setVolunteers((prev) => [newVol, ...prev]);
    } catch (err: unknown) {
      setErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateVolunteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVolunteer) return;
    setIsEditingSubmitting(true);
    setEditErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/volunteers/${editingVolunteer.id}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: editFullName,
          divisionId: editDivisionId || null,
          shirtSize: editShirtSize,
          email: editEmail || null,
          phone: editPhone || null,
          registrationStatus: editRegistrationStatus,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal mengubah data volunteer');

      setEditingVolunteer(null);
      router.refresh();

      const updatedVol: VolunteerData = {
        ...editingVolunteer,
        fullName: editFullName,
        divisionId: editDivisionId || null,
        division: divisions.find((d) => d.id === editDivisionId) || null,
        shirtSize: editShirtSize,
        email: editEmail || null,
        phone: editPhone || null,
        registrationStatus: editRegistrationStatus,
      };
      setVolunteers((prev) => prev.map((v) => (v.id === editingVolunteer.id ? updatedVol : v)));
    } catch (err: unknown) {
      setEditErrorMessage((err as Error).message);
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  const handleDeleteVolunteer = async (volunteerId: string, fullName: string) => {
    if (!confirm(`Hapus volunteer ${fullName}?`)) return;

    try {
      const res = await fetch(`/api/v1/volunteers/${volunteerId}?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal menghapus volunteer');

      setVolunteers((prev) => prev.filter((v) => v.id !== volunteerId));
      router.refresh();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  // CSV Import File Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    setImportError(null);
    setImportSuccessCount(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        const { headers: parsedHeaders, rows } = parseCsv(text);
        setHeaders(parsedHeaders);
        setParsedRows(rows);
        setColumnMapping(autoDetectMapping(parsedHeaders));
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRows.length === 0 || !columnMapping.fullName) {
      setImportError('Mohon pilih kolom CSV yang dipetakan sebagai Nama Lengkap');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const volunteersToImport = parsedRows
        .map((row) => {
          const fullName = row[columnMapping.fullName] || '';
          const email = columnMapping.email ? row[columnMapping.email] : undefined;
          const phone = columnMapping.phone ? row[columnMapping.phone] : undefined;
          const shirtSize = columnMapping.shirtSize ? row[columnMapping.shirtSize] : undefined;

          let divisionId: string | undefined = undefined;
          if (columnMapping.division && row[columnMapping.division]) {
            const divText = row[columnMapping.division].toLowerCase();
            const matchedDiv = divisions.find(
              (d) =>
                d.name.toLowerCase().includes(divText) ||
                divText.includes(d.name.toLowerCase()) ||
                d.code.toLowerCase() === divText
            );
            if (matchedDiv) divisionId = matchedDiv.id;
          }

          return {
            fullName,
            email: email || undefined,
            phone: phone || undefined,
            shirtSize: shirtSize || 'L',
            divisionId,
            registrationStatus: defaultImportStatus,
          };
        })
        .filter((v) => v.fullName.trim().length > 0);

      if (volunteersToImport.length === 0) {
        throw new Error('Tidak ada baris data volunteer yang memiliki nama valid');
      }

      const res = await fetch(`/api/v1/volunteers/import?orgSlug=${orgSlug}&eventId=${eventId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ volunteers: volunteersToImport }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal mengimpor volunteer');

      const importedList = json.data?.volunteers || [];
      setImportSuccessCount(importedList.length || volunteersToImport.length);
      router.refresh();

      if (importedList.length > 0) {
        const formattedNewVolunteers: VolunteerData[] = importedList.map((v: any) => ({
          ...v,
          shifts: [],
          division: divisions.find((d) => d.id === v.divisionId) || null,
        }));
        setVolunteers((prev) => [...formattedNewVolunteers, ...prev]);
      }

      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvFileName('');
        setParsedRows([]);
        setHeaders([]);
        setImportSuccessCount(null);
      }, 1500);
    } catch (err: unknown) {
      setImportError((err as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const templateContent =
      'Nama Lengkap,Alamat Email,Nomor WhatsApp,Ukuran Kaos,Divisi Minat\nBudi Santoso,budi@example.com,08123456789,L,Logistik\nSiti Rahma,siti@example.com,08987654321,M,Acara';
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_import_volunteer_eventops.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistics calculation
  const totalVolunteers = volunteers.length;
  const approvedCount = volunteers.filter((v) => v.registrationStatus === 'APPROVED').length;
  const pendingCount = volunteers.filter((v) => v.registrationStatus === 'PENDING').length;
  const checkedInCount = volunteers.filter((v) =>
    v.shifts.some((s) => s.checkedInAt !== null)
  ).length;

  const filtered = volunteers.filter((v) => {
    if (selectedDivision !== 'all' && v.divisionId !== selectedDivision) return false;
    if (selectedStatus !== 'all' && v.registrationStatus !== selectedStatus) return false;

    const isCheckedIn = v.shifts.some((s) => s.checkedInAt !== null);
    if (selectedPresence === 'checked_in' && !isCheckedIn) return false;
    if (selectedPresence === 'not_checked_in' && isCheckedIn) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = v.fullName.toLowerCase().includes(q);
      const matchCode = v.code.toLowerCase().includes(q);
      const matchEmail = v.email ? v.email.toLowerCase().includes(q) : false;
      if (!matchName && !matchCode && !matchEmail) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (volunteerId: string, status: string) => {
    setIsUpdating(true);
    try {
      const res = await fetch(
        `/api/v1/volunteers/${volunteerId}/status?orgSlug=${orgSlug}&eventId=${eventId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) {
        const json = await res.json();
        alert(json.error?.message || 'Gagal mengubah status volunteer');
        return;
      }

      setVolunteers((prev) =>
        prev.map((v) => (v.id === volunteerId ? { ...v, registrationStatus: status } : v))
      );

      router.refresh();
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setIsUpdating(false);
    }
  };

  const isManagerOrOwner = actor.orgRole === 'OWNER' || actor.eventRole === 'EVENT_MANAGER';

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] gap-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            {t('volunteers.title')}
          </h1>
          <p className="text-text-muted text-sm mt-0.5">
            {t('volunteers.subtitle')}
          </p>
        </div>

        {isManagerOrOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-surface hover:bg-surface-muted border border-border text-text text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Import CSV / GForm</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Volunteer Baru</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-surface shadow-sm">
          <div className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-text-subtle" /> Total Volunteer Terdaftar
          </div>
          <div className="text-2xl font-bold text-text mt-1">
            {totalVolunteers}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-300/40 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" /> Diterima (Approved)
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300 mt-1">
            {approvedCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-300/40 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Menunggu Seleksi
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-300 mt-1">
            {pendingCount}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-accent/25 bg-accent-subtle shadow-sm">
          <div className="text-xs font-semibold text-accent dark:text-[#FFC46B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Hadir / Check-in Hari H
          </div>
          <div className="text-2xl font-bold text-accent dark:text-[#FFC46B] mt-1">
            {checkedInCount}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface border border-border rounded-xl px-4 py-3 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between flex-shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari nama volunteer atau kode VOL-XXXX..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl border border-border pl-9 pr-3 py-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="text-xs rounded-xl border border-border px-3 py-2 bg-surface font-medium text-text"
          >
            <option value="all">Semua Divisi</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs rounded-xl border border-border px-3 py-2 bg-surface font-medium text-text"
          >
            <option value="all">Semua Status</option>
            <option value="APPROVED">Diterima (APPROVED)</option>
            <option value="PENDING">Menunggu (PENDING)</option>
            <option value="REJECTED">Ditolak (REJECTED)</option>
          </select>

          <select
            value={selectedPresence}
            onChange={(e) => setSelectedPresence(e.target.value as any)}
            className="text-xs rounded-xl border border-border px-3 py-2 bg-surface font-medium text-text"
          >
            <option value="all">Semua Presensi</option>
            <option value="checked_in">Sudah Check-in</option>
            <option value="not_checked_in">Belum Check-in</option>
          </select>
        </div>
      </div>

      {/* Desktop Table — scrollable area only */}
      <div className="flex-1 min-h-0 hidden lg:block bg-surface border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto h-full">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3.5">Volunteer & Kode ID</th>
                <th className="px-6 py-3.5">Divisi Penempatan</th>
                <th className="px-6 py-3.5">Ukuran Kaos</th>
                <th className="px-6 py-3.5">Shift & Presensi</th>
                <th className="px-6 py-3.5">Status Pendaftaran</th>
                <th className="px-6 py-3.5 text-right">Aksi & ID Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((vol) => {
                const isDivHead =
                  actor.eventRole === 'DIVISION_HEAD' && actor.divisionId === vol.divisionId;
                const canApprove = isManagerOrOwner || isDivHead;
                const checkedIn = vol.shifts.some((s) => s.checkedInAt !== null);

                return (
                  <tr key={vol.id} className="hover:bg-surface-muted/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedVolunteerForIdCard(vol)}
                          title="Klik untuk lihat ID Card"
                          className="w-9 h-9 rounded-xl bg-accent-subtle text-accent dark:text-[#FFC46B] flex items-center justify-center font-mono font-bold text-xs border border-accent/25 hover:scale-105 transition-transform"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <div>
                          <div className="font-semibold text-text">
                            {vol.fullName}
                          </div>
                          <div className="font-mono text-xs text-text-muted tabular-nums">
                            {vol.code}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-surface-muted text-xs font-medium text-text">
                        {vol.division?.name || 'Belum Ditentukan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-text bg-surface-muted px-2 py-0.5 rounded border border-border">
                        {vol.shirtSize || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {vol.shifts.length > 0 ? (
                          <div className="text-xs font-medium text-text">
                            {vol.shifts[0].shift.name}
                          </div>
                        ) : (
                          <div className="text-[11px] text-text-muted italic">
                            Tanpa Shift
                          </div>
                        )}
                        {checkedIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Sudah Check-in
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3" /> Belum Check-in
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={vol.registrationStatus} context="volunteer" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedVolunteerForIdCard(vol)}
                          className="px-2.5 py-1 text-xs font-semibold text-accent dark:text-[#FFC46B] hover:bg-accent-subtle rounded-lg border border-accent/25 transition-colors"
                        >
                          Lihat ID Pas
                        </button>

                        {vol.registrationStatus === 'PENDING' && canApprove && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(vol.id, 'APPROVED')}
                              disabled={isUpdating}
                              title="Terima Volunteer"
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(vol.id, 'REJECTED')}
                              disabled={isUpdating}
                              title="Tolak Volunteer"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {isManagerOrOwner && (
                          <>
                            <button
                              onClick={() => openEditModal(vol)}
                              title="Edit Data Volunteer"
                              className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent-subtle transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteVolunteer(vol.id, vol.fullName)}
                              title="Hapus Volunteer"
                              className="p-1.5 rounded-lg text-text-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile & Tablet Card Layout */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filtered.map((vol) => {
          const isDivHead =
            actor.eventRole === 'DIVISION_HEAD' && actor.divisionId === vol.divisionId;
          const canApprove = isManagerOrOwner || isDivHead;
          const checkedIn = vol.shifts.some((s) => s.checkedInAt !== null);

          return (
            <div
              key={vol.id}
              className="bg-surface border border-border rounded-xl p-4 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-bold text-text">{vol.fullName}</div>
                  <div className="font-mono text-xs text-text-muted tabular-nums">{vol.code}</div>
                </div>
                <StatusBadge status={vol.registrationStatus} context="volunteer" />
              </div>

              <div className="text-xs space-y-1 pt-2 border-t border-border text-text-muted">
                <div>
                  <span className="font-semibold text-text">Divisi:</span>{' '}
                  {vol.division?.name || 'Belum Ditentukan'}
                </div>
                <div>
                  <span className="font-semibold text-text">Kaos:</span> {vol.shirtSize || '-'}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <button
                  onClick={() => setSelectedVolunteerForIdCard(vol)}
                  className="px-2.5 py-1 text-xs font-semibold text-accent border border-accent/30 rounded-lg"
                >
                  ID Pas
                </button>

                <div className="flex items-center gap-1.5">
                  {vol.registrationStatus === 'PENDING' && canApprove && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(vol.id, 'APPROVED')}
                        className="px-2.5 py-1 text-xs bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Terima
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(vol.id, 'REJECTED')}
                        className="px-2.5 py-1 text-xs bg-rose-50 text-rose-700 rounded-lg border border-rose-200 flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Tolak
                      </button>
                    </>
                  )}

                  {isManagerOrOwner && (
                    <>
                      <button
                        onClick={() => openEditModal(vol)}
                        title="Edit Data Volunteer"
                        className="p-1.5 text-text-muted hover:text-accent hover:bg-accent-subtle rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteVolunteer(vol.id, vol.fullName)}
                        title="Hapus Volunteer"
                        className="p-1.5 text-text-muted hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Volunteer Official ID Card / Lanyard Modal */}
      {selectedVolunteerForIdCard && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-sm w-full p-6 shadow-2xl border-2 border-accent/30 space-y-5 text-center relative overflow-hidden">
            <div className="w-12 h-3.5 bg-surface-muted rounded-full mx-auto border border-border mb-2" />

            <div className="space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-widest text-[#FFC46B] bg-[#2A1411] px-3 py-1 rounded-full inline-block border border-accent/30">
                Official Staff & Volunteer Pass
              </div>
              <h3 className="text-lg font-extrabold text-text">
                EventOps Management
              </h3>
            </div>

            <div className="py-2">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#7A2E33] to-[#4A171B] text-[#FFC46B] font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md border border-[#7A2E33]/50">
                {selectedVolunteerForIdCard.fullName.slice(0, 2).toUpperCase()}
              </div>
              <h4 className="text-base font-bold text-text mt-3">
                {selectedVolunteerForIdCard.fullName}
              </h4>
              <div className="font-mono text-xs font-semibold text-text-muted mt-0.5">
                {selectedVolunteerForIdCard.code}
              </div>
            </div>

            <div className="bg-surface-muted rounded-2xl p-3 border border-border text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Divisi:</span>
                <span className="font-bold text-accent dark:text-[#FFC46B]">
                  {selectedVolunteerForIdCard.division?.name || 'Umum'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Ukuran Kaos:</span>
                <span className="font-mono font-bold text-text">
                  {selectedVolunteerForIdCard.shirtSize || 'L'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Status Validasi:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Terverifikasi Resmi</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-border inline-block shadow-inner">
              <div className="w-32 h-32 flex flex-col items-center justify-center bg-[#1B0E0D] rounded-xl text-white p-2">
                <QrCode className="w-20 h-20 text-[#FFC46B]" />
                <span className="font-mono text-[9px] mt-1 text-zinc-300">
                  {selectedVolunteerForIdCard.code}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2 border-t border-border">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-accent/20"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak ID Card</span>
              </button>
              <button
                onClick={() => setSelectedVolunteerForIdCard(null)}
                className="px-4 py-2 bg-surface-muted hover:bg-border text-text text-xs font-semibold rounded-xl border border-border"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Data Volunteer */}
      {editingVolunteer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Pencil className="w-4 h-4 text-accent" />
                <h3 className="text-base font-bold text-text">
                  Edit Data Volunteer ({editingVolunteer.code})
                </h3>
              </div>
              <button
                onClick={() => setEditingVolunteer(null)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleUpdateVolunteer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Divisi Penugasan</label>
                <select
                  value={editDivisionId}
                  onChange={(e) => setEditDivisionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                >
                  <option value="">-- Tanpa Divisi (Umum) --</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Ukuran Kaos</label>
                  <select
                    value={editShirtSize}
                    onChange={(e) => setEditShirtSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((s) => (
                      <option key={s} value={s}>
                        Size {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Status Pendaftaran</label>
                  <select
                    value={editRegistrationStatus}
                    onChange={(e) => setEditRegistrationStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  >
                    <option value="APPROVED">Diterima (APPROVED)</option>
                    <option value="PENDING">Menunggu (PENDING)</option>
                    <option value="REJECTED">Ditolak (REJECTED)</option>
                    <option value="WITHDRAWN">Mengundurkan Diri (WITHDRAWN)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">No. HP / WA</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingVolunteer(null)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditingSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isEditingSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Volunteer Baru Manual */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Tambah Volunteer Baru</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateVolunteer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Lengkap Volunteer *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Farhan Nugraha"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Divisi Penugasan</label>
                <select
                  value={newDivisionId}
                  onChange={(e) => setNewDivisionId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                >
                  <option value="">-- Tanpa Divisi (Umum) --</option>
                  {divisions.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Ukuran Kaos</label>
                  <select
                    value={newShirtSize}
                    onChange={(e) => setNewShirtSize(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((s) => (
                      <option key={s} value={s}>
                        Size {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">No. Handphone / WA</label>
                  <input
                    type="tel"
                    placeholder="08123456789"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Email</label>
                <input
                  type="email"
                  placeholder="volunteer@eventops.local"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Volunteer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import CSV / Google Form */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-text">Import Volunteer via CSV / Google Form</h3>
                  <p className="text-xs text-text-muted">
                    Unggah file CSV hasil ekspor spreadsheet pendaftaran Google Form
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            {importSuccessCount !== null && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 flex-shrink-0" />
                <span>Berhasil mengimpor {importSuccessCount} data volunteer!</span>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Template Download & File Picker */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-muted border border-border">
                <div>
                  <div className="font-semibold text-text">Format File CSV</div>
                  <p className="text-text-muted mt-0.5">
                    Gunakan file CSV ekspor Google Form atau download template kami.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 bg-surface hover:bg-border text-text border border-border rounded-lg flex items-center gap-1.5 font-medium shrink-0"
                >
                  <Download className="w-3.5 h-3.5 text-accent" />
                  <span>Download Template</span>
                </button>
              </div>

              {/* Upload Input */}
              <div>
                <label className="block font-semibold text-text mb-1">Pilih File CSV (.csv)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-text file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-accent-subtle file:text-accent hover:file:bg-accent/20 border border-border rounded-xl p-1 bg-surface-muted"
                  />
                </div>
                {csvFileName && (
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                    File terpilih: {csvFileName} ({parsedRows.length} baris data ditemukan)
                  </div>
                )}
              </div>

              {/* Column Mapping Section if file is loaded */}
              {headers.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="font-bold text-text text-xs flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Pemetaan Kolom CSV → Field Sistem</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-muted p-3.5 rounded-xl border border-border">
                    <div>
                      <label className="block font-medium text-text mb-1">Nama Lengkap *</label>
                      <select
                        value={columnMapping.fullName}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text font-medium"
                      >
                        <option value="">-- Pilih Kolom CSV --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-text mb-1">Alamat Email</label>
                      <select
                        value={columnMapping.email}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, email: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text font-medium"
                      >
                        <option value="">-- Abaikan / Tidak Ada --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-text mb-1">No. HP / WA</label>
                      <select
                        value={columnMapping.phone}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, phone: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text font-medium"
                      >
                        <option value="">-- Abaikan / Tidak Ada --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-medium text-text mb-1">Ukuran Kaos</label>
                      <select
                        value={columnMapping.shirtSize}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, shirtSize: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text font-medium"
                      >
                        <option value="">-- Abaikan / Tidak Ada --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-medium text-text mb-1">Divisi Minat / Penugasan</label>
                      <select
                        value={columnMapping.division}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({ ...prev, division: e.target.value }))
                        }
                        className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-border text-text font-medium"
                      >
                        <option value="">-- Abaikan / Tidak Ada --</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-text-muted mt-1">
                        Sistem akan otomatis mencocokkan teks divisi dari CSV dengan nama divisi yang ada di event ini.
                      </p>
                    </div>
                  </div>

                  {/* Status Default Option */}
                  <div>
                    <label className="block font-semibold text-text mb-1">Status Pendaftaran Hasil Import</label>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importStatus"
                          value="PENDING"
                          checked={defaultImportStatus === 'PENDING'}
                          onChange={() => setDefaultImportStatus('PENDING')}
                          className="accent-accent"
                        />
                        <span className="text-amber-700 dark:text-amber-400 font-semibold">
                          PENDING (Perlu Seleksi Panitia)
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="importStatus"
                          value="APPROVED"
                          checked={defaultImportStatus === 'APPROVED'}
                          onChange={() => setDefaultImportStatus('APPROVED')}
                          className="accent-accent"
                        />
                        <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                          APPROVED (Langsung Diterima)
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Preview Table */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="font-semibold text-text text-[11px] flex justify-between">
                        <span>Pratinjau Data (5 Baris Pertama):</span>
                        <span className="text-text-muted">{parsedRows.length} total baris</span>
                      </div>
                      <div className="border border-border rounded-xl overflow-hidden bg-surface">
                        <table className="w-full text-[11px] text-left">
                          <thead className="bg-surface-muted text-text-muted border-b border-border">
                            <tr>
                              <th className="p-2">Nama</th>
                              <th className="p-2">Email</th>
                              <th className="p-2">No. HP</th>
                              <th className="p-2">Kaos</th>
                              <th className="p-2">Divisi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {parsedRows.slice(0, 5).map((r, i) => (
                              <tr key={i}>
                                <td className="p-2 font-semibold text-text">
                                  {columnMapping.fullName ? r[columnMapping.fullName] || '-' : '-'}
                                </td>
                                <td className="p-2 text-text-muted">
                                  {columnMapping.email ? r[columnMapping.email] || '-' : '-'}
                                </td>
                                <td className="p-2 text-text-muted">
                                  {columnMapping.phone ? r[columnMapping.phone] || '-' : '-'}
                                </td>
                                <td className="p-2 text-text-muted">
                                  {columnMapping.shirtSize ? r[columnMapping.shirtSize] || '-' : '-'}
                                </td>
                                <td className="p-2 text-text-muted">
                                  {columnMapping.division ? r[columnMapping.division] || '-' : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={isImporting || parsedRows.length === 0 || !columnMapping.fullName}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isImporting ? 'Mengimpor...' : `Impor ${parsedRows.length} Volunteer`}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
