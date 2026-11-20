// src/app/organizer/seats/page.js
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import {
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaMapMarkedAlt,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
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

const STATUS_LABELS = {
  available: 'Tersedia',
  booked: 'Terpesan',
  reserved: 'Direservasi',
  disabled: 'Nonaktif',
};

const CATEGORY_LABELS = {
  regular: 'Regular',
  vip: 'VIP',
  vvip: 'VVIP',
  platinum: 'Platinum',
  diamond: 'Diamond',
};

export default function OrganizerSeatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [seats, setSeats] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [selectedSeatConcert, setSelectedSeatConcert] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // State modal & form kursi
  const [showSeatModal, setShowSeatModal] = useState(false);
  const [editingSeat, setEditingSeat] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [seatForm, setSeatForm] = useState({
    concertId: '',
    sectionId: '',
    sectionName: '',
    row: '',
    number: '',
    category: 'regular',
    price: '',
    status: 'available',
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchConcerts = useCallback(async () => {
    try {
      const response = await api.get('/organizer/concerts');
      if (response.data?.success) {
        setConcerts(response.data.data || []);
      }
    } catch {
      // Abaikan jika gagal memuat daftar konser
    }
  }, []);

  const fetchSeats = useCallback(async (concertId = '') => {
    try {
      setLoadingSeats(true);
      const url =
        concertId && concertId !== ''
          ? `/organizer/seats?concertId=${concertId}`
          : '/organizer/seats';
      const response = await api.get(url);
      if (response.data?.success) {
        setSeats(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data kursi');
    } finally {
      setLoadingSeats(false);
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
      void fetchConcerts();
      void fetchSeats('');
    }
  }, [user, loading, router, fetchConcerts, fetchSeats]);

  const openAddSeatModal = () => {
    setEditingSeat(null);
    setSeatForm({
      concertId: selectedSeatConcert || concerts[0]?.id || '',
      sectionId: '',
      sectionName: '',
      row: '',
      number: '',
      category: 'regular',
      price: '',
      status: 'available',
    });
    setShowSeatModal(true);
  };

  const openEditSeatModal = (seat) => {
    setEditingSeat(seat);
    setSeatForm({
      concertId: seat.concertId || seat.concert?.id || '',
      sectionId: seat.sectionId || '',
      sectionName: seat.sectionName || '',
      row: seat.row || '',
      number: seat.number ?? '',
      category: seat.category || 'regular',
      price: seat.price ?? '',
      status: seat.status || 'available',
    });
    setShowSeatModal(true);
  };

  const handleSeatSubmit = async (e) => {
    e.preventDefault();
    if (!seatForm.concertId) {
      toast.error('Silakan pilih konser terlebih dahulu');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ...seatForm,
        number: parseInt(seatForm.number, 10) || 0,
        price: parseFloat(seatForm.price) || 0,
      };

      const response = editingSeat
        ? await api.put(`/organizer/seats/${editingSeat.id}`, payload)
        : await api.post('/organizer/seats', payload);

      if (response.data?.success) {
        toast.success(
          editingSeat ? 'Data kursi berhasil diperbarui' : 'Kursi baru berhasil ditambahkan'
        );
        setShowSeatModal(false);
        setEditingSeat(null);
        setSeatForm({
          concertId: '',
          sectionId: '',
          sectionName: '',
          row: '',
          number: '',
          category: 'regular',
          price: '',
          status: 'available',
        });
        await fetchSeats(selectedSeatConcert);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data kursi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSeat = async (id) => {
    if (!confirm('Apakah kamu yakin ingin menghapus kursi ini?')) return;
    try {
      await api.delete(`/organizer/seats/${id}`);
      toast.success('Kursi berhasil dihapus');
      await fetchSeats(selectedSeatConcert);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus kursi');
    }
  };

  const filteredSeats = useMemo(() => {
    return seats.filter((seat) => {
      const seatLabel = `${seat.row || ''}${seat.number || ''}`.toLowerCase();
      const sectionName = seat.sectionName?.toLowerCase() || '';
      const categoryName = seat.category?.toLowerCase() || '';
      const q = searchTerm.toLowerCase();

      const matchesSearch =
        seatLabel.includes(q) || sectionName.includes(q) || categoryName.includes(q);

      const seatConcertId = seat.concertId || seat.concert?.id;
      const matchesConcertDropdown =
        !selectedSeatConcert || String(seatConcertId) === String(selectedSeatConcert);

      return matchesSearch && matchesConcertDropdown;
    });
  }, [seats, searchTerm, selectedSeatConcert]);

  const seatCounts = useMemo(() => {
    const available = filteredSeats.filter((s) => s.status === 'available').length;
    const booked = filteredSeats.filter((s) => s.status === 'booked').length;
    return {
      total: filteredSeats.length,
      available,
      booked,
    };
  }, [filteredSeats]);

  if (!isMounted || loading || (loadingSeats && concerts.length === 0)) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat denah kursi...</p>
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
              Venue & Tempat Duduk
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Denah Kursi
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Kelola tata letak kursi, nomor baris, kategori, dan status ketersediaan penonton.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddSeatModal}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaPlus className="w-3.5 h-3.5 text-white" />
            <span>Tambah Kursi Baru</span>
          </button>
        </div>

        {/* Ringkasan Cepat Kursi */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Kursi Ditampilkan</span>
            <span className="text-base font-extrabold text-white">
              {seatCounts.total.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Kursi Tersedia</span>
            <span className="text-base font-extrabold text-white">
              {seatCounts.available.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Kursi Terpesan</span>
            <span className="text-base font-extrabold text-white">
              {seatCounts.booked.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Filter & Pencarian */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-7">
          <div className="relative flex-1 max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/65 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor kursi (mis: A1), bagian, atau kategori..."
              suppressHydrationWarning
              className="w-full pl-11 pr-4 py-3 bg-[#120d1d] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedSeatConcert}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSeatConcert(val);
                void fetchSeats(val);
              }}
              aria-label="Filter konser untuk kursi"
              suppressHydrationWarning
              className="w-full py-3 px-4 bg-[#120d1d] border border-white/15 rounded-xl text-xs sm:text-sm text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
            >
              <option value="">Semua Konser</option>
              {concerts.map((concert) => (
                <option key={concert.id} value={concert.id}>
                  {concert.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daftar Kartu Kursi */}
        {loadingSeats ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : filteredSeats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeats.map((seat) => {
              const statusBadgeStyle =
                seat.status === 'available'
                  ? 'bg-[#6D19B0]/35 text-white border-white/20'
                  : seat.status === 'booked'
                  ? 'bg-[#B900A3]/30 text-white border-white/20'
                  : 'bg-white/10 text-white/75 border-white/15';

              return (
                <div
                  key={seat.id}
                  className="bg-[#120d1d] border border-white/15 hover:border-white/30 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h2 className="text-lg font-extrabold text-white tracking-tight">
                          Kursi {seat.row}
                          {seat.number}
                        </h2>
                        <p className="text-xs text-white/60 mt-0.5">
                          {seat.sectionName || 'Bagian Utama'}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusBadgeStyle}`}
                      >
                        {STATUS_LABELS[seat.status] || seat.status || '-'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-3.5 border-t border-white/10 text-xs sm:text-sm">
                      <div>
                        <span className="text-white/60 block text-xs mb-0.5">Kategori</span>
                        <span className="font-semibold text-white">
                          {CATEGORY_LABELS[seat.category?.toLowerCase()] ||
                            seat.category ||
                            '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60 block text-xs mb-0.5">Harga</span>
                        <span className="font-extrabold text-white text-sm sm:text-base">
                          Rp {Number(seat.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => openEditSeatModal(seat)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 border border-white/15 hover:border-white/35 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <FaEdit className="w-3.5 h-3.5 text-white" />
                      <span>Ubah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSeat(seat.id)}
                      className="py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-white/35 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      title="Hapus Kursi"
                      aria-label="Hapus kursi"
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
              <FaUsers className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Belum Ada Data Kursi</h2>
            <p className="text-xs sm:text-sm text-white/60 mb-6 max-w-md mx-auto">
              Mulai tambahkan alokasi kursi penonton untuk konser pilihan kamu.
            </p>
            <button
              type="button"
              onClick={openAddSeatModal}
              className="rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaPlus className="w-3.5 h-3.5 text-white" />
              <span>Tambah Kursi Baru</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal Tambah / Ubah Kursi */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d1d] border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl text-xs sm:text-sm max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaMapMarkedAlt className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {editingSeat ? 'Ubah Denah Kursi' : 'Tambah Kursi Baru'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowSeatModal(false)}
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSeatSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-white/85 mb-1.5">
                  Konser <span className="text-white">*</span>
                </label>
                <select
                  value={seatForm.concertId}
                  onChange={(e) => setSeatForm({ ...seatForm, concertId: e.target.value })}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
                  required
                >
                  <option value="">-- Pilih Konser --</option>
                  {concerts.map((concert) => (
                    <option key={concert.id} value={concert.id}>
                      {concert.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Baris <span className="text-white">*</span>
                  </label>
                  <input
                    type="text"
                    value={seatForm.row}
                    onChange={(e) => setSeatForm({ ...seatForm, row: e.target.value.toUpperCase() })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all font-mono"
                    placeholder="Contoh: A"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Nomor Kursi <span className="text-white">*</span>
                  </label>
                  <input
                    type="number"
                    value={seatForm.number}
                    onChange={(e) => setSeatForm({ ...seatForm, number: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                    placeholder="Contoh: 1"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/85 mb-1.5">Nama Bagian</label>
                <input
                  type="text"
                  value={seatForm.sectionName}
                  onChange={(e) => setSeatForm({ ...seatForm, sectionName: e.target.value })}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                  placeholder="Contoh: VIP Tribun Depan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Kategori <span className="text-white">*</span>
                  </label>
                  <select
                    value={seatForm.category}
                    onChange={(e) => setSeatForm({ ...seatForm, category: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
                    required
                  >
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                    <option value="vvip">VVIP</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-white/85 mb-1.5">
                    Harga (Rp) <span className="text-white">*</span>
                  </label>
                  <input
                    type="number"
                    value={seatForm.price}
                    onChange={(e) => setSeatForm({ ...seatForm, price: e.target.value })}
                    suppressHydrationWarning
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                    placeholder="Contoh: 150000"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/85 mb-1.5">Status Kursi</label>
                <select
                  value={seatForm.status}
                  onChange={(e) => setSeatForm({ ...seatForm, status: e.target.value })}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
                >
                  <option value="available">Tersedia</option>
                  <option value="booked">Terpesan</option>
                  <option value="reserved">Direservasi</option>
                  <option value="disabled">Nonaktif</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSeatModal(false)}
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
                    <span>{editingSeat ? 'Simpan Perubahan' : 'Simpan Kursi'}</span>
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