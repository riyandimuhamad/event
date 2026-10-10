'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface FlowPoint {
  time: string;
  requested: number;
  fulfilled: number;
}

interface DistributionChartProps {
  flowPoints: FlowPoint[];
  openRequisitionsCount: number;
  totalMealsServed: number;
  totalMealsTarget: number;
  mealPercentage: number;
  reportUrl: string;
}

/**
 * Monotone Cubic Spline (Fritsch-Carlson) smooth path generator.
 * Prevents overshooting and squished/kinked control points on line charts.
 */
function getMonotoneSplinePath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return '';
  if (n === 1) return `M ${pts[0].x},${pts[0].y}`;
  if (n === 2) return `M ${pts[0].x},${pts[0].y} L ${pts[1].x},${pts[1].y}`;

  // Slopes of secant lines between consecutive points
  const dxs: number[] = [];
  const dys: number[] = [];
  const ms: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dy = pts[i + 1].y - pts[i].y;
    dxs.push(dx);
    dys.push(dy);
    ms.push(dy / dx);
  }

  // Tangents at data points
  const c1s: number[] = [ms[0]];
  for (let i = 0; i < n - 2; i++) {
    const m0 = ms[i];
    const m1 = ms[i + 1];
    if (m0 * m1 <= 0) {
      c1s.push(0);
    } else {
      const common = dxs[i] + dxs[i + 1];
      c1s.push((3 * common) / ((common + dxs[i + 1]) / m0 + (common + dxs[i]) / m1));
    }
  }
  c1s.push(ms[ms.length - 1]);

  // Cubic Bezier control points
  let path = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i];
    const p1 = pts[i + 1];
    const dx = dxs[i];
    const cp1x = p0.x + dx / 3;
    const cp1y = p0.y + (c1s[i] * dx) / 3;
    const cp2x = p1.x - dx / 3;
    const cp2y = p1.y - (c1s[i + 1] * dx) / 3;

    path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`;
  }

  return path;
}

export function DistributionChart({
  flowPoints,
  openRequisitionsCount,
  totalMealsServed,
  totalMealsTarget,
  mealPercentage,
  reportUrl,
}: DistributionChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 640;
  const height = 210;
  const paddingX = 32;
  const paddingTop = 24;
  const paddingBottom = 36;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...flowPoints.map((p) => Math.max(p.requested, p.fulfilled)), 100);

  // Compute points
  const points = flowPoints.map((p, i) => {
    const x = paddingX + (i / (flowPoints.length - 1)) * chartW;
    const yReq = paddingTop + chartH - (p.requested / maxVal) * chartH;
    const yFul = paddingTop + chartH - (p.fulfilled / maxVal) * chartH;
    return { x, yReq, yFul, data: p };
  });

  const reqLinePath = getMonotoneSplinePath(points.map((p) => ({ x: p.x, y: p.yReq })));
  const fulLinePath = getMonotoneSplinePath(points.map((p) => ({ x: p.x, y: p.yFul })));

  const baselineY = paddingTop + chartH;
  const reqAreaPath = `${reqLinePath} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`;
  const fulAreaPath = `${fulLinePath} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="lg:col-span-7 bg-[#ECE6DA] dark:bg-[#161B22] rounded-2xl border border-[#DCD3C4] dark:border-[#2B3342] shadow-xs p-5 flex flex-col justify-between transition-all">
      <div>
        {/* Header Title & Legends */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h4 className="text-base font-bold text-[#1C1412] dark:text-[#F0F3F6]">
              Arus Distribusi Logistik &amp; Konsumsi
            </h4>
            <p className="text-xs text-[#7A7066] dark:text-[#8B949E] mt-0.5">
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                +{mealPercentage}% terpenuhi
              </span>{' '}
              ({totalMealsServed} dari {totalMealsTarget} porsi tersalurkan)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7A2A2E] ring-2 ring-[#7A2A2E]/20" />
              <span className="text-[#1C1412] dark:text-[#F0F3F6]">
                Permintaan Masuk ({openRequisitionsCount})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D9822B] ring-2 ring-[#D9822B]/20" />
              <span className="text-[#1C1412] dark:text-[#F0F3F6]">
                Konsumsi Terlayani ({totalMealsServed})
              </span>
            </div>
          </div>
        </div>

        {/* Chart Canvas Card */}
        <div className="relative pt-2">
          <div className="bg-[#F8F5EE] dark:bg-[#1C2128] rounded-2xl border border-[#DCD3C4] dark:border-[#30363D] p-3 shadow-inner">
            <div className="relative w-full aspect-[640/210]">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-full select-none overflow-visible"
              >
                <defs>
                  {/* Subtle Maroon Gradient */}
                  <linearGradient id="distMaroonGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7A2A2E" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#7A2A2E" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#7A2A2E" stopOpacity="0" />
                  </linearGradient>

                  {/* Subtle Amber Gradient */}
                  <linearGradient id="distAmberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D9822B" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#D9822B" stopOpacity="0.06" />
                    <stop offset="100%" stopColor="#D9822B" stopOpacity="0" />
                  </linearGradient>

                  {/* Line Glow Filter */}
                  <filter id="lineGlow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#7A2A2E" floodOpacity="0.15" />
                  </filter>
                </defs>

                {/* Horizontal Guide Lines */}
                {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = paddingTop + chartH * ratio;
                  return (
                    <line
                      key={idx}
                      x1={paddingX}
                      y1={y}
                      x2={width - paddingX}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.08"
                      strokeDasharray="4 4"
                    />
                  );
                })}

                {/* Maroon Area & Line (Permintaan Masuk) */}
                <path d={reqAreaPath} fill="url(#distMaroonGrad)" />
                <path
                  d={reqLinePath}
                  fill="none"
                  stroke="#7A2A2E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#lineGlow)"
                />

                {/* Amber Area & Line (Konsumsi Terlayani) */}
                <path d={fulAreaPath} fill="url(#distAmberGrad)" />
                <path
                  d={fulLinePath}
                  fill="none"
                  stroke="#D9822B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Vertical Tracking Line */}
                {hoverIndex !== null && (
                  <line
                    x1={points[hoverIndex].x}
                    y1={paddingTop}
                    x2={points[hoverIndex].x}
                    y2={baselineY}
                    stroke="#7A2A2E"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="opacity-60"
                  />
                )}

                {/* Data Points */}
                {points.map((pt, idx) => {
                  const isHovered = hoverIndex === idx;
                  return (
                    <g key={idx}>
                      {/* Fulfilled Amber Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.yFul}
                        r={isHovered ? 6 : 4}
                        fill="#FFFFFF"
                        stroke="#D9822B"
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all duration-150 cursor-pointer"
                      />
                      {/* Requested Maroon Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.yReq}
                        r={isHovered ? 6 : 4}
                        fill="#FFFFFF"
                        stroke="#7A2A2E"
                        strokeWidth={isHovered ? 3 : 2}
                        className="transition-all duration-150 cursor-pointer"
                      />

                      {/* Invisible Hover Hitbox Area */}
                      <rect
                        x={pt.x - chartW / (points.length * 2)}
                        y={paddingTop}
                        width={chartW / points.length}
                        height={chartH + 20}
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoverIndex(idx)}
                        onMouseLeave={() => setHoverIndex(null)}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Floating Tooltip Pill */}
              {activePoint && (
                <div
                  className="absolute pointer-events-none transition-all duration-200 z-10"
                  style={{
                    left: `${(activePoint.x / width) * 100}%`,
                    top: '10px',
                    transform: 'translateX(-50%)',
                  }}
                >
                  <div className="bg-[#1C1412] text-[#F8F5EE] px-3 py-1.5 rounded-xl shadow-lg border border-white/10 text-[11px] flex items-center gap-3 whitespace-nowrap">
                    <span className="font-bold text-[#FFC46B]">{activePoint.data.time} WIB</span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7A2A2E]" />
                      Req: {activePoint.data.requested}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D9822B]" />
                      Saji: {activePoint.data.fulfilled}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] font-mono font-medium text-[#7A7066] dark:text-[#8B949E] px-3 pt-2">
              {flowPoints.map((pt, idx) => (
                <span
                  key={idx}
                  className={`transition-colors ${
                    hoverIndex === idx ? 'text-[#7A2A2E] font-bold dark:text-[#FFC46B]' : ''
                  }`}
                >
                  {pt.time}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-4 mt-3 border-t border-[#DCD3C4] dark:border-[#2B3342] flex items-center justify-between text-xs">
        <span className="text-[#7A7066] dark:text-[#8B949E]">
          Pembaruan live dari logistik posko &amp; QR scanner konsumsi
        </span>
        <Link
          href={reportUrl}
          className="font-bold text-[#7A2A2E] dark:text-[#FFC46B] flex items-center gap-1 hover:underline"
        >
          <span>Laporan Lengkap</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
