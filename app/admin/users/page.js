'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaCheckCircle, FaTimesCircle, FaClock, FaEdit, FaTrash, FaSearch, FaSpinner, FaSyncAlt, FaExclamationTriangle, FaTimes, } from 'react-icons/fa';
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

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  organizer: 'Organizer',
  customer: 'Pengguna',
  user: 'Pengguna',
};

const STATUS_LABELS = {
  active: 'Aktif',
  pending: 'Menunggu',
  blocked: 'Diblokir',
};

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // State popup konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingUser, setDeletingUser] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchUsers = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoadingUsers(true);
      }

      const response = await api.get('/super-admin/users', {
        params: { _t: Date.now() },
      });
      if (response.data?.success) {
        setUsers(response.data.data || []);
        if (isManualRefresh) {
          toast.success('Data pengguna berhasil diperbarui');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data pengguna');
    } finally {
      setLoadingUsers(false);
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
      void fetchUsers(false);
    }
  }, [user, loading, router, fetchUsers]);

  const handleToggleUserStatus = async (userItem) => {
    const nextStatus = userItem.status === 'blocked' ? 'active' : 'blocked';
    try {
      const response = await api.put(`/super-admin/users/${userItem.id}`, {
        name: userItem.name,
        email: userItem.email,
        phone: userItem.phone,
        role: userItem.role,
        status: nextStatus,
      });
      if (response.data?.success) {
        toast.success(
          nextStatus === 'blocked' ? 'Akun berhasil diblokir' : 'Blokir akun dibuka'
        );
        await fetchUsers(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status akun');
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!deleteTarget?.id) return;
    setDeletingUser(true);
    try {
      const response = await api.delete(`/super-admin/users/${deleteTarget.id}`);
      if (response.data?.success) {
        toast.success('Akun pengguna berhasil dihapus');
        setDeleteTarget(null);
        await fetchUsers(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus akun');
    } finally {
      setDeletingUser(false);
    }
  };

  const getStatusMeta = (status) => {
    switch (status) {
      case 'active':
        return {
          label: STATUS_LABELS.active,
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
          label: STATUS_LABELS[status] || status || 'Diblokir',
          badgeClass: 'bg-white/10 text-white/75 border-white/15',
          icon: FaTimesCircle,
        };
    }
  };

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    return users.filter((userItem) => {
      const matchesRole =
        roleFilter === 'all' ||
        (roleFilter === 'customer'
          ? userItem.role === 'customer' || userItem.role === 'user'
          : userItem.role === roleFilter);

      const matchesQuery =
        !query ||
        [
          userItem.name,
          userItem.email,
          userItem.role,
          ROLE_LABELS[userItem.role],
          userItem.status,
          STATUS_LABELS[userItem.status],
        ].some((value) => String(value || '').toLowerCase().includes(query));

      return matchesRole && matchesQuery;
    });
  }, [users, userSearch, roleFilter]);

  const userSummary = useMemo(() => {
    const activeCount = users.filter((u) => u.status === 'active').length;
    const blockedCount = users.filter((u) => u.status === 'blocked').length;
    return {
      total: users.length,
      active: activeCount,
      blocked: blockedCount,
    };
  }, [users]);

  if (!isMounted || loading || loadingUsers) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat data pengguna...</p>
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
              Manajemen Pengguna
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Kelola Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Kelola seluruh akun pengguna terdaftar, ubah status blokir, atau hapus akun secara terpusat.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchUsers(true)}
            disabled={refreshing}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-60"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaSyncAlt className={`w-3.5 h-3.5 text-white ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Memuat...' : 'Muat Ulang'}</span>
          </button>
        </div>

        {/* Ringkasan Cepat Pengguna */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Akun Terdaftar</span>
            <span className="text-base font-extrabold text-white">
              {userSummary.total.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Akun Aktif</span>
            <span className="text-base font-extrabold text-white">
              {userSummary.active.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Akun Diblokir</span>
            <span className="text-base font-extrabold text-white">
              {userSummary.blocked.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/65 w-3.5 h-3.5" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Cari nama, email, peran, atau status..."
              suppressHydrationWarning
              className="w-full pl-11 pr-4 py-3 bg-[#120d1d] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>

          <div className="w-full sm:w-60">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              aria-label="Filter peran pengguna"
              suppressHydrationWarning
              className="w-full py-3 px-4 bg-[#120d1d] border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
            >
              <option value="all">Semua Peran</option>
              <option value="customer">Pengguna</option>
              <option value="organizer">Organizer</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
        </div>

        {/* Tabel Data Pengguna */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl text-xs sm:text-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] table-fixed text-left border-collapse">
              <thead className="bg-black/45 border-b border-white/15 text-white/70">
                <tr className="font-bold uppercase tracking-wider text-[11px]">
                  <th className="w-[22%] px-6 py-4 align-middle text-left">Nama</th>
                  <th className="w-[28%] px-6 py-4 align-middle text-left">Email</th>
                  <th className="w-[17%] px-6 py-4 align-middle text-center">Peran</th>
                  <th className="w-[16%] px-6 py-4 align-middle text-center">Status</th>
                  <th className="w-[17%] px-6 py-4 align-middle text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredUsers.map((userItem) => {
                  const statusMeta = getStatusMeta(userItem.status);
                  const StatusIcon = statusMeta.icon;
                  const isProtectedRole = userItem.role === 'super_admin';

                  return (
                    <tr
                      key={userItem.id}
                      className="hover:bg-white/[0.04] transition-colors"
                    >
                      <td className="px-6 py-4 align-middle text-left font-bold text-white truncate">
                        {userItem.name || '-'}
                      </td>
                      <td className="px-6 py-4 align-middle text-left text-white/75 truncate">
                        {userItem.email || '-'}
                      </td>
                      <td className="px-6 py-4 align-middle text-center">
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-black/45 border border-white/15 text-white inline-flex items-center justify-center leading-none">
                          {ROLE_LABELS[userItem.role] || userItem.role || '-'}
                        </span>
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
                        <div className="inline-flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => void handleToggleUserStatus(userItem)}
                            title={
                              userItem.status === 'blocked'
                                ? 'Buka blokir akun'
                                : 'Blokir akun'
                            }
                            aria-label={
                              userItem.status === 'blocked'
                                ? 'Buka blokir akun'
                                : 'Blokir akun'
                            }
                            disabled={isProtectedRole}
                            className="p-2.5 bg-black/40 border border-white/15 rounded-xl hover:border-white/35 text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <FaEdit className="w-3.5 h-3.5 text-white" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(userItem)}
                            title="Hapus pengguna"
                            aria-label="Hapus pengguna"
                            disabled={isProtectedRole}
                            className="p-2.5 bg-black/40 border border-white/15 rounded-xl hover:border-white/35 text-white transition-colors disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
                          >
                            <FaTrash className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredUsers.length && (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-white/55">
                      Tidak ada data pengguna yang cocok dengan pencarian atau filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Popup Konfirmasi Hapus Pengguna */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={() => {
            if (!deletingUser) setDeleteTarget(null);
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
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border border-white/15 flex items-center justify-center text-white shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaExclamationTriangle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">
                    Hapus Akun Pengguna
                  </h2>
                  <p className="text-xs text-white/60 mt-0.5">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={deletingUser}
                onClick={() => setDeleteTarget(null)}
                aria-label="Tutup popup konfirmasi"
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <div className="my-5 space-y-3">
              <p className="text-white/75 leading-relaxed">
                Apakah kamu yakin ingin menghapus akun pengguna berikut secara permanen?
              </p>
              <div className="rounded-xl bg-black/45 border border-white/15 p-4 space-y-1.5">
                <p className="font-bold text-white truncate">{deleteTarget.name || '-'}</p>
                <p className="text-xs text-white/65 truncate">{deleteTarget.email || '-'}</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#6D19B0]/35 border border-white/15 text-white">
                  {ROLE_LABELS[deleteTarget.role] || deleteTarget.role || 'Pengguna'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={deletingUser}
                onClick={() => setDeleteTarget(null)}
                className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-40"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deletingUser}
                onClick={() => void handleConfirmDeleteUser()}
                className="flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                {deletingUser ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <FaTrash className="w-3.5 h-3.5 text-white" />
                    <span>Hapus Akun</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}