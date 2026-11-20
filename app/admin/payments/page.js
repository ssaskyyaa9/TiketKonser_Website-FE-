'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaSyncAlt, FaTimes, FaMoneyBillWave, FaUndo, } from 'react-icons/fa';
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

const STATUS_LABELS = {
  completed: 'Selesai',
  pending: 'Menunggu',
  refunded: 'Dikembalikan',
  failed: 'Gagal',
  cancelled: 'Dibatalkan',
};

export default function AdminPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State popup konfirmasi pembayaran
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState('');

  // State popup refund pembayaran
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);
  const [refundError, setRefundError] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchPayments = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoadingPayments(true);
      }

      const response = await api.get('/super-admin/payments', {
        params: { _t: Date.now() },
      });
      if (response.data?.success) {
        setPayments(response.data.data || []);
        if (isManualRefresh) {
          toast.success('Data pembayaran berhasil diperbarui');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data pembayaran');
    } finally {
      setLoadingPayments(false);
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
      void fetchPayments(false);
    }
  }, [user, loading, router, fetchPayments]);

  const handleConfirmPayment = async () => {
    if (!confirmTarget?.id || confirming) return;
    setConfirming(true);
    setConfirmError('');
    try {
      const response = await api.put(`/super-admin/payments/${confirmTarget.id}/confirm`);
      if (response.data?.success) {
        toast.success('Pembayaran berhasil dikonfirmasi');
        setConfirmTarget(null);
        await fetchPayments(false);
      } else {
        const msg = response.data?.message || 'Gagal mengonfirmasi pembayaran';
        setConfirmError(msg);
        toast.error(msg);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Gagal mengonfirmasi pembayaran';
      setConfirmError(msg);
      toast.error(msg);
    } finally {
      setConfirming(false);
    }
  };

  const handleConfirmRefund = async () => {
    if (!refundTarget?.id || refunding) return;
    const trimmedReason = refundReason.trim();
    if (!trimmedReason) {
      const msg = 'Alasan refund wajib diisi';
      setRefundError(msg);
      toast.error(msg);
      return;
    }

    setRefunding(true);
    setRefundError('');
    try {
      const response = await api.post(`/super-admin/payments/${refundTarget.id}/refund`, {
        reason: trimmedReason,
        amount: Number(refundTarget.amount || 0),
      });
      if (response.data?.success) {
        toast.success('Refund berhasil diproses');
        setRefundTarget(null);
        setRefundReason('');
        setRefundError('');
        await fetchPayments(false);
      } else {
        const msg = response.data?.message || 'Gagal memproses refund';
        setRefundError(msg);
        toast.error(msg);
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Gagal memproses refund';
      setRefundError(msg);
      toast.error(msg);
    } finally {
      setRefunding(false);
    }
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'completed':
        return {
          label: STATUS_LABELS.completed,
          badgeClass: 'bg-[#6D19B0]/35 text-white border-white/20',
          icon: FaCheckCircle,
        };
      case 'pending':
        return {
          label: STATUS_LABELS.pending,
          badgeClass: 'bg-[#B900A3]/25 text-white border-white/20',
          icon: FaClock,
        };
      default:
        return {
          label: STATUS_LABELS[status] || status || 'Gagal',
          badgeClass: 'bg-white/10 text-white/75 border-white/15',
          icon: FaTimesCircle,
        };
    }
  };

  const paymentSummary = useMemo(() => {
    const completed = payments.filter((p) => p.status === 'completed');
    const pendingCount = payments.filter((p) => p.status === 'pending').length;
    const totalCompletedAmount = completed.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    return {
      totalCount: payments.length,
      pendingCount,
      totalCompletedAmount,
    };
  }, [payments]);

  if (!isMounted || loading || loadingPayments) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat pembayaran...</p>
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
              Transaksi
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Kelola Pembayaran
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Kelola konfirmasi pembayaran dan permintaan refund transaksi pengguna.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchPayments(true)}
            disabled={refreshing}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>
        </div>

        {/* Ringkasan Cepat Pembayaran */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Transaksi</span>
            <span className="text-base font-extrabold text-white">
              {paymentSummary.totalCount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Menunggu Konfirmasi</span>
            <span className="text-base font-extrabold text-white">
              {paymentSummary.pendingCount.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Pembayaran Selesai</span>
            <span className="text-base font-extrabold text-white">
              Rp {paymentSummary.totalCompletedAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Tabel Data Pembayaran */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl text-xs sm:text-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] table-fixed text-left border-collapse">
              <thead className="bg-black/45 border-b border-white/15 text-white/70">
                <tr className="font-bold uppercase tracking-wider text-[11px]">
                  <th className="w-[24%] px-6 py-4 align-middle text-left">Pengguna</th>
                  <th className="w-[20%] px-6 py-4 align-middle text-left">Nominal</th>
                  <th className="w-[18%] px-6 py-4 align-middle text-left">Metode</th>
                  <th className="w-[18%] px-6 py-4 align-middle text-center">Status</th>
                  <th className="w-[20%] px-6 py-4 align-middle text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {payments.map((payment) => {
                  const statusMeta = getStatusMeta(payment.status);
                  const StatusIcon = statusMeta.icon;

                  return (
                    <tr key={payment.id} className="hover:bg-white/[0.04] transition-colors" >
                      <td className="px-6 py-4 align-middle text-left font-bold text-white truncate">
                        {payment.order?.user?.name || '-'}
                      </td>

                      <td className="px-6 py-4 align-middle text-left font-extrabold text-white truncate">
                        Rp {Number(payment.amount || 0).toLocaleString('id-ID')}
                      </td>

                      <td className="px-6 py-4 align-middle text-left text-white/75 truncate">
                        {payment.method || '-'}
                      </td>

                      <td className="px-6 py-4 align-middle text-center">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold border inline-flex items-center justify-center gap-1.5 leading-none ${statusMeta.badgeClass}`} >
                          <StatusIcon className="w-3 h-3 text-white shrink-0" />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        {payment.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmError('');
                              setConfirmTarget(payment);
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow transition hover:opacity-90 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                            style={{
                              background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                            }}
                          >
                            <FaCheckCircle className="w-3.5 h-3.5 text-white shrink-0" />
                            <span>Konfirmasi</span>
                          </button>
                        ) : payment.status === 'completed' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundError('');
                              setRefundTarget(payment);
                              setRefundReason('');
                            }}
                            className="px-3.5 py-2 bg-black/40 border border-white/15 hover:border-white/35 rounded-xl text-xs font-bold text-white transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <FaUndo className="w-3 h-3 text-white shrink-0" />
                            <span>Refund</span>
                          </button>
                        ) : (
                          <span className="text-xs text-white/45">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!payments.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-white/55">
                      Belum ada data pembayaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Popup Konfirmasi Pembayaran */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 pointer-events-auto"
          onClick={() => {
            if (!confirming) setConfirmTarget(null);
          }}
        >
          <div className="relative z-10 pointer-events-auto bg-[#120d1d] border border-white/20 rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl text-xs sm:text-sm" onClick={(e) => e.stopPropagation()} >
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaMoneyBillWave className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Konfirmasi Pembayaran
                </h2>
              </div>
              <button
                type="button"
                disabled={confirming}
                onClick={() => setConfirmTarget(null)}
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="my-5 space-y-3">
              <p className="text-white/75 leading-relaxed">
                Apakah kamu yakin ingin mengonfirmasi pembayaran transaksi berikut?
              </p>
              <div className="rounded-xl bg-black/45 border border-white/15 p-4 space-y-1.5">
                <p className="font-bold text-white truncate">
                  {confirmTarget.order?.user?.name || '-'}
                </p>
                <p className="text-xs text-white/75">
                  Nominal: Rp {Number(confirmTarget.amount || 0).toLocaleString('id-ID')}
                </p>
                <p className="text-xs text-white/60">
                  Metode: {confirmTarget.method || '-'}
                </p>
              </div>
              {confirmError && (
                <p className="text-xs text-white bg-black/50 border border-white/25 rounded-xl px-3.5 py-2.5">
                  {confirmError}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={confirming}
                onClick={() => setConfirmTarget(null)}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={confirming}
                onClick={() => void handleConfirmPayment()}
                className="flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                {confirming ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Konfirmasi Bayar</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup Alasan Refund Pembayaran */}
      {refundTarget && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4 pointer-events-auto"
          onClick={() => {
            if (!refunding) {
              setRefundTarget(null);
              setRefundReason('');
              setRefundError('');
            }
          }}
        >
          <div
            className="relative z-10 pointer-events-auto bg-[#120d1d] border border-white/20 rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl text-xs sm:text-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaUndo className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">Proses Refund</h2>
              </div>
              <button
                type="button"
                disabled={refunding}
                onClick={() => {
                  setRefundTarget(null);
                  setRefundReason('');
                  setRefundError('');
                }}
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl bg-black/45 border border-white/15 p-3.5 space-y-1">
                <p className="font-bold text-white truncate">
                  {refundTarget.order?.user?.name || '-'}
                </p>
                <p className="text-xs text-white/70">
                  Nominal Refund: Rp {Number(refundTarget.amount || 0).toLocaleString('id-ID')}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-white/85 mb-1.5">
                  Alasan Refund <span className="text-white">*</span>
                </label>
                <textarea
                  rows="3"
                  value={refundReason}
                  onChange={(e) => {
                    setRefundReason(e.target.value);
                    if (refundError) setRefundError('');
                  }}
                  suppressHydrationWarning
                  placeholder="Tuliskan alasan pengembalian dana transaksi..."
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                />
              </div>

              {refundError && (
                <p className="text-xs text-white bg-black/50 border border-white/25 rounded-xl px-3.5 py-2.5">
                  {refundError}
                </p>
              )}

              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  disabled={refunding}
                  onClick={() => {
                    setRefundTarget(null);
                    setRefundReason('');
                    setRefundError('');
                  }}
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={refunding}
                  onClick={() => void handleConfirmRefund()}
                  className="flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {refunding ? (
                    <>
                      <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <span>Konfirmasi Refund</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}