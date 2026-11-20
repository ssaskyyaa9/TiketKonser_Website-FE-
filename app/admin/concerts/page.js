'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaCheckCircle, FaTimesCircle, FaClock, FaSpinner, FaSyncAlt, FaTimes, FaMusic, } from 'react-icons/fa';
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
  approved: 'Disetujui',
  pending: 'Menunggu',
  rejected: 'Ditolak',
};

export default function AdminConcertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // State popup moderasi konser
  const [moderationTarget, setModerationTarget] = useState(null); // { concert, action: 'approve' | 'reject' }
  const [moderating, setModerating] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchConcerts = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoadingConcerts(true);
      }

      const response = await api.get('/super-admin/concerts', {
        params: { _t: Date.now() },
      });
      if (response.data?.success) {
        setConcerts(response.data.data || []);
        if (isManualRefresh) {
          toast.success('Data konser berhasil diperbarui');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data konser');
    } finally {
      setLoadingConcerts(false);
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
      void fetchConcerts(false);
    }
  }, [user, loading, router, fetchConcerts]);

  const handleConfirmModeration = async () => {
    if (!moderationTarget?.concert?.id || !moderationTarget?.action) return;
    const { concert, action } = moderationTarget;
    setModerating(true);
    try {
      const response = await api.put(`/super-admin/concerts/${concert.id}/${action}`);
      if (response.data?.success) {
        toast.success(action === 'approve' ? 'Konser berhasil disetujui' : 'Konser berhasil ditolak');
        setModerationTarget(null);
        await fetchConcerts(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memoderasi konser');
    } finally {
      setModerating(false);
    }
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'approved':
        return {
          label: STATUS_LABELS.approved,
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
          label: STATUS_LABELS[status] || status || 'Ditolak',
          badgeClass: 'bg-white/10 text-white/75 border-white/15',
          icon: FaTimesCircle,
        };
    }
  };

  const concertStats = useMemo(() => {
    const pending = concerts.filter((c) => c.status === 'pending').length;
    const approved = concerts.filter((c) => c.status === 'approved').length;
    return {
      total: concerts.length,
      pending,
      approved,
    };
  }, [concerts]);

  if (!isMounted || loading || loadingConcerts) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat data konser...</p>
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
              Moderasi Event
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Kelola Konser
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Tinjau dan setujui event konser yang diajukan oleh organizer pada platform.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchConcerts(true)}
            disabled={refreshing}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>
        </div>

        {/* Ringkasan Cepat Konser */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Konser</span>
            <span className="text-base font-extrabold text-white">
              {concertStats.total.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Menunggu Persetujuan</span>
            <span className="text-base font-extrabold text-white">
              {concertStats.pending.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Sudah Disetujui</span>
            <span className="text-base font-extrabold text-white">
              {concertStats.approved.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Tabel Data Konser */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl text-xs sm:text-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] table-fixed text-left border-collapse">
              <thead className="bg-black/45 border-b border-white/15 text-white/70">
                <tr className="font-bold uppercase tracking-wider text-[11px]">
                  <th className="w-[30%] px-6 py-4 align-middle text-left">Nama Konser</th>
                  <th className="w-[26%] px-6 py-4 align-middle text-left">Organizer</th>
                  <th className="w-[18%] px-6 py-4 align-middle text-center">Status</th>
                  <th className="w-[26%] px-6 py-4 align-middle text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {concerts.map((concert) => {
                  const statusMeta = getStatusMeta(concert.status);
                  const StatusIcon = statusMeta.icon;

                  return (
                    <tr
                      key={concert.id}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="px-6 py-4 align-middle text-left font-bold text-white truncate">
                        {concert.name || '-'}
                      </td>
                      <td className="px-6 py-4 align-middle text-left text-white/75 truncate">
                        {concert.organizer?.name || '-'}
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-bold border inline-flex items-center justify-center gap-1.5 leading-none ${statusMeta.badgeClass}`}
                        >
                          <StatusIcon className="w-3 h-3 text-white shrink-0" />
                          <span>{statusMeta.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        {concert.status === 'pending' ? (
                          <div className="inline-flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setModerationTarget({ concert, action: 'approve' })}
                              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow transition hover:opacity-90 inline-flex items-center gap-1.5 cursor-pointer"
                              style={{
                                background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                              }}
                            >
                              <FaCheckCircle className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>Setujui</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setModerationTarget({ concert, action: 'reject' })}
                              className="px-3.5 py-2 bg-black/40 border border-white/15 hover:border-white/35 rounded-xl text-xs font-bold text-white transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <FaTimesCircle className="w-3.5 h-3.5 text-white shrink-0" />
                              <span>Tolak</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-white/45">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!concerts.length && (
                  <tr>
                    <td colSpan="4" className="px-6 py-16 text-center text-white/55">
                      Belum ada konser yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Popup Konfirmasi Moderasi Konser */}
      {moderationTarget && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!moderating) setModerationTarget(null);
          }}
        >
          <div
            className="bg-[#120d1d] border border-white/20 rounded-2xl w-full max-w-md p-6 sm:p-7 shadow-2xl text-xs sm:text-sm relative overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(circle at top right, rgba(185, 0, 163, 0.18), transparent 60%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaMusic className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {moderationTarget.action === 'approve' ? 'Setujui Konser' : 'Tolak Konser'}
                </h2>
              </div>
              <button
                type="button"
                disabled={moderating}
                onClick={() => setModerationTarget(null)}
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="my-5 space-y-3">
              <p className="text-white/75 leading-relaxed">
                {moderationTarget.action === 'approve'
                  ? 'Apakah kamu yakin ingin menyetujui dan menayangkan konser berikut?'
                  : 'Apakah kamu yakin ingin menolak pengajuan konser berikut?'}
              </p>
              <div className="rounded-xl bg-black/45 border border-white/15 p-4 space-y-1">
                <p className="font-bold text-white truncate">
                  {moderationTarget.concert?.name || '-'}
                </p>
                <p className="text-xs text-white/65 truncate">
                  Organizer: {moderationTarget.concert?.organizer?.name || '-'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={moderating}
                onClick={() => setModerationTarget(null)}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={moderating}
                onClick={() => void handleConfirmModeration()}
                className="flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                {moderating ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>
                    {moderationTarget.action === 'approve' ? 'Setujui Konser' : 'Tolak Konser'}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}