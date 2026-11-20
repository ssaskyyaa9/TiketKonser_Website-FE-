// src/app/organizer/promos/page.js
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaTimes,
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

const INITIAL_FORM_DATA = {
  code: '',
  name: '',
  description: '',
  type: 'voucher',
  value: '',
  discountType: 'percentage',
  minPurchase: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  maxUses: '',
  perUserLimit: '1',
};

const TYPE_LABELS = {
  voucher: 'Voucher',
  discount: 'Diskon',
  flash_sale: 'Flash Sale',
};

export default function PromoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State modal & form promo
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchPromos = useCallback(async () => {
    try {
      setLoadingPromos(true);
      const response = await api.get('/organizer/promos');
      if (response.data?.success) {
        setPromos(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data promo');
    } finally {
      setLoadingPromos(false);
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
      void fetchPromos();
    }
  }, [user, loading, router, fetchPromos]);

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormData(INITIAL_FORM_DATA);
    setShowModal(true);
  };

  const openEditModal = (promo) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code || '',
      name: promo.name || '',
      description: promo.description || '',
      type: promo.type || 'voucher',
      value: promo.value ?? '',
      discountType: promo.discountType || 'percentage',
      minPurchase: promo.minPurchase ?? '',
      maxDiscount: promo.maxDiscount ?? '',
      startDate: promo.startDate?.split('T')[0] || '',
      endDate: promo.endDate?.split('T')[0] || '',
      maxUses: promo.maxUses ?? '',
      perUserLimit: promo.perUserLimit ?? '1',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
        perUserLimit: parseInt(formData.perUserLimit, 10) || 1,
      };

      const response = editingPromo
        ? await api.put(`/organizer/promos/${editingPromo.id}`, payload)
        : await api.post('/organizer/promos', payload);

      if (response.data?.success) {
        toast.success(editingPromo ? 'Promo berhasil diperbarui' : 'Promo berhasil dibuat');
        setShowModal(false);
        setEditingPromo(null);
        setFormData(INITIAL_FORM_DATA);
        await fetchPromos();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan promo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah kamu yakin ingin menghapus promo ini?')) return;
    try {
      await api.delete(`/organizer/promos/${id}`);
      toast.success('Promo berhasil dihapus');
      await fetchPromos();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus promo');
    }
  };

  const filteredPromos = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return promos.filter((promo) => {
      const code = promo.code?.toLowerCase() || '';
      const name = promo.name?.toLowerCase() || '';
      return code.includes(q) || name.includes(q);
    });
  }, [promos, searchTerm]);

  const promoStats = useMemo(() => {
    const activeCount = filteredPromos.filter((p) => p.status === 'active').length;
    const totalUsage = filteredPromos.reduce((acc, p) => acc + Number(p.usedCount || 0), 0);
    return {
      total: filteredPromos.length,
      active: activeCount,
      usage: totalUsage,
    };
  }, [filteredPromos]);

  if (!isMounted || loading || loadingPromos) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat data promo...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') return null;

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
        <div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8 relative overflow-hidden"
          style={{
            backgroundImage:
              'radial-gradient(circle at top right, rgba(185, 0, 163, 0.16), transparent 55%)',
          }}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/75">
              Pemasaran & Diskon
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Promo & Voucher
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Buat kode voucher, atur batas penggunaan, dan kelola periode promosi tiket konser.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaPlus className="w-3.5 h-3.5 text-white" />
            <span>Buat Promo</span>
          </button>
        </div>

        {/* Ringkasan Cepat Promo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Promo Ditampilkan</span>
            <span className="text-base font-extrabold text-white">
              {promoStats.total.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Promo Aktif</span>
            <span className="text-base font-extrabold text-white">
              {promoStats.active.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Kali Digunakan</span>
            <span className="text-base font-extrabold text-white">
              {promoStats.usage.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Pencarian */}
        <div className="mb-7 max-w-lg">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/65 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan kode promo atau nama..."
              suppressHydrationWarning
              className="w-full pl-11 pr-4 py-3 bg-[#120d1d] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Daftar Kartu Promo */}
        {filteredPromos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPromos.map((promo) => {
              const isActive = promo.status === 'active';
              const usedNum = Number(promo.usedCount || 0);
              const maxUsesNum = promo.maxUses ? Number(promo.maxUses) : null;
              const usagePercent = maxUsesNum
                ? Math.min(100, Math.round((usedNum / maxUsesNum) * 100))
                : 0;

              return (
                <div
                  key={promo.id}
                  className="bg-[#120d1d] border border-white/15 hover:border-white/30 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0">
                        <h2 className="text-xl font-black text-white tracking-wide font-mono truncate">
                          {promo.code}
                        </h2>
                        <p className="text-xs sm:text-sm text-white/70 font-semibold mt-0.5 truncate">
                          {promo.name}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border shrink-0 ${
                          isActive
                            ? 'bg-[#6D19B0]/35 text-white border-white/20'
                            : 'bg-white/10 text-white/65 border-white/15'
                        }`}
                      >
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5">
                            <FaCheckCircle className="w-3 h-3 text-white" />
                            <span>Aktif</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5">
                            <FaTimesCircle className="w-3 h-3 text-white" />
                            <span>Nonaktif</span>
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs sm:text-sm pt-3.5 border-t border-white/10">
                      <div className="flex justify-between gap-3">
                        <span className="text-white/60">Jenis Promo</span>
                        <span className="font-semibold text-white">
                          {TYPE_LABELS[promo.type] || promo.type} ·{' '}
                          {promo.discountType === 'percentage' ? 'Persentase' : 'Nominal Rupiah'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-white/60">Nilai Potongan</span>
                        <span className="font-extrabold text-white">
                          {promo.discountType === 'percentage'
                            ? `${promo.value}%`
                            : `Rp ${Number(promo.value || 0).toLocaleString('id-ID')}`}
                        </span>
                      </div>
                      {promo.minPurchase !== null &&
                        promo.minPurchase !== undefined &&
                        promo.minPurchase !== '' && (
                          <div className="flex justify-between gap-3">
                            <span className="text-white/60">Min. Pembelian</span>
                            <span className="text-white font-medium">
                              Rp {Number(promo.minPurchase).toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      <div className="flex justify-between gap-3">
                        <span className="text-white/60">Periode Berlaku</span>
                        <span className="text-white/85">
                          {promo.startDate?.split('T')[0] || '-'} s/d{' '}
                          {promo.endDate?.split('T')[0] || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-white/60">Penggunaan</span>
                        <span className="text-white font-bold">
                          {usedNum.toLocaleString('id-ID')} /{' '}
                          {maxUsesNum ? maxUsesNum.toLocaleString('id-ID') : 'Tanpa Batas'}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2 bg-black/45 rounded-full mt-4 overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                          width: `${usagePercent}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => openEditModal(promo)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 border border-white/15 hover:border-white/35 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <FaEdit className="w-3.5 h-3.5 text-white" />
                      <span>Ubah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(promo.id)}
                      className="py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-white/35 text-xs font-semibold text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus Promo"
                      aria-label="Hapus promo"
                    >
                      <FaTrash className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#120d1d] border border-white/15 p-14 rounded-2xl text-center shadow-xl">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/15"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaGift className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Belum Ada Promo</h2>
            <p className="text-xs sm:text-sm text-white/60 mb-6 max-w-md mx-auto">
              Buat kode promo atau voucher diskon untuk menarik lebih banyak pembeli tiket konser kamu.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaPlus className="w-3.5 h-3.5 text-white" />
              <span>Buat Promo</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal Buat / Ubah Promo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d1d] border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-2xl shadow-2xl text-xs sm:text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaTag className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {editingPromo ? 'Ubah Promo / Voucher' : 'Buat Promo Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Kode Promo <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all font-mono uppercase"
                    placeholder="Contoh: KONSER20"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Nama Promo <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                    placeholder="Contoh: Diskon Spesial Awal Tahun"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/85 mb-1.5">Deskripsi</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                  rows="2"
                  placeholder="Deskripsi atau syarat ketentuan promo..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Jenis Promo <span className="text-white">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
                    required
                  >
                    <option value="voucher">Voucher</option>
                    <option value="discount">Diskon</option>
                    <option value="flash_sale">Flash Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Tipe Potongan <span className="text-white">*</span>
                  </label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
                    required
                  >
                    <option value="percentage">Persentase (%)</option>
                    <option value="fixed">Nominal Tetap (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Nilai Potongan <span className="text-white">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                    placeholder={
                      formData.discountType === 'percentage' ? 'Contoh: 20' : 'Contoh: 50000'
                    }
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Minimal Pembelian (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.minPurchase || ''}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                    placeholder="Contoh: 100000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Maksimal Diskon (Rp)
                  </label>
                  <input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                    placeholder="Contoh: 50000"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Tanggal Mulai <span className="text-white">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Tanggal Berakhir <span className="text-white">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Batas Total Penggunaan
                  </label>
                  <input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                    placeholder="Kosongkan jika tanpa batas"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Batas per Pengguna
                  </label>
                  <input
                    type="number"
                    value={formData.perUserLimit || 1}
                    onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/75 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {formLoading ? (
                    <>
                      <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingPromo ? 'Simpan Perubahan' : 'Simpan Promo'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}