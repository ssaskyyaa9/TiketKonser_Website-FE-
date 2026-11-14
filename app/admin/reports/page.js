// src/app/admin/reports/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaFileAlt, FaDownload, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function AdminReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = useState(null);
  const [loadingReports, setLoadingReports] = useState(true);
  const [exportingReport, setExportingReport] = useState('');

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
      fetchReports();
    }
  }, [user, loading, router]);

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
      const response = await api.get('/super-admin/reports?type=overview');
      if (response.data.success) {
        setReports(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat ringkasan laporan');
    } finally {
      setLoadingReports(false);
    }
  };

  const downloadSalesReport = async () => {
    try {
      setExportingReport('payments');
      const response = await api.get('/super-admin/reports', { params: { type: 'payments' } });
      const rows = Array.isArray(response.data.data) ? response.data.data : [];
      if (!rows.length) {
        toast.error('Tidak ada data untuk diunduh');
        return;
      }

      const columns = ['ID Pembayaran', 'Tanggal', 'Pelanggan', 'Email', 'Konser', 'Metode', 'Status', 'Jumlah', 'Jumlah Refund'];
      const values = rows.map((row) => [
        row.id,
        row.createdAt,
        row.order?.user?.name,
        row.order?.user?.email,
        row.order?.concert?.name,
        row.method,
        row.status,
        row.amount,
        row.refundAmount
      ]);
      const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
      const csv = [columns, ...values].map((row) => row.map(escapeCsv).join(',')).join('\r\n');
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
      toast.error('Gagal mengunduh laporan');
    } finally {
      setExportingReport('');
    }
  };

  if (loading || loadingReports) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <NavbarAdmin />

      <main className="ml-64 p-8 max-w-7xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-8 bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Platform Reports</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Reports & Export</h1>
            <p className="text-xs text-white/60 mt-0.5">Unduh dan lihat ringkasan laporan operasional sistem.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 text-xs">
          <div className="bg-[#120d1d] border border-white/15 p-5 rounded-2xl shadow-xl">
            <p className="text-white/60">Total Pengguna</p>
            <p className="mt-1 text-xl font-extrabold text-white">{Number(reports?.totalUsers || 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-[#120d1d] border border-white/15 p-5 rounded-2xl shadow-xl">
            <p className="text-white/60">Organizer</p>
            <p className="mt-1 text-xl font-extrabold text-white">{Number(reports?.totalOrganizers || 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-[#120d1d] border border-white/15 p-5 rounded-2xl shadow-xl">
            <p className="text-white/60">Konser</p>
            <p className="mt-1 text-xl font-extrabold text-white">{Number(reports?.totalConcerts || 0).toLocaleString('id-ID')}</p>
          </div>
          <div className="bg-[#120d1d] border border-white/15 p-5 rounded-2xl shadow-xl">
            <p className="text-white/60">Pendapatan Selesai</p>
            <p className="mt-1 text-xl font-extrabold text-[#D8B4FE]">Rp {Number(reports?.totalRevenue || 0).toLocaleString('id-ID')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 max-w-xl">
          <div className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#6D19B0]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-white shrink-0">
                <FaFileAlt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">Sales & Payment Report</h3>
                <p className="text-xs text-white/60 mt-0.5">Daftar transaksi, status, dan nilai pembayaran</p>
              </div>
            </div>
            <button 
              disabled={Boolean(exportingReport)} 
              onClick={downloadSalesReport} 
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              {exportingReport === 'payments' ? (
                <>
                  <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Menyiapkan...</span>
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