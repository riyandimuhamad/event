'use client';

import React from 'react';
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

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface select-none rounded-2xl overflow-hidden">
      {/* Brand Header */}
      <div className={`border-b border-border/80 ${
        isCollapsed ? 'p-3 flex justify-center' : 'p-4 flex items-center justify-between'
      }`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7A2E33] to-[#4A171B] text-[#FFC46B] flex items-center justify-center font-black text-xs tracking-wider shadow-md shadow-accent/20 border border-[#7A2E33]/50 flex-shrink-0">
                EO
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-text tracking-tight leading-none">
                  EventOps
                </div>
                <div className="text-[11px] text-text-muted truncate mt-1">
                  {orgName}
                </div>
              </div>
            </div>

            {/* Collapse/Hide Button */}
            <button
              onClick={onToggleCollapse}
              type="button"
              title="Sembunyikan navigasi (Ctrl+B)"
              aria-label="Sembunyikan navigasi"
              className="p-1.5 rounded-xl text-text-subtle hover:text-text hover:bg-surface-muted transition-colors flex-shrink-0"
            >
              <PanelLeftClose className="w-4 h-4 stroke-[1.75]" />
            </button>
          </>
        ) : (
          /* Collapsed View Header */
          <button
            onClick={onToggleCollapse}
            type="button"
            title="Buka navigasi (Ctrl+B)"
            aria-label="Buka navigasi"
            className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7A2E33] to-[#4A171B] text-[#FFC46B] flex items-center justify-center font-black text-xs shadow-md shadow-accent/20 border border-[#7A2E33]/50"
          >
            <PanelLeftOpen className="w-4 h-4 stroke-[2]" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className={`flex-1 overflow-y-auto space-y-1 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {!isCollapsed && (
          <div className="text-[10px] font-extrabold text-text-subtle uppercase tracking-wider px-2 pt-2 pb-1.5">
            Modul Operasional
          </div>
        )}

        {allNavItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.title : undefined}
                className={`group flex items-center rounded-xl text-xs transition-all duration-200 ${
                  isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-surface text-text font-bold shadow-md border border-border/80'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted/60 font-medium'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-tr from-[#7A2E33] to-[#4A171B] text-[#FFC46B] shadow-md shadow-accent/25 border border-[#7A2E33]/50'
                        : 'bg-surface text-text-muted border border-border/80 shadow-xs group-hover:text-text group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </div>
              </Link>
            );
          })}

        {isCollapsed ? (
          <div className="my-2 border-t border-border" />
        ) : (
          <div className="pt-4 text-[10px] font-extrabold text-text-subtle uppercase tracking-wider px-2 pb-1.5">
            Fase Siklus Acara
          </div>
        )}

        {phaseNavItems
          .filter((item) => item.show)
          .map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                title={isCollapsed ? item.title : undefined}
                className={`group flex items-center rounded-xl text-xs transition-all duration-200 ${
                  isCollapsed ? 'justify-center p-2' : 'justify-between px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-surface text-text font-bold shadow-md border border-border/80'
                    : 'text-text-muted hover:text-text hover:bg-surface-muted/60 font-medium'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-gradient-to-tr from-[#7A2E33] to-[#4A171B] text-[#FFC46B] shadow-md shadow-accent/25 border border-[#7A2E33]/50'
                        : 'bg-surface text-text-muted border border-border/80 shadow-xs group-hover:text-text group-hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                  </div>
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </div>
              </Link>
            );
          })}
      </nav>

      {/* Bottom Soft UI Help Card Widget */}
      {!isCollapsed ? (
        <div className="p-3">
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#3B1816] via-[#2A1411] to-[#1C0D0B] border border-[#7A2E33]/40 text-white shadow-md space-y-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 text-[#FFC46B] flex items-center justify-center border border-white/10 shadow-inner">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-white">Butuh Bantuan & SOP?</div>
              <div className="text-[11px] text-[#EFE9DF]/70 mt-0.5 leading-snug">
                Panduan alur operasional & audit trail
              </div>
            </div>
            <div className="pt-0.5">
              <span className="w-full inline-block text-center py-1.5 px-3 rounded-xl bg-white text-[#1C1412] font-black text-[10px] tracking-wider shadow-sm uppercase">
                PANDUAN OPERASIONAL
              </span>
            </div>
          </div>
          <div className="mt-2.5 px-1 flex items-center justify-between text-[11px] text-text-subtle font-medium">
            <span>Otorisasi:</span>
            <span className="font-mono text-[10px] font-bold text-text bg-surface-muted px-2 py-0.5 rounded-lg border border-border">
              {actor.eventRole || actor.orgRole}
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 flex flex-col items-center gap-2 border-t border-border">
          <div
            title={`Otorisasi: ${actor.eventRole || actor.orgRole}`}
            className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"
          />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop floating inset sidebar (Soft UI style) */}
      <aside
        className={`hidden lg:flex flex-col fixed inset-y-0 left-0 my-4 ml-4 z-30 transition-all duration-300 rounded-2xl border border-border shadow-md bg-surface ${
          isCollapsed ? 'w-20' : 'w-64'
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
          <div className="relative w-64 max-w-[85vw] h-full shadow-2xl z-10 p-3 animate-fade-in">
            <div className="h-full rounded-2xl border border-border shadow-2xl overflow-hidden bg-surface">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
