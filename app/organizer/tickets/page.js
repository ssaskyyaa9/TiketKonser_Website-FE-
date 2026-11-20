// src/app/organizer/tickets/page.js
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import {
  FaTicketAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSpinner,
  FaSearch,
  FaMusic,
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

export default function OrganizerTicketsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // State modal tambah / edit tiket
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: '',
    price: '',
    quota: '',
    concertId: '',
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

  const fetchTickets = useCallback(async (concertId = '') => {
    try {
      setLoadingTickets(true);
      const url =
        concertId && concertId !== ''
          ? `/organizer/tickets?concertId=${concertId}`
          : '/organizer/tickets';
      const response = await api.get(url);
      if (response.data?.success) {
        setTickets(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat data tiket');
    } finally {
      setLoadingTickets(false);
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
      void fetchTickets('');
    }
  }, [user, loading, router, fetchConcerts, fetchTickets]);

  const openAddModal = () => {
    setEditingTicket(null);
    setTicketForm({
      category: '',
      price: '',
      quota: '',
      concertId: selectedConcert || concerts[0]?.id || '',
    });
    setShowTicketModal(true);
  };

  const openEditModal = (ticket) => {
    setEditingTicket(ticket);
    setTicketForm({
      category: ticket.category || '',
      price: ticket.price ?? '',
      quota: ticket.quota ?? '',
      concertId: ticket.concertId || ticket.concert?.id || '',
    });
    setShowTicketModal(true);
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    if (!ticketForm.concertId) {
      toast.error('Silakan pilih konser terlebih dahulu');
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        ...ticketForm,
        price: parseFloat(ticketForm.price) || 0,
        quota: parseInt(ticketForm.quota, 10) || 0,
      };

      const response = editingTicket
        ? await api.put(`/organizer/tickets/${editingTicket.id}`, payload)
        : await api.post('/organizer/tickets', payload);

      if (response.data?.success) {
        toast.success(
          editingTicket ? 'Kategori tiket berhasil diperbarui' : 'Kategori tiket berhasil dibuat'
        );
        setShowTicketModal(false);
        setEditingTicket(null);
        setTicketForm({ category: '', price: '', quota: '', concertId: '' });
        await fetchTickets(selectedConcert);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan kategori tiket');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm('Apakah kamu yakin ingin menghapus kategori tiket ini?')) return;
    try {
      await api.delete(`/organizer/tickets/${id}`);
      toast.success('Kategori tiket berhasil dihapus');
      await fetchTickets(selectedConcert);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus kategori tiket');
    }
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch =
        ticket.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.concert?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesConcertDropdown =
        !selectedConcert ||
        String(ticket.concertId) === String(selectedConcert) ||
        String(ticket.concert?.id) === String(selectedConcert);

      return matchesSearch && matchesConcertDropdown;
    });
  }, [tickets, searchTerm, selectedConcert]);

  const summaryStats = useMemo(() => {
    const totalQuota = filteredTickets.reduce((acc, item) => acc + Number(item.quota || 0), 0);
    const totalSold = filteredTickets.reduce((acc, item) => acc + Number(item.sold || 0), 0);
    return {
      categories: filteredTickets.length,
      totalQuota,
      totalSold,
    };
  }, [filteredTickets]);

  if (!isMounted || loading || (loadingTickets && concerts.length === 0)) {
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
          <p className="mt-4 text-xs sm:text-sm text-white/65">Memuat manajemen tiket...</p>
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
              Kuota & Harga Tiket
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Manajemen Tiket
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">
              Atur kategori, kuota, dan harga tiket konser kamu secara langsung.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="rounded-xl px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaPlus className="w-3.5 h-3.5 text-white" />
            <span>Tambah Kategori Tiket</span>
          </button>
        </div>

        {/* Ringkasan Cepat */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Kategori Ditampilkan</span>
            <span className="text-base font-extrabold text-white">
              {summaryStats.categories.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Kuota Tiket</span>
            <span className="text-base font-extrabold text-white">
              {summaryStats.totalQuota.toLocaleString('id-ID')}
            </span>
          </div>
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-xs text-white/65">Total Tiket Terjual</span>
            <span className="text-base font-extrabold text-white">
              {summaryStats.totalSold.toLocaleString('id-ID')}
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
              placeholder="Cari kategori atau nama konser..."
              suppressHydrationWarning
              className="w-full pl-11 pr-4 py-3 bg-[#120d1d] border border-white/15 rounded-xl text-xs sm:text-sm text-white placeholder-white/40 focus:border-white/40 focus:outline-none transition-all"
            />
          </div>

          <div className="w-full sm:w-80">
            <select
              value={selectedConcert}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedConcert(val);
                void fetchTickets(val);
              }}
              aria-label="Filter konser"
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

        {/* Daftar Kartu Kategori Tiket */}
        {loadingTickets ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              const quotaNum = Number(ticket.quota || 0);
              const soldNum = Number(ticket.sold || 0);
              const soldPercent =
                quotaNum > 0 ? Math.min(100, Math.round((soldNum / quotaNum) * 100)) : 0;
              const availableNum =
                ticket.available !== undefined && ticket.available !== null
                  ? Number(ticket.available)
                  : Math.max(0, quotaNum - soldNum);

              return (
                <div
                  key={ticket.id}
                  className="bg-[#120d1d] border border-white/15 hover:border-white/30 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <h2 className="text-lg font-extrabold text-white tracking-tight">
                        {ticket.category}
                      </h2>
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#6D19B0]/30 text-white border border-white/15">
                        {soldPercent}% Terjual
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs sm:text-sm">
                      <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                        <span className="text-white/60">Harga Tiket</span>
                        <span className="font-extrabold text-white text-sm sm:text-base">
                          Rp {Number(ticket.price || 0).toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Total Kuota</span>
                        <span className="font-semibold text-white">
                          {quotaNum.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Terjual</span>
                        <span className="font-semibold text-white">
                          {soldNum.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Tersedia</span>
                        <span className="font-semibold text-white">
                          {availableNum.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2.5 border-t border-white/10">
                        <span className="text-white/60 inline-flex items-center gap-1.5">
                          <FaMusic className="w-3.5 h-3.5 text-white" />
                          <span>Konser</span>
                        </span>
                        <span
                          className="text-white font-semibold truncate max-w-[170px]"
                          title={ticket.concert?.name}
                        >
                          {ticket.concert?.name || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Indikator Terjual */}
                    <div className="w-full h-2.5 bg-black/45 rounded-full mt-5 overflow-hidden border border-white/10">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${soldPercent}%`,
                          background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => openEditModal(ticket)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 border border-white/15 hover:border-white/35 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <FaEdit className="w-3.5 h-3.5 text-white" />
                      <span>Ubah</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-white/35 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      title="Hapus Kategori Tiket"
                      aria-label="Hapus kategori tiket"
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
              <FaTicketAlt className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Belum Ada Kategori Tiket</h2>
            <p className="text-xs sm:text-sm text-white/60 mb-6 max-w-md mx-auto">
              Mulai tambahkan kategori tiket (seperti Festival, VIP, atau VVIP) untuk konser kamu.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaPlus className="w-3.5 h-3.5 text-white" />
              <span>Tambah Kategori Tiket</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal Tambah / Ubah Kategori Tiket */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d1d] border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl text-xs sm:text-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl border border-white/15 flex items-center justify-center text-white"
                  style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaTicketAlt className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {editingTicket ? 'Ubah Kategori Tiket' : 'Tambah Kategori Tiket'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowTicketModal(false)}
                aria-label="Tutup modal"
                className="w-8 h-8 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/75 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-white/85 mb-1.5">
                  Kategori <span className="text-white">*</span>
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d]"
                  required
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Festival">Festival</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-white/85 mb-1.5">
                  Harga (Rp) <span className="text-white">*</span>
                </label>
                <input
                  type="number"
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({ ...ticketForm, price: e.target.value })}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                  placeholder="Contoh: 150000"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/85 mb-1.5">
                  Kuota Tiket <span className="text-white">*</span>
                </label>
                <input
                  type="number"
                  value={ticketForm.quota}
                  onChange={(e) => setTicketForm({ ...ticketForm, quota: e.target.value })}
                  suppressHydrationWarning
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/35 focus:border-white/40 focus:outline-none transition-all"
                  placeholder="Contoh: 100"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/85 mb-1.5">
                  Konser <span className="text-white">*</span>
                </label>
                <select
                  value={ticketForm.concertId}
                  onChange={(e) => setTicketForm({ ...ticketForm, concertId: e.target.value })}
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

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
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
                    <span>{editingTicket ? 'Simpan Perubahan' : 'Simpan Tiket'}</span>
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