// src/app/organizer/seats/page.js
'use client';

import { useEffect, useState } from 'react';
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
  FaLayerGroup,
  FaMapMarkedAlt
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

export default function OrganizerSeatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [seats, setSeats] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [selectedSeatConcert, setSelectedSeatConcert] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form State
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
    status: 'available'
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
      fetchSeats();
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

  const fetchSeats = async (concertId = selectedSeatConcert) => {
    try {
      setLoadingSeats(true);
      const url = concertId && concertId !== '' 
        ? `/organizer/seats?concertId=${concertId}` 
        : '/organizer/seats';
      const response = await api.get(url);
      if (response.data.success) {
        setSeats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Gagal memuat data kursi');
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleSeatSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...seatForm,
        number: parseInt(seatForm.number),
        price: parseFloat(seatForm.price)
      };

      let response;
      if (editingSeat) {
        response = await api.put(`/organizer/seats/${editingSeat.id}`, payload);
      } else {
        response = await api.post('/organizer/seats', payload);
      }

      if (response.data.success) {
        toast.success(editingSeat ? 'Kursi berhasil diupdate!' : 'Kursi berhasil ditambahkan!');
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
          status: 'available'
        });
        fetchSeats(selectedSeatConcert);
      }
    } catch (error) {
      console.error('Error saving seat:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan kursi');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteSeat = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kursi ini?')) return;
    try {
      await api.delete(`/organizer/seats/${id}`);
      toast.success('Kursi berhasil dihapus!');
      fetchSeats(selectedSeatConcert);
    } catch (error) {
      console.error('Error deleting seat:', error);
      toast.error('Gagal menghapus kursi');
    }
  };

  // Filter ganda: berdasarkan pencarian teks & dropdown konser
  const filteredSeats = seats.filter(seat => {
    const seatLabel = `${seat.row}${seat.number}`.toLowerCase();
    const sectionName = seat.sectionName?.toLowerCase() || '';
    const matchesSearch = seatLabel.includes(searchTerm.toLowerCase()) || 
                          sectionName.includes(searchTerm.toLowerCase()) ||
                          seat.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const seatConcertId = seat.concertId || seat.concert?.id;
    const matchesConcertDropdown = !selectedSeatConcert || 
                                   String(seatConcertId) === String(selectedSeatConcert);

    return matchesSearch && matchesConcertDropdown;
  });

  if (loading || (loadingSeats && concerts.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat layout kursi...</p>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Venue & Seating</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Seat Layout</h1>
            <p className="text-xs text-white/60 mt-1">Kelola tata letak kursi, nomor baris, kategori, dan status ketersediaan kursi penonton.</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingSeat(null);
              setSeatForm({
                concertId: selectedSeatConcert || concerts[0]?.id || '',
                sectionId: '',
                sectionName: '',
                row: '',
                number: '',
                category: 'regular',
                price: '',
                status: 'available'
              });
              setShowSeatModal(true);
            }}
            className="rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaPlus className="w-3.5 h-3.5 text-white" />
            <span>Add New Seat</span>
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
              placeholder="Cari berdasarkan nomor kursi (mis: A1), section, atau kategori..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedSeatConcert}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSeatConcert(val);
                fetchSeats(val);
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

        {/* Seats Grid */}
        {loadingSeats ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-8 h-8 text-[#8B5CF6] animate-spin" />
          </div>
        ) : filteredSeats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeats.map((seat) => (
              <div key={seat.id} className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-extrabold text-[#D8B4FE] tracking-tight">Seat {seat.row}{seat.number}</h3>
                      <p className="text-xs text-white/50">{seat.sectionName || 'Default Section'}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      seat.status === 'available' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      seat.status === 'booked' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                      seat.status === 'reserved' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                      'bg-white/10 text-white/50 border-white/20'
                    }`}>
                      {seat.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10 text-xs">
                    <div>
                      <span className="text-white/60 block mb-0.5">Category</span>
                      <span className="font-semibold text-white uppercase tracking-wider">{seat.category}</span>
                    </div>
                    <div>
                      <span className="text-white/60 block mb-0.5">Price</span>
                      <span className="font-extrabold text-white text-sm">Rp {Number(seat.price || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      setEditingSeat(seat);
                      setSeatForm({
                        concertId: seat.concertId || seat.concert?.id || '',
                        sectionId: seat.sectionId || '',
                        sectionName: seat.sectionName || '',
                        row: seat.row || '',
                        number: seat.number || '',
                        category: seat.category || 'regular',
                        price: seat.price || '',
                        status: seat.status || 'available'
                      });
                      setShowSeatModal(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FaEdit className="w-3.5 h-3.5 text-white" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteSeat(seat.id)}
                    className="py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-red-500/50 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    title="Hapus Kursi"
                  >
                    <FaTrash className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#120d1d] border border-white/15 p-14 rounded-2xl text-center shadow-xl">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/10"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaUsers className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Belum Ada Data Kursi</h3>
            <p className="text-xs text-white/60 mb-6 max-w-md mx-auto">
              Mulai tambahkan alokasi kursi penonton untuk konser pilihan Anda.
            </p>
            <button 
              onClick={() => {
                setEditingSeat(null);
                setSeatForm({
                  concertId: selectedSeatConcert || concerts[0]?.id || '',
                  sectionId: '',
                  sectionName: '',
                  row: '',
                  number: '',
                  category: 'regular',
                  price: '',
                  status: 'available'
                });
                setShowSeatModal(true);
              }}
              className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaPlus className="w-3.5 h-3.5 text-white" />
              <span>Add New Seat</span>
            </button>
          </div>
        )}

      </main>

      {/* Modal Add / Edit Seat */}
      {showSeatModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d1d] border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6D19B0]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-white">
                  <FaMapMarkedAlt className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingSeat ? 'Edit Seat Layout' : 'Add New Seat'}
                </h2>
              </div>
              <button 
                onClick={() => setShowSeatModal(false)} 
                className="w-7 h-7 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSeatSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Concert <span className="text-[#D8B4FE]">*</span></label>
                <select
                  value={seatForm.concertId}
                  onChange={(e) => setSeatForm({...seatForm, concertId: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                  required
                >
                  <option value="">Pilih Konser</option>
                  {concerts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Row (Baris) <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="text"
                    value={seatForm.row}
                    onChange={(e) => setSeatForm({...seatForm, row: e.target.value.toUpperCase()})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all font-mono"
                    placeholder="Contoh: A"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Number (No. Kursi) <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="number"
                    value={seatForm.number}
                    onChange={(e) => setSeatForm({...seatForm, number: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    placeholder="Contoh: 1"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Section Name</label>
                <input
                  type="text"
                  value={seatForm.sectionName}
                  onChange={(e) => setSeatForm({...seatForm, sectionName: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                  placeholder="Contoh: VIP Tribun Depan"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Category <span className="text-[#D8B4FE]">*</span></label>
                  <select
                    value={seatForm.category}
                    onChange={(e) => setSeatForm({...seatForm, category: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
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
                  <label className="block font-semibold text-white/80 mb-1.5">Price (Rp) <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="number"
                    value={seatForm.price}
                    onChange={(e) => setSeatForm({...seatForm, price: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    placeholder="Contoh: 150000"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Status</label>
                <select
                  value={seatForm.status}
                  onChange={(e) => setSeatForm({...seatForm, status: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="reserved">Reserved</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowSeatModal(false)} 
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
                    <span>{editingSeat ? 'Update Seat' : 'Add Seat'}</span>
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