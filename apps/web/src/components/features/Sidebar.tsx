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
} from 'lucide-react';
import { Actor, RbacGuard } from '@eventops/shared';
import { t } from '@/lib/i18n';

interface SidebarProps {
  orgSlug: string;
  eventId: string;
  actor: Actor;
}

export function Sidebar({ orgSlug, eventId, actor }: SidebarProps) {
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

  return (
    <aside className="w-64 bg-white dark:bg-zinc-900 border-r border-border flex flex-col h-full overflow-y-auto">
      {/* Brand */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            EO
          </div>
          <div>
            <span className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight">
              EventOps
            </span>
            <p className="text-[10px] text-zinc-500 font-medium">Enterprise Edition</p>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-1">
          Modul Utama
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}

        <div className="pt-4 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-3 py-1">
          Fase Event
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
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
      </nav>

      {/* Role info */}
      <div className="p-3 border-t border-border bg-zinc-50 dark:bg-zinc-900/50">
        <div className="text-xs text-zinc-500 font-medium">Peran Aktif:</div>
        <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
          {actor.eventRole || actor.orgRole}
        </div>
      </div>
    </aside>
  );
}
