// src/app/organizer/tickets/page.js
'use client';

import { useEffect, useState } from 'react';
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
  FaMusic
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
    const token = localStorage.getItem('token');
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

  const [tickets, setTickets] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    category: '',
    price: '',
    quota: '',
    concertId: ''
  });

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
      fetchConcerts();
      fetchTickets();
    }
  }, [user, loading, router]);

  const fetchConcerts = async () => {
    try {
      const response = await api.get('/organizer/concerts');
      if (response.data.success) {
        setConcerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching concerts:', error);
    }
  };

  const fetchTickets = async (concertId = selectedConcert) => {
    try {
      setLoadingTickets(true);
      const url = concertId && concertId !== '' 
        ? `/organizer/tickets?concertId=${concertId}` 
        : '/organizer/tickets';
      const response = await api.get(url);
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Gagal memuat tiket');
    } finally {
      setLoadingTickets(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...ticketForm,
        price: parseFloat(ticketForm.price),
        quota: parseInt(ticketForm.quota)
      };

      let response;
      if (editingTicket) {
        response = await api.put(`/organizer/tickets/${editingTicket.id}`, payload);
      } else {
        response = await api.post('/organizer/tickets', payload);
      }

      if (response.data.success) {
        toast.success(editingTicket ? 'Tiket berhasil diupdate!' : 'Tiket berhasil dibuat!');
        setShowTicketModal(false);
        setEditingTicket(null);
        setTicketForm({ category: '', price: '', quota: '', concertId: '' });
        fetchTickets(selectedConcert);
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan tiket');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kategori tiket ini?')) return;
    try {
      await api.delete(`/organizer/tickets/${id}`);
      toast.success('Tiket berhasil dihapus!');
      fetchTickets(selectedConcert);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus tiket');
    }
  };

  // Filter ganda: berdasarkan pencarian teks DAN pilihan konser di dropdown secara ketat
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ticket.concert?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesConcertDropdown = !selectedConcert || 
                                   String(ticket.concertId) === String(selectedConcert) || 
                                   String(ticket.concert?.id) === String(selectedConcert);

    return matchesSearch && matchesConcertDropdown;
  });

  if (loading || (loadingTickets && concerts.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat manajemen tiket...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Inventory & Pricing</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Ticket Management</h1>
            <p className="text-xs text-white/60 mt-1">Atur kategori, kuota, dan harga tiket konser Anda secara real-time.</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingTicket(null);
              setTicketForm({ category: '', price: '', quota: '', concertId: selectedConcert || concerts[0]?.id || '' });
              setShowTicketModal(true);
            }}
            className="rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaPlus className="w-3.5 h-3.5 text-white" />
            <span>Add Ticket Category</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kategori atau nama konser..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedConcert}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedConcert(val);
                fetchTickets(val);
              }}
              className="w-full py-2.5 px-4 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner cursor-pointer"
            >
              <option value="">Semua Konser (All Concerts)</option>
              {concerts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tickets Grid */}
        {loadingTickets ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-8 h-8 text-[#8B5CF6] animate-spin" />
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => {
              const soldPercent = ticket.quota > 0 ? Math.round((ticket.sold / ticket.quota) * 100) : 0;
              return (
                <div key={ticket.id} className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-extrabold text-[#D8B4FE] tracking-tight">{ticket.category}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        soldPercent < 100 ? 'bg-[#6D19B0]/20 text-[#D8B4FE] border-[#8B5CF6]/40' : 'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {soldPercent}% Sold
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-white/60">Harga</span>
                        <span className="font-extrabold text-white text-sm">Rp {Number(ticket.price || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Total Kuota</span>
                        <span className="font-semibold text-white">{Number(ticket.quota || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Terjual (Sold)</span>
                        <span className="font-semibold text-[#D8B4FE]">{Number(ticket.sold || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/60">Tersedia</span>
                        <span className="font-semibold text-white/90">{Number(ticket.available || 0).toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-white/5">
                        <span className="text-white/60 flex items-center gap-1.5">
                          <FaMusic className="w-3 h-3 text-white" /> Konser
                        </span>
                        <span className="text-white font-medium truncate max-w-[160px]" title={ticket.concert?.name}>
                          {ticket.concert?.name || '-'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-black/40 rounded-full mt-5 overflow-hidden border border-white/10">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${soldPercent}%`,
                          background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' 
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/10">
                    <button 
                      onClick={() => {
                        setEditingTicket(ticket);
                        setTicketForm({
                          category: ticket.category,
                          price: ticket.price,
                          quota: ticket.quota,
                          concertId: ticket.concertId
                        });
                        setShowTicketModal(true);
                      }}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <FaEdit className="w-3.5 h-3.5 text-white" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-red-500/50 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      title="Hapus Tiket"
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
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/10"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaTicketAlt className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Belum Ada Kategori Tiket</h3>
            <p className="text-xs text-white/60 mb-6 max-w-md mx-auto">
              Mulai tambahkan kategori tiket (seperti VVIP, VIP, atau Regular) untuk konser Anda.
            </p>
            <button 
              onClick={() => {
                setEditingTicket(null);
                setTicketForm({ category: '', price: '', quota: '', concertId: selectedConcert || concerts[0]?.id || '' });
                setShowTicketModal(true);
              }}
              className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaPlus className="w-3.5 h-3.5 text-white" />
              <span>Add Ticket Category</span>
            </button>
          </div>
        )}

      </main>

      {/* Modal Create/Edit Ticket */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d1d] border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl text-xs">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6D19B0]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-white">
                  <FaTicketAlt className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingTicket ? 'Edit Ticket Category' : 'Add Ticket Category'}
                </h2>
              </div>
              <button 
                onClick={() => setShowTicketModal(false)} 
                className="w-7 h-7 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Category <span className="text-[#D8B4FE]">*</span></label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  <option value="Festival">Festival</option>
                  <option value="Regular">Regular</option>
                  <option value="VIP">VIP</option>
                  <option value="VVIP">VVIP</option>
                  <option value="Platinum">Platinum</option>
                  <option value="Diamond">Diamond</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Price (Rp) <span className="text-[#D8B4FE]">*</span></label>
                <input
                  type="number"
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({...ticketForm, price: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                  placeholder="Contoh: 150000"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Quota (Jumlah Tiket) <span className="text-[#D8B4FE]">*</span></label>
                <input
                  type="number"
                  value={ticketForm.quota}
                  onChange={(e) => setTicketForm({...ticketForm, quota: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                  placeholder="Contoh: 100"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Concert <span className="text-[#D8B4FE]">*</span></label>
                <select
                  value={ticketForm.concertId}
                  onChange={(e) => setTicketForm({...ticketForm, concertId: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Pilih Konser</option>
                  {concerts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowTicketModal(false)} 
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
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
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingTicket ? 'Update Ticket' : 'Add Ticket'}</span>
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