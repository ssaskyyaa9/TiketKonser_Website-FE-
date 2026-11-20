// src/app/organizer/analytics/page.js
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import {
  FaTicketAlt,
  FaMoneyBillWave,
  FaStar,
  FaSpinner,
  FaUsers,
  FaEye,
  FaCalendar,
  FaShoppingCart,
  FaChartLine,
} from 'react-icons/fa';
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

const formatDayLabel = (rawDate, index) => {
  if (!rawDate) return `Hari ${index + 1}`;
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return String(rawDate);
  return parsed.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoadingAnalytics(true);
      const response = await api.get('/organizer/analytics');
      if (response.data?.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data analitik');
    } finally {
      setLoadingAnalytics(false);
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
      void fetchAnalytics();
    }
  }, [user, loading, router, fetchAnalytics]);

  const salesSeries = useMemo(() => {
    const rows = Array.isArray(analytics?.dailySales) ? analytics.dailySales : [];
    const mapped = rows.map((item, idx) => ({
      label: formatDayLabel(item.date || item.label, idx),
      sales: Number(item.sales ?? item.tickets ?? item.count ?? 0),
    }));

    if (mapped.length === 0) {
      const totalSold = Number(analytics?.totalTicketsSold || 0);
      return [
        { label: 'Awal', sales: 0 },
        { label: 'Terbaru', sales: totalSold },
      ];
    }
    if (mapped.length === 1) {
      return [{ label: 'Sebelumnya', sales: 0 }, mapped[0]];
    }
    return mapped;
  }, [analytics]);

  if (loading || loadingAnalytics) {
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
          <p className="mt-4 text-white/65 text-xs sm:text-sm">Memuat data analitik...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  // Kalkulasi koordinat SVG Diagram Garis
  const svgWidth = 860;
  const svgHeight = 250;
  const padLeft = 54;
  const padRight = 28;
  const padTop = 26;
  const padBottom = 40;
  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const maxSalesVal = Math.max(...salesSeries.map((d) => d.sales), 10);
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    value: Math.round(maxSalesVal * ratio),
    y: padTop + plotHeight - ratio * plotHeight,
  }));

  const chartPoints = salesSeries.map((item, idx) => {
    const xRatio = salesSeries.length === 1 ? 0.5 : idx / (salesSeries.length - 1);
    const x = padLeft + xRatio * plotWidth;
    const y = padTop + plotHeight - (item.sales / maxSalesVal) * plotHeight;
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

  const statCards = [
    {
      label: 'Tiket Terjual',
      value: `${Number(analytics?.totalTicketsSold || 0).toLocaleString('id-ID')} Tiket`,
      icon: FaTicketAlt,
    },
    {
      label: 'Total Pendapatan',
      value: `Rp ${Number(analytics?.totalRevenue || 0).toLocaleString('id-ID')}`,
      icon: FaMoneyBillWave,
    },
    {
      label: 'Rata-Rata Rating',
      value: `${analytics?.averageRating || 0} / 5.0`,
      icon: FaStar,
    },
    {
      label: 'Tingkat Konversi',
      value: `${analytics?.conversionRate || 0}%`,
      icon: FaShoppingCart,
    },
  ];

  const bottomStats = [
    {
      label: 'Total Kunjungan Halaman',
      value: Number(analytics?.views || 0).toLocaleString('id-ID'),
      icon: FaEye,
    },
    {
      label: 'Total Konser Dibuat',
      value: `${Number(analytics?.totalConcerts || 0).toLocaleString('id-ID')} Konser`,
      icon: FaUsers,
    },
    {
      label: 'Konser Akan Datang',
      value: `${Number(analytics?.upcomingConcerts || 0).toLocaleString('id-ID')} Konser`,
      icon: FaCalendar,
    },
  ];

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
        {/* Header Banner */}
        <div className="bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/75">
            Laporan Performa
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Analitik Konser
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Pantau statistik penjualan tiket, pendapatan, dan performa konser kamu.
          </p>
        </div>

        {/* Kartu Statistik Utama */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 shadow-xl relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-white/60 truncate">{card.label}</p>
                    <p className="text-lg sm:text-xl font-extrabold text-white mt-1.5 truncate">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/15 shadow-md"
                    style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    <IconComponent className="text-white w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagram Garis Penjualan Harian */}
        <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15 shrink-0"
                style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                <FaChartLine className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Grafik Penjualan Tiket Harian
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Tren jumlah tiket terjual harian
                </p>
              </div>
            </div>

            {activePoint && (
              <div className="bg-black/40 border border-white/15 rounded-xl px-4 py-2 text-xs flex items-center gap-2.5">
                <span className="text-white/65">{activePoint.label}:</span>
                <span className="font-extrabold text-white">
                  {Number(activePoint.sales || 0).toLocaleString('id-ID')} tiket
                </span>
              </div>
            )}
          </div>

          <div className="w-full overflow-x-auto pt-2 border-t border-white/10">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full min-w-[540px] h-60 sm:h-68 overflow-visible"
              role="img"
              aria-label="Grafik garis penjualan tiket harian"
            >
              <defs>
                <linearGradient id="analyticsLineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6D19B0" />
                  <stop offset="100%" stopColor="#B900A3" />
                </linearGradient>
                <linearGradient id="analyticsAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#B900A3" stopOpacity="0.35" />
                  <stop offset="65%" stopColor="#6D19B0" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#6D19B0" stopOpacity="0" />
                </linearGradient>
              </defs>

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
                    x={padLeft - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="rgba(255,255,255,0.55)"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    {tick.value}
                  </text>
                </g>
              ))}

              {areaPath && <path d={areaPath} fill="url(#analyticsAreaFill)" />}

              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="url(#analyticsLineStroke)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

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
                      y={pt.y - 12}
                      textAnchor="middle"
                      fill={isSelected ? '#FFFFFF' : 'rgba(255,255,255,0.65)'}
                      fontSize="11"
                      fontWeight={isSelected ? '700' : '500'}
                    >
                      {pt.sales}
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

        {/* Kategori Tiket & Konser Terbaik */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Tiket per Kategori */}
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 sm:p-7 shadow-xl">
            <h2 className="text-base sm:text-lg font-bold text-white mb-1">
              Penjualan per Kategori Tiket
            </h2>
            <p className="text-xs text-white/60 mb-5">
              Distribusi tiket terjual dan pendapatan tiap kategori
            </p>

            {Array.isArray(analytics?.ticketsByCategory) && analytics.ticketsByCategory.length > 0 ? (
              <div className="space-y-4 text-xs sm:text-sm">
                {analytics.ticketsByCategory.map((item, index) => {
                  const totalSold = Math.max(Number(analytics?.totalTicketsSold || 0), 1);
                  const soldCount = Number(item.sold || 0);
                  const widthPercent = Math.min(100, Math.round((soldCount / totalSold) * 100));

                  return (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-black/35 p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-bold text-white">{item.category}</span>
                        <span className="text-white/75 font-semibold">
                          {soldCount.toLocaleString('id-ID')} tiket ({widthPercent}%)
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${widthPercent}%`,
                            background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                          }}
                        />
                      </div>
                      <p className="text-xs text-white/65 font-medium">
                        Pendapatan: Rp {Number(item.revenue || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-white/50">
                Belum ada data penjualan per kategori tiket.
              </div>
            )}
          </div>

          {/* Konser dengan Performa Terbaik */}
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 sm:p-7 shadow-xl">
            <h2 className="text-base sm:text-lg font-bold text-white mb-1">
              Konser Performa Terbaik
            </h2>
            <p className="text-xs text-white/60 mb-5">
              Daftar konser dengan penjualan tiket dan pendapatan tertinggi
            </p>

            {Array.isArray(analytics?.topConcerts) && analytics.topConcerts.length > 0 ? (
              <div className="space-y-3 text-xs sm:text-sm">
                {analytics.topConcerts.map((concert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl border border-white/10 bg-black/35 hover:border-white/25 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white truncate">{concert.name}</p>
                      <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                        <span>{Number(concert.tickets || 0).toLocaleString('id-ID')} tiket</span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1 text-white/80">
                          <FaStar className="w-3 h-3 text-white" />
                          {concert.rating || 0}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-white">
                        Rp {Number(concert.revenue || 0).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-xs text-white/50">
                Belum ada data konser performa terbaik.
              </div>
            )}
          </div>
        </div>

        {/* Statistik Ringkas Bawah */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {bottomStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 shadow-xl flex items-center gap-4"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border border-white/15"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <IconComponent className="text-white w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/60 truncate">{stat.label}</p>
                  <p className="text-sm sm:text-base font-extrabold text-white mt-0.5 truncate">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}