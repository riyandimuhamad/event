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
  Award,
  PanelLeftClose,
  PanelLeftOpen,
  Wifi,
  WifiOff,
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
    const isActive = pathname.startsWith(item.href);
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

      {/* ── Brand Header (logo only, no toggle button here) ── */}
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

      {/* ── Bottom Section — Toggle + Online (selalu di dalam sidebar) ── */}
      <div className={`border-t border-white/10 ${isCollapsed ? 'p-3 flex flex-col items-center gap-3' : 'p-3 space-y-3'}`}>

        {/* Info card — hanya saat expanded */}
        {!isCollapsed && (
          <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 shadow-inner space-y-2">
            <div>
              <div className="font-bold text-xs text-white">Butuh Bantuan &amp; SOP?</div>
              <div className="text-[11px] text-[#E8D7D8] mt-0.5 leading-snug">Panduan alur operasional &amp; audit trail</div>
            </div>
            <span className="w-full inline-block text-center py-1.5 px-3 rounded-lg bg-[#7A2E33] hover:bg-[#8D353C] text-white font-bold text-[10px] tracking-wider shadow-sm uppercase border border-[#FFC46B]/30 transition-colors">
              PANDUAN OPERASIONAL
            </span>
          </div>
        )}

        {/* Role badge — hanya saat expanded */}
        {!isCollapsed && (
          <div className="px-1 flex items-center justify-between text-[11px] text-[#E8D7D8] font-medium">
            <span>Otorisasi:</span>
            <span className="font-mono text-[10px] font-bold text-[#FFC46B] bg-black/30 px-2 py-0.5 rounded border border-white/10">
              {actor.eventRole || actor.orgRole}
            </span>
          </div>
        )}

        {/* Online Status — selalu tampil */}
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

        {/* Toggle collapse button — selalu di bawah */}
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
    </>
  );
}
