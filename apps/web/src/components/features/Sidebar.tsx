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
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Actor, RbacGuard } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface SidebarProps {
  orgSlug: string;
  eventId: string;
  actor: Actor;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ orgSlug, eventId, actor, isMobileOpen, onCloseMobile }: SidebarProps) {
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
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Brand & Logo */}
      <div className="p-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-500/20">
            EO
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base text-text tracking-tight">
                EventOps
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-text-muted font-medium">Enterprise Suite</p>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-text-subtle uppercase tracking-wider px-3 pt-2 pb-1">
          Modul Operasional
        </div>
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
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-accent-subtle text-accent shadow-sm'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                )}
              </Link>
            );
          })}

        <div className="pt-5 text-[10px] font-bold text-text-subtle uppercase tracking-wider px-3 pb-1">
          Fase Siklus Acara
        </div>
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
                className={`group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-accent-subtle text-accent shadow-sm'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-accent' : 'text-text-subtle group-hover:text-text'
                    }`}
                  />
                  <span>{item.title}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                )}
              </Link>
            );
          })}
      </nav>

      {/* Footer info: Role badge */}
      <div className="p-3 border-t border-border bg-surface-muted/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-text-muted font-medium">Akses Terotorisasi:</span>
          </div>
          <span className="text-[11px] font-bold text-text bg-surface px-2 py-0.5 rounded-md border border-border">
            {actor.eventRole || actor.orgRole}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col flex-shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          ></div>
          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
