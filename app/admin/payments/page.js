// src/app/admin/payments/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaSpinner
} from 'react-icons/fa';
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

export default function AdminPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

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
      fetchPayments();
    }
  }, [user, loading, router]);

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await api.get('/super-admin/payments');
      if (response.data.success) {
        setPayments(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data pembayaran');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleConfirmPayment = async (paymentId) => {
    try {
      const response = await api.put(`/super-admin/payments/${paymentId}/confirm`);
      if (response.data.success) {
        toast.success('Pembayaran berhasil dikonfirmasi');
        fetchPayments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengonfirmasi pembayaran');
    }
  };

  const handleRefundPayment = async (payment) => {
    const reason = prompt('Masukkan alasan refund:');
    if (!reason?.trim()) return;
    try {
      const response = await api.post(`/super-admin/payments/${payment.id}/refund`, {
        reason: reason.trim(),
        amount: Number(payment.amount),
      });
      if (response.data.success) {
        toast.success('Refund berhasil diproses');
        fetchPayments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memproses refund');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { color: 'text-green-300 bg-green-500/20 border-green-500/30', icon: FaCheckCircle };
      case 'pending':
        return { color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30', icon: FaClock };
      default:
        return { color: 'text-red-300 bg-red-500/20 border-red-500/30', icon: FaTimesCircle };
    }
  };

  if (loading || loadingPayments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat pembayaran...</p>
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

      {/* Navbar Admin di Atas */}
      <NavbarAdmin />

      {/* Konten Utama dengan Margin/Padding yang Aman dari Navbar */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        
        {/* Header Banner */}
        <div className="flex items-center justify-between mb-8 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Transactions</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Manage Payments</h1>
            <p className="text-xs text-white/60 mt-0.5">Kelola konfirmasi pembayaran dan permintaan refund transaksi pengguna.</p>
          </div>
        </div>

        {/* Tabel Data Pembayaran */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-black/40 border-b border-white/10 text-white/60">
                <tr className="font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {payments.map((payment) => {
                  const statusBadge = getStatusBadge(payment.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{payment.order?.user?.name || '-'}</td>
                      <td className="px-6 py-4 font-extrabold text-[#D8B4FE]">Rp {Number(payment.amount || 0).toLocaleString('id-ID')}</td>
                      <td className="px-6 py-4 text-white/70">{payment.method}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wider w-max ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 text-white" />
                          <span>{payment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {payment.status === 'pending' && (
                            <button 
                              onClick={() => handleConfirmPayment(payment.id)} 
                              className="px-3.5 py-2 bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl text-[11px] font-bold hover:bg-green-500/30 transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {payment.status === 'completed' && (
                            <button 
                              onClick={() => handleRefundPayment(payment)} 
                              className="px-3.5 py-2 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-[11px] font-bold hover:bg-red-500/30 transition-colors cursor-pointer"
                            >
                              Refund
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!payments.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-white/50">
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}