'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users2,
  ShieldCheck,
  HeartHandshake,
  GitPullRequestDraft,
  Truck,
  Music2,
  BadgeDollarSign,
  PackageOpen,
  CalendarCheck,
  Calendar,
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
  WifiOff,
  BookOpen,
  X,
  CheckCircle2,
  Crown,
  Layers,
  Sliders,
} from 'lucide-react';
import { Actor, RbacGuard } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface SidebarProps {
  orgSlug: string;
  orgName?: string;
  eventId: string;
  actor: Actor;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({
  orgSlug,
  orgName = 'Nusantara Creative',
  eventId,
  actor,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const basePath = `/${orgSlug}/events/${eventId}`;
  const [isOnline, setIsOnline] = useState(true);
  const [isSopModalOpen, setIsSopModalOpen] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const allNavItems = [
    {
      title: 'Daftar Event EO',
      href: `/${orgSlug}/events`,
      icon: Calendar,
      show: true,
    },
    {
      title: t('nav.overview'),
      href: `${basePath}/overview`,
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: t('nav.divisions'),
      href: `${basePath}/divisions`,
      icon: Users2,
      show: RbacGuard.can(actor, 'read', 'division', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.committee'),
      href: `${basePath}/committee`,
      icon: ShieldCheck,
      show: RbacGuard.can(actor, 'read', 'committee', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.volunteers'),
      href: `${basePath}/volunteers`,
      icon: HeartHandshake,
      show: RbacGuard.can(actor, 'read', 'volunteer', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.requisitions'),
      href: `${basePath}/requisitions`,
      icon: GitPullRequestDraft,
      show: RbacGuard.can(actor, 'read', 'requisition', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.vendors'),
      href: `${basePath}/vendors`,
      icon: Truck,
      show: RbacGuard.can(actor, 'read', 'vendor', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.talents'),
      href: `${basePath}/talents`,
      icon: Music2,
      show: RbacGuard.can(actor, 'read', 'talent', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.sponsors'),
      href: `${basePath}/sponsors`,
      icon: BadgeDollarSign,
      show: RbacGuard.can(actor, 'read', 'sponsor', { organizationId: actor.organizationId, eventId }),
    },
  ];

  const phaseNavItems = [
    {
      title: t('nav.preEvent'),
      href: `${basePath}/pre-event`,
      icon: PackageOpen,
      show: RbacGuard.can(actor, 'read', 'logistics', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.dayOf'),
      href: `${basePath}/day-of`,
      icon: CalendarCheck,
      show: RbacGuard.can(actor, 'read', 'consumption', { organizationId: actor.organizationId, eventId }),
    },
    {
      title: t('nav.postEvent'),
      href: `${basePath}/post-event`,
      icon: Award,
      show: RbacGuard.can(actor, 'read', 'benefit', { organizationId: actor.organizationId, eventId }),
    },
  ];

  const navLink = (item: { href: string; title: string; icon: React.ElementType }) => {
    const isActive =
      item.href === `/${orgSlug}/events`
        ? pathname === `/${orgSlug}/events`
        : pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onCloseMobile}
        title={isCollapsed ? item.title : undefined}
        className={`group flex items-center rounded-xl text-xs transition-all duration-200 ${
          isCollapsed ? 'justify-center p-2' : 'justify-between px-2.5 py-2'
        } ${
          isActive
            ? 'bg-[#7A2E33] text-white font-bold shadow-md border border-[#9A383F]'
            : 'text-[#F2E8E9] hover:text-white hover:bg-white/12 font-medium'
        }`}
      >
        <div className={`flex items-center min-w-0 flex-1 ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
              isActive
                ? 'bg-[#451216] text-[#FFC46B] shadow-sm border border-[#FFC46B]/40'
                : 'bg-black/25 text-[#E0CDCF] border border-white/10 group-hover:text-[#FFC46B]'
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          </div>
          {!isCollapsed && (
            <span className="truncate text-[12px] tracking-tight">{item.title}</span>
          )}
        </div>
      </Link>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#5D1F23] select-none rounded-2xl overflow-hidden border border-[#7A2E33]/60 shadow-xl">

      {/* ── Brand Header (logo only) ── */}
      <div className={`border-b border-white/10 p-3.5 bg-black/20 flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
        <div className="w-8 h-8 rounded-xl bg-[#481418] text-[#FFC46B] flex items-center justify-center font-black text-xs tracking-wider shadow-sm border border-[#FFC46B]/40 flex-shrink-0">
          EO
        </div>
        {!isCollapsed && (
          <div className="min-w-0">
            <div className="font-extrabold text-sm text-white tracking-tight leading-none">EventOps</div>
            <div className="text-[11px] text-[#E8D7D8] truncate mt-1">{orgName}</div>
          </div>
        )}
      </div>

      {/* ── Nav List ── */}
      <nav className={`flex-1 overflow-y-auto space-y-1 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {!isCollapsed && (
          <div className="text-[10px] font-extrabold text-[#D4B2B5] uppercase tracking-wider px-2 pt-2 pb-1.5">
            Modul Operasional
          </div>
        )}
        {allNavItems.filter((i) => i.show).map(navLink)}

        {isCollapsed ? (
          <div className="my-2 border-t border-white/10" />
        ) : (
          <div className="pt-4 text-[10px] font-extrabold text-[#D4B2B5] uppercase tracking-wider px-2 pb-1.5">
            Fase Siklus Acara
          </div>
        )}
        {phaseNavItems.filter((i) => i.show).map(navLink)}
      </nav>

      {/* ── Bottom Section — Toggle + Online ── */}
      <div className={`border-t border-white/10 ${isCollapsed ? 'p-3 flex flex-col items-center gap-3' : 'p-3 space-y-3'}`}>

        {/* Info card — click triggers SOP Modal */}
        {!isCollapsed && (
          <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 shadow-inner space-y-2">
            <div>
              <div className="font-bold text-xs text-white">Butuh Bantuan &amp; SOP?</div>
              <div className="text-[11px] text-[#E8D7D8] mt-0.5 leading-snug">Panduan alur operasional &amp; audit trail</div>
            </div>
            <button
              type="button"
              onClick={() => setIsSopModalOpen(true)}
              className="w-full text-center py-2 px-3 rounded-lg bg-[#7A2E33] hover:bg-[#92373F] text-white font-bold text-[10px] tracking-wider shadow-sm uppercase border border-[#FFC46B]/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#FFC46B]" />
              <span>PANDUAN OPERASIONAL</span>
            </button>
          </div>
        )}

        {/* Role badge */}
        {!isCollapsed && (
          <div className="px-1 flex items-center justify-between text-[11px] text-[#E8D7D8] font-medium">
            <span>Otorisasi:</span>
            <span className="font-mono text-[10px] font-bold text-[#FFC46B] bg-black/30 px-2 py-0.5 rounded border border-white/10">
              {actor.eventRole || actor.orgRole}
            </span>
          </div>
        )}

        {/* Online Status */}
        <div
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 border text-[11px] font-semibold transition-all ${
            isCollapsed ? 'justify-center w-full' : 'w-full'
          } ${
            isOnline
              ? 'bg-emerald-950/40 border-emerald-600/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-600/30 text-rose-300'
          }`}
        >
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          {isOnline ? <Wifi className="w-3 h-3 flex-shrink-0" /> : <WifiOff className="w-3 h-3 flex-shrink-0" />}
          {!isCollapsed && <span>{isOnline ? 'Online' : 'Offline'}</span>}
        </div>

        {/* Toggle collapse button */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Tampilkan Menu Lengkap' : 'Sembunyikan Menu'}
            aria-label={isCollapsed ? 'Tampilkan Menu Lengkap' : 'Sembunyikan Menu'}
            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white/70 hover:text-white hover:bg-white/15 border border-white/10 transition-all w-full ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4" />
                <span>Tutup Menu</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop floating inset sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 my-4 ml-4 z-30 transition-all duration-300 rounded-2xl shadow-sm ${
          isCollapsed ? 'w-20' : 'w-[270px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-[270px] max-w-[85vw] h-full shadow-2xl z-10 p-3 animate-fade-in">
            <div className="h-full rounded-2xl shadow-2xl overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal Panduan & SOP Operasional */}
      {isSopModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-border space-y-5 max-h-[85vh] overflow-y-auto text-text">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-accent text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text">Panduan Operasional &amp; SOP EventOps</h3>
                  <p className="text-xs text-text-muted">Alur kerja sistem komando operasional event organizer terpadu</p>
                </div>
              </div>
              <button
                onClick={() => setIsSopModalOpen(false)}
                className="p-1.5 text-text-muted hover:text-text rounded-lg hover:bg-surface-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SOP Content Steps */}
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-2">
                <div className="font-bold text-text text-sm flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>1. Alur Ketua EO (Owner &amp; All-Access)</span>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Ketua EO membeli akun lisensi master utama. Dari menu <strong>Daftar Event EO</strong>, Ketua EO dapat membuat event baru, mengundang anggota (Wakil Ketua, Head Divisi, Staf), serta mengatur <strong>Matriks Hak Akses Modul Menu</strong> per personil.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-2">
                <div className="font-bold text-text text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-500" />
                  <span>2. Alur Divisi &amp; Requisisi Barang</span>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Setiap divisi (Acara, Logistik, Konsumsi, Humas, dll) mengajukan kebutuhan barang &amp; anggaran lewat menu <strong>Requisisi</strong>. Divisi penerima (misal Logistik) memproses pengadaan hingga status <em>Fulfilled &amp; Closed</em>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-2">
                <div className="font-bold text-text text-sm flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-rose-500" />
                  <span>3. Alur Volunteer, Presensi QR, &amp; Konsumsi Hari H</span>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Panitia menerima pendaftaran volunteer, menetapkan shift kerja custom, dan mencetak ID Pas QR. Pada Hari H, scanner QR mencatat presensi dan memvalidasi jatah konsumsi makanan per sesi secara otomatis.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-surface-muted border border-border space-y-2">
                <div className="font-bold text-text text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>4. Pasca-Event &amp; Audit Trail Log</span>
                </div>
                <p className="text-text-muted leading-relaxed">
                  Pasca-event digunakan untuk menerbitkan sertifikat/piagam relawan, pencairan honorarium (benefit disburse), serta melihat rekam jejak audit trail seluruh aktivitas anggota.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsSopModalOpen(false)}
                className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold text-xs rounded-xl shadow-sm"
              >
                Tutup Panduan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
