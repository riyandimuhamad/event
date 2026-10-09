'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Pencil,
  X,
  AlertCircle,
  Building,
  CheckCircle2,
  HeartHandshake,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { Actor } from '@eventops/shared';

export interface EventData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  venueName: string | null;
  venueAddress: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  currentPhase: string;
  expectedAttendees: number | null;
  divisionsCount: number;
  volunteersCount: number;
  committeeCount: number;
  shiftsCount: number;
}

interface EventsClientProps {
  initialEvents: EventData[];
  actor: Actor;
  orgSlug: string;
  orgName: string;
}

export function EventsClient({
  initialEvents,
  actor,
  orgSlug,
  orgName,
}: EventsClientProps) {
  const router = useRouter();
  const [events, setEvents] = useState<EventData[]>(initialEvents);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [phaseFilter, setPhaseFilter] = useState('all');

  // Modal create event state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueAddress, setNewVenueAddress] = useState('');
  const [newStartsAt, setNewStartsAt] = useState('');
  const [newEndsAt, setNewEndsAt] = useState('');
  const [newAttendees, setNewAttendees] = useState('1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);

  // Modal edit event state
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editVenueName, setEditVenueName] = useState('');
  const [editVenueAddress, setEditVenueAddress] = useState('');
  const [editStartsAt, setEditStartsAt] = useState('');
  const [editEndsAt, setEditEndsAt] = useState('');
  const [editStatus, setEditStatus] = useState('ACTIVE');
  const [editPhase, setEditPhase] = useState('PRE_EVENT');
  const [editAttendees, setEditAttendees] = useState('');
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState<string | null>(null);

  const isOwnerOrAdmin = actor.orgRole === 'OWNER' || actor.orgRole === 'ADMIN';

  const openEditModal = (ev: EventData) => {
    setEditingEvent(ev);
    setEditName(ev.name);
    setEditDescription(ev.description || '');
    setEditVenueName(ev.venueName || '');
    setEditVenueAddress(ev.venueAddress || '');
    setEditStartsAt(ev.startsAt.slice(0, 16));
    setEditEndsAt(ev.endsAt.slice(0, 16));
    setEditStatus(ev.status);
    setEditPhase(ev.currentPhase);
    setEditAttendees(ev.expectedAttendees ? ev.expectedAttendees.toString() : '');
    setEditErrorMessage(null);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setCreateErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/events?orgSlug=${orgSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          slug: newSlug || undefined,
          description: newDescription || undefined,
          venueName: newVenueName || undefined,
          venueAddress: newVenueAddress || undefined,
          startsAt: newStartsAt,
          endsAt: newEndsAt,
          expectedAttendees: newAttendees ? Number(newAttendees) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal membuat event baru');

      setIsCreateModalOpen(false);
      setNewName('');
      setNewSlug('');
      setNewDescription('');
      setNewVenueName('');
      setNewVenueAddress('');
      router.refresh();

      const createdEv: EventData = {
        id: json.data.id,
        name: json.data.name,
        slug: json.data.slug,
        description: json.data.description,
        venueName: json.data.venueName,
        venueAddress: json.data.venueAddress,
        startsAt: json.data.startsAt,
        endsAt: json.data.endsAt,
        status: json.data.status,
        currentPhase: json.data.currentPhase,
        expectedAttendees: json.data.expectedAttendees,
        divisionsCount: json.data.divisions?.length || 0,
        volunteersCount: json.data.volunteers?.length || 0,
        committeeCount: json.data.committeeMembers?.length || 0,
        shiftsCount: json.data.shifts?.length || 0,
      };

      setEvents((prev) => [createdEv, ...prev]);
    } catch (err: unknown) {
      setCreateErrorMessage((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setIsEditSubmitting(true);
    setEditErrorMessage(null);

    try {
      const res = await fetch(`/api/v1/events/${editingEvent.id}?orgSlug=${orgSlug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          description: editDescription || undefined,
          venueName: editVenueName || undefined,
          venueAddress: editVenueAddress || undefined,
          startsAt: editStartsAt,
          endsAt: editEndsAt,
          status: editStatus,
          currentPhase: editPhase,
          expectedAttendees: editAttendees ? Number(editAttendees) : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || 'Gagal mengedit event');

      setEditingEvent(null);
      router.refresh();

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === editingEvent.id
            ? {
                ...ev,
                name: editName,
                description: editDescription || null,
                venueName: editVenueName || null,
                venueAddress: editVenueAddress || null,
                startsAt: editStartsAt,
                endsAt: editEndsAt,
                status: editStatus,
                currentPhase: editPhase,
                expectedAttendees: editAttendees ? Number(editAttendees) : null,
              }
            : ev
        )
      );
    } catch (err: unknown) {
      setEditErrorMessage((err as Error).message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Filtered list
  const filteredEvents = events.filter((ev) => {
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
    if (phaseFilter !== 'all' && ev.currentPhase !== phaseFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = ev.name.toLowerCase().includes(q);
      const matchVenue = ev.venueName ? ev.venueName.toLowerCase().includes(q) : false;
      if (!matchName && !matchVenue) return false;
    }
    return true;
  });

  const totalEvents = events.length;
  const activeEvents = events.filter((e) => e.status === 'ACTIVE').length;
  const totalAttendees = events.reduce((acc, e) => acc + (e.expectedAttendees || 0), 0);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface border border-border p-6 rounded-3xl shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-accent dark:text-[#FFC46B] uppercase tracking-wider">
            <Building className="w-4 h-4" />
            <span>{orgName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text">
            Manajemen Event EO
          </h1>
          <p className="text-text-muted text-xs sm:text-sm">
            Kelola seluruh portofolio event, divisi, tim panitia, dan operasional hari H dalam satu sistem terpadu.
          </p>
        </div>

        {isOwnerOrAdmin && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-accent/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Event Baru</span>
          </button>
        )}
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-sm space-y-1">
          <div className="text-xs font-medium text-text-muted flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-accent" /> Total Event EO
          </div>
          <div className="text-2xl font-bold text-text">{totalEvents}</div>
        </div>

        <div className="p-4 rounded-2xl border border-emerald-300/40 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Event Aktif
          </div>
          <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">{activeEvents}</div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-300/40 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Target Peserta / Attendees
          </div>
          <div className="text-2xl font-bold text-amber-900 dark:text-amber-300">
            {totalAttendees.toLocaleString('id-ID')}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-accent/25 bg-accent-subtle shadow-sm space-y-1">
          <div className="text-xs font-semibold text-accent dark:text-[#FFC46B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Akses Lisensi EO
          </div>
          <div className="text-sm font-bold text-accent dark:text-[#FFC46B]">
            {actor.orgRole === 'OWNER' ? 'Ketua EO (All Access)' : 'Manajer Operasional'}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-surface border border-border rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Cari nama event atau lokasi venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs rounded-xl border border-border pl-9 pr-3 py-2.5 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs rounded-xl border border-border px-3 py-2.5 bg-surface font-medium text-text"
          >
            <option value="all">Semua Status</option>
            <option value="ACTIVE">Aktif (ACTIVE)</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Diarsipkan (ARCHIVED)</option>
          </select>

          <select
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            className="text-xs rounded-xl border border-border px-3 py-2.5 bg-surface font-medium text-text"
          >
            <option value="all">Semua Fase</option>
            <option value="PRE_EVENT">Pra-Event (Logistik)</option>
            <option value="DAY_OF">Hari H (Operasional)</option>
            <option value="POST_EVENT">Pasca-Event (Benefit)</option>
          </select>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.map((ev) => {
          const startDateStr = new Date(ev.startsAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          const endDateStr = new Date(ev.endsAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              key={ev.id}
              className="bg-surface border border-border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Status & Phase Badges */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    {ev.status}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-accent-subtle text-accent dark:text-[#FFC46B] border border-accent/20">
                    {ev.currentPhase === 'PRE_EVENT'
                      ? 'Pra-Event'
                      : ev.currentPhase === 'DAY_OF'
                      ? 'Hari H'
                      : 'Pasca-Event'}
                  </span>
                </div>

                {/* Event Title & Description */}
                <div>
                  <h3 className="text-lg font-bold text-text group-hover:text-accent transition-colors">
                    {ev.name}
                  </h3>
                  <p className="text-xs text-text-muted line-clamp-2 mt-1">
                    {ev.description || 'Tidak ada deskripsi event.'}
                  </p>
                </div>

                {/* Location & Dates */}
                <div className="space-y-1.5 text-xs text-text-muted pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                    <span>
                      {startDateStr} - {endDateStr}
                    </span>
                  </div>
                  {ev.venueName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                      <span className="truncate">{ev.venueName}</span>
                    </div>
                  )}
                </div>

                {/* Metrics Stats */}
                <div className="grid grid-cols-3 gap-2 bg-surface-muted p-2.5 rounded-2xl border border-border text-center text-xs">
                  <div>
                    <div className="text-[10px] text-text-muted font-medium">Divisi</div>
                    <div className="font-bold text-text mt-0.5">{ev.divisionsCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted font-medium">Panitia</div>
                    <div className="font-bold text-text mt-0.5">{ev.committeeCount}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-text-muted font-medium">Volunteer</div>
                    <div className="font-bold text-accent dark:text-[#FFC46B] mt-0.5">
                      {ev.volunteersCount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                {isOwnerOrAdmin && (
                  <button
                    onClick={() => openEditModal(ev)}
                    className="p-2 text-text-muted hover:text-accent hover:bg-surface-muted rounded-xl border border-border transition-colors text-xs font-semibold flex items-center gap-1.5"
                    title="Rincian & Edit Event"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                <Link
                  href={`/${orgSlug}/events/${ev.id}/overview`}
                  className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all ml-auto"
                >
                  <span>Kelola Event</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Buat Event Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Buat Event EO Baru</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-text-muted hover:text-text p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createErrorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{createErrorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Event *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Concert Music Fest 2026"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Deskripsi Event</label>
                <textarea
                  rows={2}
                  placeholder="Deskripsi singkat mengenai event ini..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Nama Lokasi / Venue</label>
                  <input
                    type="text"
                    placeholder="Contoh: GBK Senayan"
                    value={newVenueName}
                    onChange={(e) => setNewVenueName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Target Peserta</label>
                  <input
                    type="number"
                    placeholder="1000"
                    value={newAttendees}
                    onChange={(e) => setNewAttendees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Tanggal & Waktu Mulai *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newStartsAt}
                    onChange={(e) => setNewStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Tanggal & Waktu Selesai *</label>
                  <input
                    type="datetime-local"
                    required
                    value={newEndsAt}
                    onChange={(e) => setNewEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
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
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Membuat Event...' : 'Buat Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit & Rincian Event */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-text">Rincian & Pengaturan Event</h3>
              <button
                onClick={() => setEditingEvent(null)}
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

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text mb-1">Nama Event *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-semibold text-text mb-1">Deskripsi Event</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Status Event</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  >
                    <option value="ACTIVE">ACTIVE (Aktif Berjalan)</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED (Diarsipkan)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Fase Siklus Acara</label>
                  <select
                    value={editPhase}
                    onChange={(e) => setEditPhase(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  >
                    <option value="PRE_EVENT">Pra-Event (Logistik)</option>
                    <option value="DAY_OF">Hari H (Operasional)</option>
                    <option value="POST_EVENT">Pasca-Event (Benefit)</option>
                    <option value="CLOSED">Selesai (Closed)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Nama Venue</label>
                  <input
                    type="text"
                    value={editVenueName}
                    onChange={(e) => setEditVenueName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Target Peserta</label>
                  <input
                    type="number"
                    value={editAttendees}
                    onChange={(e) => setEditAttendees(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text mb-1">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    value={editStartsAt}
                    onChange={(e) => setEditStartsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text mb-1">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    value={editEndsAt}
                    onChange={(e) => setEditEndsAt(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-muted border border-border text-text focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 bg-surface-muted hover:bg-border text-text font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isEditSubmitting}
                  className="px-5 py-2 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl disabled:opacity-50"
                >
                  {isEditSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
