'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarAdmin from '../../../components/NavbarAdmin';
import toast from 'react-hot-toast';
import { FaUsers, FaBuilding, FaClock, FaMoneyBillWave, FaSpinner, FaUserCheck, FaSyncAlt, FaArrowRight, FaShieldAlt, } from 'react-icons/fa';
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

const ROLE_LABELS = {
  admin: 'Admin',
  super_admin: 'Super Admin',
  organizer: 'Organizer',
  customer: 'Pengguna',
  user: 'Pengguna',
};

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDashboard = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoadingData(true);
      }

      const params = { _t: Date.now() };
      let response;

      try {
        response = await api.get('/admin/dashboard', { params });
      } catch {
        response = await api.get('/super-admin/dashboard', { params });
      }

      const payload = response?.data?.data ?? response?.data ?? null;
      if (payload) {
        setDashboardData(payload);
        if (isManualRefresh) {
          toast.success('Data dasbor berhasil diperbarui');
        }
      } else if (isManualRefresh) {
        toast.error('Respons data dasbor kosong');
      }
    } catch (error) {
      if (isManualRefresh) {
        toast.error(error.response?.data?.message || 'Gagal memuat ulang data dasbor');
      }
    } finally {
      setLoadingData(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    const isAllowedRole = user && (user.role === 'admin' || user.role === 'super_admin');
    if (user && !isAllowedRole) {
      router.push('/dashboard');
      return;
    }
    if (isAllowedRole) {
      void fetchDashboard(false);
    }
  }, [user, loading, router, fetchDashboard]);

  if (!isMounted || loading || loadingData) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat dasbor admin...</p>
        </div>
      </div>
    );
  }

  const isAllowedRole = user && (user.role === 'admin' || user.role === 'super_admin');
  if (!isAllowedRole) return null;

  const rawStats = dashboardData?.stats || dashboardData || {};
  const stats = {
    totalUsers: Number(rawStats.totalUsers ?? 0),
    totalOrganizers: Number(rawStats.totalOrganizers ?? 0),
    pendingOrganizers: Number(rawStats.pendingOrganizers ?? 0),
    pendingConcerts: Number(rawStats.pendingConcerts ?? 0),
    pendingVerifications:
      Number(rawStats.pendingOrganizers ?? 0) + Number(rawStats.pendingConcerts ?? 0),
    totalRevenue: Number(rawStats.totalRevenue ?? 0),
  };

  const statCards = [
    {
      label: 'Total Pengguna',
      value: stats.totalUsers.toLocaleString('id-ID'),
      href: '/admin/users',
      icon: FaUsers,
    },
    {
      label: 'Total Organizer',
      value: stats.totalOrganizers.toLocaleString('id-ID'),
      href: '/admin/organizers',
      icon: FaBuilding,
    },
    {
      label: 'Menunggu Verifikasi',
      value: stats.pendingVerifications.toLocaleString('id-ID'),
      href: '/admin/concerts',
      icon: FaClock,
    },
    {
      label: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      href: '/admin/analytics',
      icon: FaMoneyBillWave,
    },
  ];

  const recentUsers = Array.isArray(dashboardData?.recentUsers)
    ? dashboardData.recentUsers.slice(0, 5)
    : [];

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
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at top right, rgba(185, 0, 163, 0.16), transparent 55%)',
          }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/75">
              Ringkasan Admin
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Dasbor Admin
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Pantau statistik pengguna, penyelenggara konser, antrean verifikasi, dan pendapatan platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchDashboard(true)}
            disabled={refreshing}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>
        </div>

        {/* Kartu Statistik Utama (Bisa Diklik Satu per Satu) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <Link
                key={idx}
                href={card.href}
                aria-label={`${card.label}: ${card.value}`}
                className="group bg-[#120d1d] border border-white/15 hover:border-white/35 hover:-translate-y-0.5 p-6 rounded-2xl shadow-xl transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-bold text-white/65 group-hover:text-white transition-colors uppercase tracking-wider">
                    {card.label}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex items-end justify-between gap-2">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white truncate">
                    {card.value}
                  </p>
                  <FaArrowRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 mb-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Grid Dua Kolom: Aktivitas Terbaru & Antrean Verifikasi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Aktivitas Pengguna Terbaru */}
          <div className="lg:col-span-2 bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">Aktivitas Terbaru</h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Akun yang baru terdaftar di sistem
                </p>
              </div>
              <Link
                href="/admin/users"
                className="text-xs font-semibold text-white/80 hover:text-white inline-flex items-center gap-1.5"
              >
                <span>Kelola Pengguna</span>
                <FaArrowRight className="w-3 h-3 text-white" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentUsers.length > 0 ? (
                recentUsers.map((userItem) => (
                  <div
                    key={userItem.id}
                    className="flex items-center justify-between gap-3.5 p-4 bg-black/40 border border-white/10 rounded-xl text-xs sm:text-sm"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                      >
                        <FaUserCheck className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{userItem.name} terdaftar</p>
                        <p className="text-xs text-white/55 mt-0.5 truncate">
                          Peran: {ROLE_LABELS[userItem.role] || userItem.role} ·{' '}
                          {userItem.createdAt
                            ? new Date(userItem.createdAt).toLocaleDateString('id-ID')
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs sm:text-sm text-white/55 text-center py-8">
                  Belum ada aktivitas terbaru.
                </p>
              )}
            </div>
          </div>

          {/* Ringkasan Antrean Verifikasi */}
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaShieldAlt className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Verifikasi Konser</h2>
                  <p className="text-xs text-white/60">Persetujuan yang perlu ditinjau</p>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-white/70">Organizer Menunggu</span>
                  <span className="font-extrabold text-white">
                    {stats.pendingOrganizers.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-white/70">Konser Menunggu</span>
                  <span className="font-extrabold text-white">
                    {stats.pendingConcerts.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/admin/concerts"
              className="mt-6 w-full rounded-xl py-3 px-4 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <span>Tinjau Konser</span>
              <FaArrowRight className="w-3.5 h-3.5 text-white" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}