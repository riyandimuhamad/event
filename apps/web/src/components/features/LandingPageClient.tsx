'use client';

import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import Link from 'next/link';
import '@/app/maroon.css';

interface LandingPageProps {
  dashboardUrl: string;
}

const CIRCUIT_PATHS = [
  "M0 236H96M156 236H232Q252 236 252 256V336Q252 356 272 356H430Q450 356 450 376V560Q450 580 470 580H600",
  "M0 470H118M178 470H300Q320 470 320 490V640Q320 660 340 660H612",
  "M84 0V122Q84 142 104 142H170",
  "M0 640H96M156 640H200Q220 640 220 660V760Q220 780 240 780H560",
  "M0 356H24M84 356H160",
  "M330 0V140Q330 160 350 160H380",
];

const CHIP_NODES = [
  { x: 126, y: 236, glyph: "EO" },
  { x: 148, y: 470, glyph: "QR" },
  { x: 54, y: 356, glyph: "≡" },
  { x: 126, y: 640, glyph: "↗" },
  { x: 200, y: 142, glyph: "··" },
  { x: 410, y: 160, glyph: "◦" },
];

export function LandingPageClient({ dashboardUrl }: LandingPageProps) {
  const uid = useId().replace(/:/g, '');
  const rootRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const featRef = useRef<HTMLDivElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRoleEmail, setSelectedRoleEmail] = useState('budi.owner@nusantaracreative.id');
  const [statPeriod, setStatPeriod] = useState<0 | 1 | 2>(0);
  const [floatRotation, setFloatRotation] = useState(0);
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);

  const demoAccounts = [
    {
      name: 'Budi Santoso',
      role: 'Owner Organisasi',
      email: 'budi.owner@nusantaracreative.id',
      badge: 'OWNER',
    },
    {
      name: 'Siti Rahmawati',
      role: 'Event Manager',
      email: 'siti.manager@nusantaracreative.id',
      badge: 'EVENT_MANAGER',
    },
    {
      name: 'Dewi Lestari',
      role: 'Kepala Divisi Konsumsi',
      email: 'dewi.konsumsi@nusantaracreative.id',
      badge: 'DIVISION_HEAD',
    },
    {
      name: 'Rian Pratama',
      role: 'Relawan Operasional',
      email: 'volunteer.0001@eventops.id',
      badge: 'VOLUNTEER',
    },
  ];

  // Stat cards data
  const statPeriods = [
    {
      title: 'Presensi & Konsumsi Hari H',
      range: 'Sesi Lapangan Aktif',
      amount: '150 / 150',
      change: '+100%',
      categories: [
        { label: 'Relawan Hadir', value: 112, color: '#efe9df' },
        { label: 'Jatah Terdistribusi', value: 98, color: '#c4673f' },
        { label: 'Sisa Antrean', value: 14, color: '#7b6a5f' },
        { label: 'Kru Lapangan', value: 26, color: '#d9b48a' },
      ],
    },
    {
      title: 'Pengadaan Antar-Divisi',
      range: 'Siklus Logistik',
      amount: '10 Item',
      change: '+80%',
      categories: [
        { label: 'Terpenuhi & Closed', value: 6, color: '#efe9df' },
        { label: 'Sedang Dikerjakan', value: 2, color: '#c4673f' },
        { label: 'Menunggu Approval', value: 2, color: '#7b6a5f' },
        { label: 'Ditolak', value: 0, color: '#d9b48a' },
      ],
    },
    {
      title: 'Realisasi Honorarium',
      range: 'Rekonsiliasi Fee',
      amount: 'Rp 16.500.000',
      change: '100% Valid',
      categories: [
        { label: 'Fee Terbayar', value: 11500000, color: '#efe9df' },
        { label: 'Menunggu Pencairan', value: 5000000, color: '#c4673f' },
        { label: 'Piagam Terbit', value: 150, color: '#d9b48a' },
      ],
    },
  ];

  // 3D Tilt interaction on hero device
  const handleHeroPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const device = deviceRef.current;
    const hero = heroRef.current;
    if (device && hero) {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      device.style.setProperty('--mfl-rx', `${(-y * 18).toFixed(2)}deg`);
      device.style.setProperty('--mfl-ry', `${(x * 24).toFixed(2)}deg`);
    }
  };

  const handleHeroPointerLeave = () => {
    const device = deviceRef.current;
    if (device) {
      device.style.setProperty('--mfl-rx', '0deg');
      device.style.setProperty('--mfl-ry', '0deg');
    }
  };

  // Flashlight interaction on feature container
  const handleFeaturePointerMove = (e: React.PointerEvent) => {
    const feat = featRef.current;
    if (feat) {
      const rect = feat.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      feat.style.setProperty('--mfl-sx', `${x}%`);
      feat.style.setProperty('--mfl-sy', `${y}%`);
    }
  };

  const activeStat = statPeriods[statPeriod];

  return (
    <div
      ref={rootRef}
      className="mfl-root"
      style={{
        ['--mfl-frame' as any]: '#7a2e33',
        ['--mfl-paper' as any]: '#e7e2d8',
        ['--mfl-ink' as any]: '#1c1412',
        ['--mfl-muted' as any]: '#8c8279',
        ['--mfl-brand' as any]: '#7a2a2e',
        ['--mfl-night' as any]: '#2a1411',
        ['--mfl-card' as any]: '#3b1816',
        ['--mfl-cream' as any]: '#efe9df',
        ['--mfl-device' as any]: '#97a18e',
        ['--mfl-glow' as any]: '#ffc46b',
        ['--mfl-sat-dark' as any]: '#24100d',
        ['--mfl-sat-mid' as any]: '#8a5a3e',
        ['--mfl-sat-light' as any]: '#f2dfc1',
      }}
    >
      {/* Sticky Pill Navigation Header */}
      <nav className="mfl-nav" aria-label="Main Navigation">
        <div className="mfl-nav-l">
          <div className="mfl-logo-pill">
            <Link href="/" className="mfl-logo">
              <span className="mfl-logo-mark" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#efe9df" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </span>
              <span>
                EventOps<span className="mfl-dot">.</span>
              </span>
            </Link>

            <button
              type="button"
              className={`mfl-burger ${isMenuOpen ? 'is-open' : ''}`}
              aria-label={isMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i />
              <i />
            </button>
          </div>

          {/* Numbered Dropdown Menu */}
          {isMenuOpen && (
            <div className="mfl-dropdown" id={`${uid}-menu`}>
              <ul>
                {[
                  { label: 'Tentang Platform', href: '#tentang' },
                  { label: 'Fitur Operasional', href: '#fitur' },
                  { label: 'Alur Kerja Lapangan', href: '#alur' },
                  { label: 'Hak Akses & Audit', href: '#keamanan' },
                ].map((item, idx) => (
                  <li key={item.label} style={{ animationDelay: `${idx * 40}ms` }}>
                    <a
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="mfl-dd-n">0{idx + 1}</span>
                      {item.label}
                      <svg className="mfl-svg" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                        <path d="M3 9L9 3M4 3H9V8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mfl-dd-foot">
                <span className="mfl-live" />
                Sistem Operasional Aktif
              </div>
            </div>
          )}
        </div>

        {/* Right Action Buttons */}
        <div className="mfl-nav-r">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="mfl-btn mfl-btn--brand mfl-btn--sm"
          >
            Masuk
          </button>
          <Link
            href={dashboardUrl}
            className="mfl-btn mfl-btn--white mfl-btn--sm"
          >
            Buka Sistem
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        ref={heroRef}
        className="mfl-hero"
        style={{ minHeight: 'max(720px, calc(100svh - 14px))' }}
        onPointerMove={handleHeroPointerMove}
        onPointerLeave={handleHeroPointerLeave}
      >
        {/* Animated Circuit Board Vector Background */}
        <div className="mfl-circuit-wrap">
          <svg className="mfl-svg mfl-circuit" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <linearGradient id={`${uid}-pulse`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="var(--mfl-brand)" stopOpacity="0" />
                <stop offset="0.7" stopColor="var(--mfl-brand)" stopOpacity="0.55" />
                <stop offset="1" stopColor="var(--mfl-glow)" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* Circuit paths (Left side & Right side mirrored) */}
            {[false, true].map((mirrored, mIdx) => (
              <g key={mIdx} transform={mirrored ? 'translate(1440 0) scale(-1 1)' : undefined}>
                {CIRCUIT_PATHS.map((d, pIdx) => (
                  <path key={`t-${pIdx}`} d={d} className="mfl-trace" />
                ))}
                {CIRCUIT_PATHS.map((d, pIdx) => (
                  <path
                    key={`p-${pIdx}`}
                    d={d}
                    pathLength="1000"
                    className="mfl-pulse"
                    stroke={`url(#${uid}-pulse)`}
                    style={{
                      animationDelay: `${-((pIdx * 1.7 + (mirrored ? 2.3 : 0)) % 6)}s`,
                      animationDuration: `${5 + ((pIdx + (mirrored ? 1 : 0)) % 3)}s`,
                    }}
                  />
                ))}
                {CHIP_NODES.map((chip, cIdx) => (
                  <g key={`c-${cIdx}`} className="mfl-chip" transform={`translate(${chip.x} ${chip.y})`}>
                    <rect x="-28" y="-16" width="56" height="32" rx="8" />
                    <text x="0" y="4.5" textAnchor="middle" transform={mirrored ? 'scale(-1 1)' : undefined}>
                      {chip.glyph}
                    </text>
                  </g>
                ))}
              </g>
            ))}
          </svg>
        </div>

        {/* Floating Rotating Glyphic Tile */}
        <button
          type="button"
          className="mfl-float-tile"
          aria-label="Kirim sinyal sinkronisasi"
          onClick={() => setFloatRotation((r) => r + 1)}
        >
          <span style={{ transform: `rotate(${floatRotation * 60}deg)` }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1c1412" strokeWidth="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </span>
        </button>

        {/* Hero Headings */}
        <div className="mfl-hero-head">
          <p className="mfl-backer mfl-in">
            Platform Operasional
            <span className="mfl-backer-mark" aria-hidden="true">EO</span>
            <b>Nusantara Creative</b>
          </p>

          <h1 className="mfl-h1">
            <span className="mfl-line">
              Smarter <span className="mfl-mute" style={{ fontStyle: 'italic', fontFamily: 'serif' }}>Event</span>
            </span>
            <span className="mfl-line">
              <span className="mfl-mute" style={{ fontStyle: 'italic', fontFamily: 'serif' }}>Operations</span> Suite
            </span>
          </h1>

          <p className="mfl-sub">
            Kelola pengadaan kebutuhan antar-divisi, presensi staf dan relawan via QR, distribusi
            konsumsi lapangan, serta verifikasi honorarium dalam satu ekosistem terpadu.
          </p>

          <div className="mfl-cta-row">
            <Link href={dashboardUrl} className="mfl-btn mfl-btn--brand">
              Buka Command Center
            </Link>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="mfl-btn mfl-btn--white"
            >
              Pilih Akun Demo & Masuk
            </button>
          </div>
        </div>

        {/* Central 3D Interactive Device Stage */}
        <div className="mfl-stage">
          <div ref={deviceRef} className="mfl-device">
            <div className="mfl-device-btn">
              <div className="mfl-device-float">
                {/* SVG 3D Device Pebble Stone */}
                <svg className="mfl-svg mfl-device-svg" viewBox="0 0 320 320" width="320" height="320" aria-hidden="true">
                  <defs>
                    <linearGradient id={`${uid}-face`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
                      <stop offset="0.45" stopColor="#fff" stopOpacity="0.04" />
                      <stop offset="1" stopColor="#000" stopOpacity="0.22" />
                    </linearGradient>
                    <radialGradient id={`${uid}-sheen`} cx="0.28" cy="0.22" r="0.7">
                      <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
                      <stop offset="0.5" stopColor="#fff" stopOpacity="0.08" />
                      <stop offset="1" stopColor="#fff" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id={`${uid}-side`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#000" stopOpacity="0.05" />
                      <stop offset="1" stopColor="#000" stopOpacity="0.45" />
                    </linearGradient>
                    <linearGradient id={`${uid}-led`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="var(--mfl-glow)" stopOpacity="0" />
                      <stop offset="0.55" stopColor="var(--mfl-glow)" stopOpacity="0.95" />
                      <stop offset="0.8" stopColor="#fff6e0" stopOpacity="1" />
                      <stop offset="1" stopColor="var(--mfl-glow)" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id={`${uid}-blur`} x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="9" />
                    </filter>
                  </defs>

                  <g transform="rotate(-14 160 160)">
                    <rect x="46" y="58" width="228" height="228" rx="76" fill="var(--mfl-device)" />
                    <rect x="46" y="58" width="228" height="228" rx="76" fill={`url(#${uid}-side)`} />
                    {/* Glowing LED Arc on device edge */}
                    <g className="mfl-led">
                      <path d="M270 150Q276 262 168 280" fill="none" stroke={`url(#${uid}-led)`} strokeWidth="14" strokeLinecap="round" filter={`url(#${uid}-blur)`} />
                      <path d="M268 160Q274 258 174 276" fill="none" stroke="#fff9ea" strokeWidth="4.5" strokeLinecap="round" />
                    </g>
                    <rect x="46" y="58" width="228" height="228" rx="76" fill={`url(#${uid}-face)`} />
                    <rect x="46" y="58" width="228" height="228" rx="76" fill={`url(#${uid}-sheen)`} />
                    {/* Centered Monogram Mark */}
                    <circle cx="160" cy="172" r="32" fill="#1c1412" fillOpacity="0.85" />
                    <text x="160" y="178" textAnchor="middle" fill="#efe9df" fontSize="16" fontWeight="bold" fontFamily="monospace">
                      EO
                    </text>
                  </g>
                </svg>

                {/* Floating status pill */}
                <span className="mfl-callout">
                  <span className="mfl-live" />
                  Presensi QR & Jatah Makan Real-time
                </span>
              </div>
            </div>

            {/* Pulse rings */}
            <div className="mfl-rings">
              <i />
              <i />
              <i />
            </div>

            <div className="mfl-device-shadow" />
          </div>
        </div>

        {/* Hero Foot: Left editorial / Right dark burgundy stat cards */}
        <div className="mfl-hero-foot">
          <div className="mfl-info">
            <div className="mfl-info-k">
              <span>/info/</span>
              <span>arsitektur sistem</span>
            </div>
            <p className="mfl-info-t">
              EventOps mengeliminasi selisih logistik lapangan melalui{' '}
              <span className="mfl-mute" style={{ fontStyle: 'italic' }}>state machine yang ketat</span>,
              presensi barcode berkecepatan tinggi, serta append-only audit trail.
            </p>
          </div>

          {/* Interactive Stat Card with Period Tabs */}
          <div className="mfl-cards">
            <div className="mfl-stat">
              <div className="mfl-stat-top">
                <div>
                  <div className="mfl-stat-t">{activeStat.title}</div>
                  <div className="mfl-stat-d">{activeStat.range}</div>
                </div>

                {/* Period Selector Menu */}
                <div className="mfl-menu mfl-menu--dark">
                  <div className="flex gap-1">
                    {(['Hari H', 'Logistik', 'Keuangan'] as const).map((tab, idx) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setStatPeriod(idx as any)}
                        className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                          statPeriod === idx ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mfl-stat-amt">{activeStat.amount}</div>

              <div className="mfl-stat-chg">
                <span className="mfl-chg">{activeStat.change}</span>
                <span>Tervalidasi Sistem</span>
              </div>

              {/* Categorical split bar / donut list */}
              <div className="mfl-stat-split">
                <div className="mfl-legend">
                  <div className="mfl-legend-h">Rincian Komponen:</div>
                  <ul>
                    {activeStat.categories.map((cat) => (
                      <li key={cat.label}>
                        <i style={{ backgroundColor: cat.color }} />
                        <span>{cat.label}</span>
                        <b>{typeof cat.value === 'number' && cat.value > 1000 ? `Rp ${(cat.value / 1000000).toFixed(1)}M` : cat.value}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dark Maroon Night Section */}
      <div className="mfl-night">
        {/* About Section */}
        <section id="tentang" className="mfl-about">
          <span className="mfl-badge">Tentang Platform</span>

          <h2 className="mfl-statement">
            EventOps menggabungkan{' '}
            <span className="mfl-w is-on">koordinasi divisi</span>,{' '}
            <span className="mfl-w is-on">presensi shift relawan</span>, dan{' '}
            <span className="mfl-w is-on">distribusi konsumsi lapangan</span>{' '}
            ke dalam satu alur kerja transparan yang{' '}
            <span className="mfl-trio is-on" aria-hidden="true">
              <i>1</i>
              <i>2</i>
              <i>3</i>
            </span>{' '}
            mencegah duplikasi serta kehilangan data.
          </h2>

          {/* 3 Large Stat Metrics */}
          <div className="mfl-stats">
            <div className="mfl-statnum">
              <div className="mfl-statnum-v">100%</div>
              <div className="mfl-statnum-l">Pencegahan Duplikasi Jatah Konsumsi</div>
            </div>
            <div className="mfl-statnum">
              <div className="mfl-statnum-v">36 Model</div>
              <div className="mfl-statnum-l">Skema Relasional Terisolasi Tenant</div>
            </div>
            <div className="mfl-statnum">
              <div className="mfl-statnum-v">8 Tingkat</div>
              <div className="mfl-statnum-l">Wewenang RBAC & Append-Only Audit Log</div>
            </div>
          </div>
        </section>

        {/* Satin Features Section with Flashlight Cursor Interaction */}
        <section id="fitur" ref={featRef} className="mfl-feat" onPointerMove={handleFeaturePointerMove}>
          <div className="mfl-feat-bg">
            <svg className="mfl-satin" viewBox="0 0 1440 900" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`${uid}-sat1`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="var(--mfl-sat-dark)" />
                  <stop offset="0.6" stopColor="var(--mfl-sat-mid)" />
                  <stop offset="1" stopColor="var(--mfl-sat-dark)" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill={`url(#${uid}-sat1)`} />
            </svg>
            <div className="mfl-feat-light" />
          </div>

          <div className="mfl-feat-in">
            <span className="mfl-badge">Fitur Unggulan</span>

            <h2 className="mfl-h2">
              Alat Esensial untuk <span className="mfl-mute" style={{ fontStyle: 'italic', fontFamily: 'serif' }}>Event Manager</span> &{' '}
              <span className="mfl-mute" style={{ fontStyle: 'italic', fontFamily: 'serif' }}>Koordinator</span>
            </h2>
            <p className="mfl-feat-sub">
              Menghilangkan salah koordinasi antar-divisi dengan kontrol hak akses berbasis peran dan verifikasi lapangan.
            </p>

            {/* Feature Bento Cards */}
            <div className="mfl-fcards">
              {/* Card 1: Multi-Divisional Hub Card */}
              <div className="mfl-fcard">
                <div className="mfl-fmedia">
                  <div className="mfl-flare" />
                  <div className="mfl-panel">
                    <div className="mfl-panel-row">
                      <div>
                        <div className="mfl-panel-k">Pusat Koordinasi Divisi</div>
                        <div className="mfl-wallet-total">6 Divisi Aktif</div>
                        <div className="mfl-wallet-g">Semua jalur terhubung</div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-200/60 font-semibold">
                        LIVE
                      </span>
                    </div>

                    <div className="mfl-wallet-grid">
                      {[
                        { code: 'LOG', name: 'Logistik', count: '10 Item', active: true },
                        { code: 'KON', name: 'Konsumsi', count: '6 Slot', active: true },
                        { code: 'ACR', name: 'Acara & Talent', count: '2 Talent', active: false },
                        { code: 'KEU', name: 'Keuangan', count: 'Rp 16.5M', active: false },
                      ].map((div) => (
                        <div key={div.code} className={`mfl-wtile ${div.active ? 'is-sel' : ''}`}>
                          <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                            <span>{div.code}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          <b>{div.name}</b>
                          <em>{div.count}</em>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <h3>Hub Pengadaan Logistik Antar-Divisi</h3>
                <p>
                  Permohonan barang atau jasa diverifikasi langsung oleh kepala divisi tujuan.
                  Alur transisi formal dengan catatan wajib jika terjadi penolakan.
                </p>
              </div>

              {/* Card 2: Real-time Requisition & Consumption Heatmap Matrix */}
              <div className="mfl-fcard">
                <div className="mfl-fmedia">
                  <div className="mfl-flare mfl-flare--r" />
                  <div className="mfl-panel">
                    <div className="mfl-panel-row">
                      <div>
                        <div className="mfl-panel-k">Matriks Distribusi & Kehadiran</div>
                        <div className="mfl-spend-sum">
                          <b>98.4%</b>
                          <p><span>Tingkat kehadiran shift</span></p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                        AKTIF
                      </span>
                    </div>

                    <div className="mfl-meter">
                      <i style={{ width: '85%' }} />
                    </div>

                    {/* Interactive 5x7 matrix grid */}
                    <div className="mfl-heat" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                      {[0, 1, 2, 3, 4].map((row) =>
                        [0, 1, 2, 3, 4, 5, 6].map((col) => {
                          const level = ((row * 3 + col * 2 + 1) % 5);
                          const isHovered = activeCell?.row === row && activeCell?.col === col;
                          return (
                            <button
                              key={`${row}-${col}`}
                              type="button"
                              onMouseEnter={() => setActiveCell({ row, col })}
                              className={`mfl-cell lv${level} ${isHovered ? 'is-on' : ''}`}
                            />
                          );
                        })
                      )}
                    </div>

                    <div className="mfl-heat-tip">
                      {activeCell ? (
                        <span>Slot Sesi #{activeCell.col + 1}: <b>Tervalidasi Tanpa Selisih</b></span>
                      ) : (
                        <span>Arahkan kursor ke matriks untuk melihat status slot</span>
                      )}
                    </div>
                  </div>
                </div>

                <h3>Stasiun Presensi QR & Kontrol Konsumsi</h3>
                <p>
                  Pemindaian kode identitas secara instan mengaktifkan hak jatah makan di sesi yang aktif,
                  dengan dukungan antrean offline saat sinyal seluler padat.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Showcase Section */}
        <section id="alur" className="max-w-5xl mx-auto px-4 py-20 text-center space-y-6">
          <span className="mfl-badge">Alur Siklus Acara</span>
          <h2 className="mfl-h2">
            Dari Perencanaan hingga <span className="mfl-mute" style={{ fontStyle: 'italic', fontFamily: 'serif' }}>Rekonsiliasi Akhir</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-6">
            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-2">
              <div className="text-[11px] font-mono text-zinc-400">FASE 01</div>
              <h3 className="text-sm font-bold text-white">Pra-Event (Persiapan)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Manajemen struktur divisi, inventaris kaos per ukuran, pengadaan perlengkapan antar-divisi,
                dan katalog riders talent.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-white/20 bg-white/10 space-y-2 shadow-lg">
              <div className="text-[11px] font-mono text-amber-300">FASE 02 · HARI H</div>
              <h3 className="text-sm font-bold text-white">Operasional Lapangan</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Presensi QR relawan di gerbang, pembagian konsumsi terjadwal tanpa dobel, dan antrean lokal
                idempoten.
              </p>
            </div>

            <div className="p-5 rounded-xl border border-white/10 bg-white/5 space-y-2">
              <div className="text-[11px] font-mono text-zinc-400">FASE 03</div>
              <h3 className="text-sm font-bold text-white">Pasca-Event (Keuangan)</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Pencairan honorarium dengan bukti transfer, penerbitan piagam penghargaan digital, dan audit trail
                permanen.
              </p>
            </div>
          </div>
        </section>

        {/* Security / RBAC Section */}
        <section id="keamanan" className="max-w-5xl mx-auto px-4 py-16 border-t border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center text-left">
            <div className="space-y-3">
              <span className="mfl-badge">Keamanan & Kepatuhan</span>
              <h2 className="text-2xl font-bold text-white">
                Hak Akses Berbasis Peran & Jejak Audit Permanen
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Menjaga integritas operasional event dengan isolasi tenant organisasi, enkripsi data kontak AES-256-GCM,
                dan pencatatan audit log append-only yang tidak dapat dimanipulasi.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-black/40 font-mono text-xs space-y-2 text-zinc-300">
              <div className="text-[10px] text-zinc-500 pb-1 border-b border-white/10 flex justify-between">
                <span>MATRIKS OTORISASI (RBAC)</span>
                <span className="text-emerald-400">AKTIF</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-amber-200">Owner & Event Manager</span>
                  <span className="text-zinc-500">Pencairan Fee & Kontrol Total</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200">Kepala Divisi</span>
                  <span className="text-zinc-500">Approval Pengadaan Divisi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200">Operator Lapangan</span>
                  <span className="text-zinc-500">Presensi QR & Distribusi Makan</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-200">Relawan & Kru</span>
                  <span className="text-zinc-500">Akses ID Card & Shift</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action Section */}
        <section className="mfl-cta">
          <div className="mfl-cta-mark" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07L19.07 4.93" />
            </svg>
          </div>

          <h2 className="mfl-h2" style={{ marginTop: '28px' }}>
            Setiap divisi, <span className="mfl-mute" style={{ fontStyle: 'italic', fontFamily: 'serif' }}>terkoordinasi</span> sempurna.
          </h2>

          <p className="mfl-feat-sub" style={{ marginTop: '12px' }}>
            Masuk ke command center atau coba akun pengujian peran untuk merasakan alur kerja EventOps.
          </p>

          <div className="mfl-cta-row">
            <Link href={dashboardUrl} className="mfl-btn mfl-btn--cream">
              Buka Command Center
            </Link>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="mfl-btn mfl-btn--ghost"
            >
              Pilih Akun Demo & Masuk
            </button>
          </div>
        </section>

        {/* Refined Editorial Footer */}
        <footer className="mfl-foot">
          <div className="mfl-foot-top">
            <div className="mfl-foot-brand">
              <div className="mfl-logo" style={{ color: 'var(--mfl-cream)' }}>
                <span className="mfl-logo-mark" style={{ background: 'var(--mfl-brand)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </span>
                <span>EventOps.</span>
              </div>
              <p>
                Platform terpadu untuk pengadaan logistik, presensi relawan via QR, distribusi konsumsi,
                dan rekonsiliasi pasca-event.
              </p>
            </div>

            <div className="mfl-foot-col">
              <p>Navigasi</p>
              <ul>
                <li><a href="#tentang">Tentang</a></li>
                <li><a href="#fitur">Fitur Utama</a></li>
                <li><a href="#alur">Alur Kerja</a></li>
                <li><a href="#keamanan">Hak Akses</a></li>
              </ul>
            </div>

            <div className="mfl-foot-col">
              <p>Modul</p>
              <ul>
                <li><Link href={dashboardUrl}>Command Center</Link></li>
                <li><button onClick={() => setIsLoginModalOpen(true)} className="text-left">Masuk Sistem</button></li>
              </ul>
            </div>

            <div className="mfl-foot-col">
              <p>Status</p>
              <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
                <span className="mfl-live" />
                <span>All systems normal</span>
              </div>
            </div>
          </div>

          {/* Giant Watermark Typography */}
          <div className="mfl-wordmark" aria-hidden="true">
            EVENTOPS<span>.</span>
          </div>

          <div className="mfl-foot-bot">
            <div>© 2026 EventOps. Seluruh hak cipta dilindungi.</div>
            <div className="mfl-foot-soc">
              <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Kembali ke Atas ↑
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Maroon & Linen Styled Login Modal */}
      {isLoginModalOpen && (
        <div className="mfl-modal" onClick={() => setIsLoginModalOpen(false)}>
          <div className="mfl-dialog" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="mfl-x"
              aria-label="Tutup"
              onClick={() => setIsLoginModalOpen(false)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <h2>Masuk ke EventOps.</h2>
            <p className="mfl-dialog-sub">
              Pilih akun demonstrasi peran untuk langsung menguji sistem komando.
            </p>

            <div className="mt-4 space-y-2">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRoleEmail === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => setSelectedRoleEmail(acc.email)}
                    className="w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between"
                    style={{
                      background: isSelected ? 'var(--mfl-brand)' : '#fbfaf7',
                      color: isSelected ? '#fff' : 'var(--mfl-ink)',
                      borderColor: isSelected ? 'var(--mfl-brand)' : 'rgba(0,0,0,0.1)',
                      boxShadow: isSelected ? '0 4px 14px rgba(122, 42, 46, 0.35)' : 'none',
                    }}
                  >
                    <div>
                      <div className="font-semibold text-xs">{acc.name}</div>
                      <div className="text-[11px] opacity-75">{acc.role}</div>
                    </div>
                    <span
                      className="font-mono text-[10px] px-2 py-0.5 rounded"
                      style={{
                        background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.06)',
                      }}
                    >
                      {acc.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(false)}
                className="text-xs text-zinc-500 hover:text-zinc-800"
              >
                Batal
              </button>

              <Link
                href={dashboardUrl}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('eventops_active_role_email', selectedRoleEmail);
                  }
                  setIsLoginModalOpen(false);
                }}
                className="mfl-btn mfl-btn--brand mfl-btn--sm"
              >
                Masuk Sekarang →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
