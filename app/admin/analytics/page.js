'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaSpinner, FaSyncAlt, FaChartLine, FaUsers, FaTrophy, } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function AdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAnalytics = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoadingAnalytics(true);
      }

      const response = await api.get('/super-admin/analytics', {
        params: { _t: Date.now() },
      });
      if (response.data?.success) {
        setAnalytics(response.data.data);
        if (isManualRefresh) {
          toast.success('Data analitik berhasil diperbarui');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data analitik');
    } finally {
      setLoadingAnalytics(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'super_admin') {
      void fetchAnalytics(false);
    }
  }, [user, loading, router, fetchAnalytics]);

  if (!isMounted || loading || loadingAnalytics) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat analitik...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') return null;

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

      <NavbarAdmin />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Banner */}
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-8 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at top right, rgba(185, 0, 163, 0.16), transparent 55%)',
          }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/75">
              Statistik Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Analitik
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Analisis pertumbuhan pengguna, pendapatan bulanan, dan konser terlaris.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchAnalytics(true)}
            disabled={refreshing}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>
        </div>

        {/* Grid Konten Analitik */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          {/* Pendapatan Bulanan */}
          <div className="bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                <FaChartLine className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                Pendapatan Bulanan
              </h2>
            </div>

            <div className="space-y-4">
              {analytics?.monthlyRevenue?.map((item) => {
                const amount = Number(item.total || 0);
                return (
                  <div key={item.month}>
                    <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                      <span className="text-white/70 font-medium">{item.month}</span>
                      <span className="text-white font-bold">
                        Rp {amount.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-black/45 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                          width: `${Math.min((amount / 10000000) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {!analytics?.monthlyRevenue?.length && (
                <p className="text-xs text-white/55 text-center py-6">
                  Belum ada data pendapatan bulanan.
                </p>
              )}
            </div>
          </div>

          {/* Pertumbuhan Pengguna */}
          <div className="bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                <FaUsers className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                Pertumbuhan Pengguna
              </h2>
            </div>

            <div className="space-y-4">
              {analytics?.userGrowth?.map((item) => {
                const count = Number(item.count || 0);
                return (
                  <div key={item.month}>
                    <div className="flex items-center justify-between gap-3 text-xs mb-1.5">
                      <span className="text-white/70 font-medium">{item.month}</span>
                      <span className="text-white font-bold">
                        {count.toLocaleString('id-ID')} pengguna
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-black/45 rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                          width: `${Math.min((count / 500) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {!analytics?.userGrowth?.length && (
                <p className="text-xs text-white/55 text-center py-6">
                  Belum ada data pertumbuhan pengguna.
                </p>
              )}
            </div>
          </div>

          {/* Konser Terlaris */}
          <div className="bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                <FaTrophy className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-extrabold text-sm sm:text-base text-white">
                Konser Terlaris
              </h2>
            </div>

            <div className="space-y-3">
              {analytics?.topConcerts?.length ? (
                analytics.topConcerts.map((concert, index) => (
                  <div
                    key={concert.id}
                    className="flex items-center justify-between gap-4 p-4 bg-black/40 border border-white/15 rounded-xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-[#6D19B0]/35 border border-white/15 text-xs font-extrabold text-white flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="truncate font-bold text-white">
                        {concert.name || '-'}
                      </span>
                    </div>
                    <span className="shrink-0 px-3 py-1 rounded-full text-xs font-extrabold bg-black/50 border border-white/15 text-white">
                      {Number(concert.ticketCount || 0).toLocaleString('id-ID')} tiket
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-white/55 text-center py-6">
                  Belum ada data penjualan konser.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}