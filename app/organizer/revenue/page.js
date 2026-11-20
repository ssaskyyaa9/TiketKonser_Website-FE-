// src/app/organizer/revenue/page.js
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import {
  FaSpinner,
  FaDownload,
  FaArrowDown,
  FaArrowUp,
  FaChartLine,
  FaCalendarAlt,
  FaMusic,
  FaWallet,
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const formatCompactRupiah = (value) => {
  const num = Number(value || 0);
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1).replace('.0', '')} M`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  if (num >= 1_000) return `Rp ${Math.round(num / 1_000)} Rb`;
  return `Rp ${num.toLocaleString('id-ID')}`;
};

const buildSmoothLinePath = (points) => {
  if (!points.length) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const curr = points[i];
    const next = points[i + 1];
    const midX = (curr.x + next.x) / 2;
    path += ` C ${midX} ${curr.y}, ${midX} ${next.y}, ${next.x} ${next.y}`;
  }
  return path;
};

export default function RevenuePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [currentMonthLabel, setCurrentMonthLabel] = useState('Periode Aktif');

  useEffect(() => {
    setCurrentMonthLabel(format(new Date(), 'MMMM yyyy', { locale: id }));
  }, []);

  const fetchRevenue = useCallback(async () => {
    try {
      setLoadingRevenue(true);
      const response = await api.get('/organizer/revenue');
      if (response.data?.success) {
        setRevenueData(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data pendapatan');
    } finally {
      setLoadingRevenue(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'organizer') {
      void fetchRevenue();
    }
  }, [user, loading, router, fetchRevenue]);

  const chartSeries = useMemo(() => {
    if (!revenueData) return [];

    let rawItems = [];
    if (Array.isArray(revenueData.monthly) && revenueData.monthly.length) {
      rawItems = revenueData.monthly.map((item) => ({
        label: item.month || item.label || '-',
        total: Number(item.total || 0),
      }));
    }

    if (rawItems.length === 0) {
      const fallbackVal = Number(revenueData.thisMonth ?? revenueData.total ?? 0);
      rawItems = [
        { label: 'Awal', total: 0 },
        { label: 'Terbaru', total: fallbackVal },
      ];
    } else if (rawItems.length === 1) {
      rawItems = [{ label: 'Sebelumnya', total: 0 }, rawItems[0]];
    }

    return rawItems;
  }, [revenueData]);

  const concertList = useMemo(() => {
    return Array.isArray(revenueData?.byConcert) ? revenueData.byConcert : [];
  }, [revenueData]);

  const handleExportCSV = () => {
    if (!revenueData) {
      toast.error('Data pendapatan belum tersedia untuk diunduh');
      return;
    }

    const now = new Date();
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Laporan Pendapatan Konser'],
      ['Tanggal Unduh', format(now, 'dd MMMM yyyy HH:mm', { locale: id })],
      [],
      ['Ringkasan'],
      ['Total Pendapatan', Number(revenueData.total || 0)],
      ['Pendapatan Bulan Ini', Number(revenueData.thisMonth || 0)],
      ['Pertumbuhan (%)', `${Number(revenueData.growth || 0)}%`],
      [],
      ['Tren Pendapatan Bulanan'],
      ['Bulan', 'Pendapatan (IDR)'],
      ...chartSeries.map((point) => [point.label, point.total]),
      [],
      ['Rincian per Konser'],
      ['Nama Konser', 'Tiket Terjual', 'Pendapatan (IDR)'],
      ...concertList.map((concert) => [
        concert.name || '-',
        Number(concert.tickets || 0),
        Number(concert.revenue || 0),
      ]),
    ];

    const csvContent = '\uFEFF' + rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-pendapatan-${format(now, 'yyyyMMdd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Laporan pendapatan berhasil diunduh');
  };

  if (loading || loadingRevenue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`
          ::-webkit-scrollbar {
            display: none;
          }
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-white animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat data pendapatan...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') return null;

  const growthVal = Number(revenueData?.growth || 0);

  // Kalkulasi koordinat SVG Diagram Garis
  const svgWidth = 860;
  const svgHeight = 270;
  const padLeft = 86;
  const padRight = 32;
  const padTop = 28;
  const padBottom = 42;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const maxChartVal = Math.max(...chartSeries.map((d) => d.total), 100000);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxChartVal * ratio),
    y: padTop + plotHeight - ratio * plotHeight,
  }));

  const chartPoints = chartSeries.map((item, idx) => {
    const xRatio = chartSeries.length === 1 ? 0.5 : idx / (chartSeries.length - 1);
    const x = padLeft + xRatio * plotWidth;
    const y = padTop + plotHeight - (item.total / maxChartVal) * plotHeight;
    return { ...item, x, y };
  });

  const linePath = buildSmoothLinePath(chartPoints);
  const areaPath =
    chartPoints.length > 0
      ? `${linePath} L ${chartPoints[chartPoints.length - 1].x} ${padTop + plotHeight} L ${
          chartPoints[0].x
        } ${padTop + plotHeight} Z`
      : '';

  const activePoint =
    hoveredIndex !== null && chartPoints[hoveredIndex]
      ? chartPoints[hoveredIndex]
      : chartPoints[chartPoints.length - 1];

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <NavbarEO />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Banner dengan Gradasi Utama */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/75">
              Ringkasan Keuangan
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Pendapatan & Penghasilan
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Pantau performa pendapatan dari penjualan tiket konser secara langsung.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaDownload className="w-3.5 h-3.5 text-white" />
            <span>Unduh Laporan</span>
          </button>
        </div>

        {/* Kartu Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Kartu 1: Total Pendapatan */}
          <div className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D19B0]/15 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Total Pendapatan
              </span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center">
                <FaWallet className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rp {Number(revenueData?.total || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-white/60 mt-1 font-medium">Akumulasi seluruh waktu</p>
          </div>

          {/* Kartu 2: Bulan Ini */}
          <div className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B900A3]/15 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Bulan Ini
              </span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center">
                <FaCalendarAlt className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rp {Number(revenueData?.thisMonth || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-white/60 mt-1 font-medium capitalize">
              {currentMonthLabel}
            </p>
          </div>

          {/* Kartu 3: Pertumbuhan */}
          <div className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D19B0]/15 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">
                Pertumbuhan
              </span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/15 flex items-center justify-center">
                <FaChartLine className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <p
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  growthVal >= 0 ? 'text-green-300' : 'text-red-300'
                }`}
              >
                {growthVal >= 0 ? `+${growthVal}%` : `${growthVal}%`}
              </p>
              <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                {growthVal >= 0 ? (
                  <FaArrowUp className="w-3.5 h-3.5 text-white" />
                ) : (
                  <FaArrowDown className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            </div>
            <p className="text-[11px] text-white/60 mt-1 font-medium">Dibandingkan bulan lalu</p>
          </div>
        </div>

        {/* Diagram Garis Performa Pendapatan */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Grafik Performa Pendapatan
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                Diagram garis tren pendapatan bulanan
              </p>
            </div>

            {activePoint && (
              <div className="bg-black/40 border border-white/15 rounded-xl px-4 py-2 text-xs flex items-center gap-3">
                <span className="text-white/65">{activePoint.label}:</span>
                <span className="font-extrabold text-white">
                  Rp {Number(activePoint.total || 0).toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto pt-2 border-t border-white/10">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full min-w-[540px] h-64 sm:h-72 overflow-visible"
              role="img"
              aria-label="Diagram garis tren pendapatan"
            >
              <defs>
                <linearGradient id="revenueLineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6D19B0" />
                  <stop offset="100%" stopColor="#B900A3" />
                </linearGradient>
                <linearGradient id="revenueAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#B900A3" stopOpacity="0.35" />
                  <stop offset="65%" stopColor="#6D19B0" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#6D19B0" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Garis Grid Horizontal & Label Sumbu Y */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={tick.y}
                    x2={svgWidth - padRight}
                    y2={tick.y}
                    stroke="rgba(255,255,255,0.08)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padLeft - 12}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.55)"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {formatCompactRupiah(tick.value)}
                  </text>
                </g>
              ))}

              {/* Area Fill di Bawah Garis */}
              {areaPath && <path d={areaPath} fill="url(#revenueAreaFill)" />}

              {/* Garis Utama */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#revenueLineStroke)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Titik Data, Penanda & Label Sumbu X */}
              {chartPoints.map((pt, idx) => {
                const isSelected = activePoint && activePoint.x === pt.x && activePoint.y === pt.y;
                return (
                  <g
                    key={`${pt.label}-${idx}`}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onClick={() => setHoveredIndex(idx)}
                  >
                    {isSelected && (
                      <line
                        x1={pt.x}
                        y1={padTop}
                        x2={pt.x}
                        y2={padTop + plotHeight}
                        stroke="rgba(255,255,255,0.22)"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                      />
                    )}

                    <circle cx={pt.x} cy={pt.y} r="18" fill="transparent" />

                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isSelected ? 7 : 5}
                      fill="#120d1d"
                      stroke="#B900A3"
                      strokeWidth="3"
                    />
                    <circle cx={pt.x} cy={pt.y} r={isSelected ? 3 : 2} fill="#FFFFFF" />

                    <text
                      x={pt.x}
                      y={pt.y - 13}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.65)'}
                      fontSize="11"
                      fontWeight={isSelected ? '700' : '500'}
                    >
                      {formatCompactRupiah(pt.total)}
                    </text>

                    <text
                      x={pt.x}
                      y={padTop + plotHeight + 24}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.65)'}
                      fontSize="11"
                      fontWeight={isSelected ? '700' : '500'}
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Rincian Pendapatan per Konser */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-base sm:text-lg font-bold text-white">Pendapatan per Konser</h3>
            <p className="text-xs text-white/60 mt-0.5">
              Rincian pendapatan berdasarkan masing-masing konser
            </p>
          </div>

          <div className="space-y-3">
            {concertList.length > 0 ? (
              concertList.map((concert, index) => {
                const totalRev = Number(revenueData?.total || 1);
                const percentage =
                  totalRev > 0 ? Math.round((Number(concert.revenue || 0) / totalRev) * 100) : 0;
                return (
                  <div
                    key={concert.id || index}
                    className="bg-black/40 border border-white/10 hover:border-white/25 p-4 sm:p-5 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                      >
                        <FaMusic className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-white tracking-tight">
                          {concert.name}
                        </p>
                        <p className="text-xs text-white/55 mt-0.5">
                          {concert.tickets || 0} tiket terjual
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-white/10">
                      <p className="font-extrabold text-white text-base">
                        Rp {Number(concert.revenue || 0).toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-white/70 font-medium mt-0.5">
                        {percentage}% dari total pendapatan
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-white/45 text-xs">
                Belum ada data rincian pendapatan konser.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}