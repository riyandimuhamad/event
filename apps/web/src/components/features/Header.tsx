'use client';

import React from 'react';
import { Menu, X, Home } from 'lucide-react';
import { RoleSwitcher } from './RoleSwitcher';

interface HeaderProps {
  orgName: string;
  eventName: string;
  currentEmail?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({
  orgName,
  eventName,
  currentEmail,
  onMobileMenuToggle,
  isMobileMenuOpen,
}: HeaderProps) {
  return (
    <header className="w-full rounded-2xl bg-[#2A1411] border border-[#3E1F1A] shadow-md px-4 sm:px-5 py-3 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile menu trigger + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileMenuToggle}
          type="button"
          aria-label="Buka menu navigasi"
          className="lg:hidden p-1.5 rounded-xl text-[#A89A8E] hover:text-white hover:bg-[#351915] border border-[#3E1F1A]"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Organization / Event Breadcrumb & Page Title */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] text-[#A89A8E] font-medium truncate">
            <Home className="w-3.5 h-3.5 text-[#8C7A70] flex-shrink-0" />
            <span className="text-[#5A4540]">/</span>
            <span className="truncate max-w-[120px] sm:max-w-[180px] text-[#C9BEB2]">{orgName}</span>
            <span className="text-[#5A4540]">/</span>
            <span className="text-[#FFFFFF] font-semibold truncate max-w-[140px] sm:max-w-xs">{eventName}</span>
          </div>
          <div className="text-xs sm:text-sm font-extrabold text-[#FFFFFF] tracking-tight truncate mt-0.5">
            Pusat Komando Operasional
          </div>
        </div>
      </div>

      {/* Right: User/Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <RoleSwitcher currentEmail={currentEmail} />
      </div>
    </header>
  );
}
