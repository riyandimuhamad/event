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
  Layers,
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
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 select-none">
      {/* Brand Header */}
      <div className={`border-b border-zinc-200 dark:border-zinc-800 ${
        isCollapsed ? 'p-3 flex justify-center' : 'p-4 flex items-center justify-between'
      }`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold text-xs tracking-tight shadow-sm flex-shrink-0">
                EO
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 tracking-tight leading-none">
                  EventOps
                </div>
                <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate mt-1">
                  {orgName}
                </div>
              </div>
            </div>

            {/* Collapse/Hide Button (Right inside header) */}
            <button
              onClick={onToggleCollapse}
              type="button"
              title="Sembunyikan navigasi (Ctrl+B)"
              aria-label="Sembunyikan navigasi"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
            >
              <PanelLeftClose className="w-4 h-4 stroke-[1.75]" />
            </button>
          </>
        ) : (
          /* Collapsed View Header: Expand trigger button */
          <button
            onClick={onToggleCollapse}
            type="button"
            title="Buka navigasi (Ctrl+B)"
            aria-label="Buka navigasi"
            className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center transition-colors"
          >
            <PanelLeftOpen className="w-4 h-4 stroke-[1.75]" />
          </button>
        )}
      </div>

      {/* Nav List */}
      <nav className={`flex-1 overflow-y-auto space-y-1 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {!isCollapsed && (
          <div className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 pt-1 pb-1">
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
                className={`group flex items-center rounded-lg text-xs transition-colors duration-100 ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                } ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border border-zinc-200/70 dark:border-zinc-700/60'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-50 stroke-[2]'
                        : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 stroke-[1.75]'
                    }`}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
              </Link>
            );
          })}

        {isCollapsed ? (
          <div className="my-2 border-t border-zinc-200 dark:border-zinc-800" />
        ) : (
          <div className="pt-4 text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider px-2 pb-1">
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
                className={`group flex items-center rounded-lg text-xs transition-colors duration-100 ${
                  isCollapsed ? 'justify-center p-2.5' : 'justify-between px-2.5 py-2'
                } ${
                  isActive
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-semibold border border-zinc-200/70 dark:border-zinc-700/60'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 font-medium'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isActive
                        ? 'text-zinc-900 dark:text-zinc-50 stroke-[2]'
                        : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 stroke-[1.75]'
                    }`}
                  />
                  {!isCollapsed && <span>{item.title}</span>}
                </div>
              </Link>
            );
          })}
      </nav>

      {/* Footer Info: Clean Role Status without cheesy AI badges */}
      <div className={`border-t border-zinc-200 dark:border-zinc-800 ${
        isCollapsed ? 'p-2 flex justify-center' : 'p-3 flex items-center justify-between text-xs'
      }`}>
        {!isCollapsed ? (
          <>
            <span className="text-[11px] text-zinc-400 font-medium">Otorisasi:</span>
            <span className="font-mono text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
              {actor.eventRole || actor.orgRole}
            </span>
          </>
        ) : (
          <div
            title={`Otorisasi: ${actor.eventRole || actor.orgRole}`}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 h-screen sticky top-0 z-20 transition-all duration-200 ${
          isCollapsed ? 'w-14' : 'w-60'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-64 max-w-[85vw] h-full shadow-xl z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
