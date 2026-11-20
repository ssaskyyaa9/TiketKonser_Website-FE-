'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaFileAlt, FaDownload, FaSpinner, FaUsers, FaBuilding, FaMusic, FaMoneyBillWave, FaSyncAlt, } from 'react-icons/fa';
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

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [reports, setReports] = useState(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingReport, setExportingReport] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchReports = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoadingReports(true);
      }

      const response = await api.get('/super-admin/reports', {
        params: { type: 'overview', _t: Date.now() },
      });
      if (response.data?.success) {
        setReports(response.data.data);
        if (isManualRefresh) {
          toast.success('Ringkasan laporan berhasil diperbarui');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat ringkasan laporan');
    } finally {
      setLoadingReports(false);
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
      void fetchReports(false);
    }
  }, [user, loading, router, fetchReports]);

  const downloadSalesReport = async () => {
    try {
      setExportingReport('payments');
      const response = await api.get('/super-admin/reports', {
        params: { type: 'payments' },
      });
      const rows = Array.isArray(response.data?.data) ? response.data.data : [];
      if (!rows.length) {
        toast.error('Tidak ada data untuk diunduh');
        return;
      }

      const columns = [
        'ID Pembayaran',
        'Tanggal',
        'Pelanggan',
        'Email',
        'Konser',
        'Metode',
        'Status',
        'Jumlah',
        'Jumlah Refund',
      ];
      const values = rows.map((row) => [
        row.id,
        row.createdAt,
        row.order?.user?.name,
        row.order?.user?.email,
        row.order?.concert?.name,
        row.method,
        row.status,
        row.amount,
        row.refundAmount,
      ]);
      const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
      const csv = [columns, ...values]
        .map((row) => row.map(escapeCsv).join(','))
        .join('\r\n');
      const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-penjualan-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Laporan berhasil diunduh');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh laporan');
    } finally {
      setExportingReport('');
    }
  };

  if (!isMounted || loading || loadingReports) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') return null;

  const summaryCards = [
    {
      label: 'Total Pengguna',
      value: Number(reports?.totalUsers || 0).toLocaleString('id-ID'),
      icon: FaUsers,
    },
    {
      label: 'Organizer',
      value: Number(reports?.totalOrganizers || 0).toLocaleString('id-ID'),
      icon: FaBuilding,
    },
    {
      label: 'Konser',
      value: Number(reports?.totalConcerts || 0).toLocaleString('id-ID'),
      icon: FaMusic,
    },
    {
      label: 'Pendapatan Selesai',
      value: `Rp ${Number(reports?.totalRevenue || 0).toLocaleString('id-ID')}`,
      icon: FaMoneyBillWave,
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
              Laporan Platform
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Laporan & Ekspor
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Lihat ringkasan laporan operasional sistem dan unduh rekap transaksi secara langsung.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchReports(true)}
            disabled={refreshing}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>
        </div>

        {/* Kartu Ringkasan Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 text-xs sm:text-sm">
          {summaryCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <div
                key={idx}
                className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl flex flex-col justify-between"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-white/65">
                    {card.label}
                  </span>
                  <div
                    className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    <IconComponent className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-extrabold text-white truncate">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Kartu Unduh Laporan */}
        <div className="grid grid-cols-1 gap-6 max-w-xl">
          <div className="bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                <FaFileAlt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-extrabold text-sm sm:text-base text-white">
                  Laporan Penjualan & Pembayaran
                </h2>
                <p className="text-xs text-white/60 mt-0.5">
                  Daftar transaksi lengkap, status pembayaran, dan nominal refund dalam format CSV.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={Boolean(exportingReport)}
              onClick={() => void downloadSalesReport()}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              {exportingReport === 'payments' ? (
                <>
                  <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Menyiapkan CSV...</span>
                </>
              ) : (
                <>
                  <FaDownload className="w-3.5 h-3.5 text-white" />
                  <span>Unduh CSV</span>
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}