// src/app/organizer/concerts/[id]/edit/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../../context/AuthContext';
import NavbarEO from '../../../../../components/navbarEO';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaMusic, 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaTag, 
  FaInfoCircle, 
  FaSave, 
  FaLayerGroup 
} from 'react-icons/fa';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const emptyForm = { name: '', description: '', date: '', time: '', startSale: '', endSale: '', venueName: '', city: '', address: '', genre: '' };

export default function EditOrganizerConcertPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [concert, setConcert] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && user.role !== 'organizer') router.push('/dashboard');
    if (user?.role === 'organizer' && id) loadConcert();
  }, [loading, user, id]);

  const loadConcert = async () => {
    try {
      const response = await api.get(`/organizer/concerts/${id}`);
      if (!response.data.success) throw new Error('Konser tidak ditemukan');
      const item = response.data.data;
      setConcert(item);
      setForm({
        name: item.name || '',
        description: item.description || '',
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
        time: item.time || '',
        startSale: item.startSale ? new Date(item.startSale).toISOString().slice(0, 16) : '',
        endSale: item.endSale ? new Date(item.endSale).toISOString().slice(0, 16) : '',
        venueName: item.venueName || '',
        city: item.city || '',
        address: item.address || '',
        genre: item.genre || '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal memuat konser');
      router.push('/organizer/concerts');
    } finally {
      setLoadingData(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.put(`/organizer/concerts/${id}`, {
        ...form,
        startSale: form.startSale || null,
        endSale: form.endSale || null
      });
      toast.success('Konser diperbarui');
      router.push('/organizer/concerts');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui konser');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="h-10 w-10 animate-spin text-[#8B5CF6] mx-auto" />
          <p className="mt-3 text-xs text-white/50">Memuat data konser...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer' || !concert) return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Navigasi & Header */}
        <div className="mb-8">
          <Link 
            href="/organizer/concerts" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors bg-[#120d1d] border border-white/15 px-3.5 py-2 rounded-xl shadow-sm mb-6"
          >
            <FaArrowLeft className="text-white" /> Konser saya
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6D19B0]/30 border border-[#8B5CF6]/40 text-[#D8B4FE] uppercase tracking-wider">
                  Edit Mode
                </span>
                <span className="text-xs text-white/50">• Status saat ini: <strong className="text-white">{concert.status}</strong></span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Edit konser</h1>
              <p className="text-xs text-white/60 mt-1">Perbarui detail, jadwal, dan informasi venue konser Anda.</p>
            </div>
            
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
              <FaMusic className="text-white text-xl" />
            </div>
          </div>
        </div>

        {/* Form Sesuai Logic Asli */}
        <form onSubmit={submit} className="bg-[#120d1d] border border-white/15 mt-7 grid gap-5 rounded-2xl p-6 sm:p-8 sm:grid-cols-2 shadow-2xl text-xs">
          
          <label className="text-white/70 sm:col-span-2 font-semibold">
            Nama konser
            <input 
              required 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.name} 
              onChange={(e) => setForm({ ...form, name: e.target.value })} 
              placeholder="Masukkan nama konser"
            />
          </label>

          <label className="text-white/70 font-semibold">
            Tanggal
            <input 
              required 
              type="date" 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.date} 
              onChange={(e) => setForm({ ...form, date: e.target.value })} 
            />
          </label>

          <label className="text-white/70 font-semibold">
            Waktu
            <input 
              required 
              type="time" 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.time} 
              onChange={(e) => setForm({ ...form, time: e.target.value })} 
            />
          </label>

          <label className="text-white/70 font-semibold">
            Mulai penjualan tiket
            <input 
              type="datetime-local" 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.startSale} 
              onChange={(e) => setForm({ ...form, startSale: e.target.value })} 
            />
          </label>

          <label className="text-white/70 font-semibold">
            Akhir penjualan tiket
            <input 
              type="datetime-local" 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all" 
              min={form.startSale || undefined} 
              value={form.endSale} 
              onChange={(e) => setForm({ ...form, endSale: e.target.value })} 
            />
          </label>

          <label className="text-white/70 font-semibold">
            Venue
            <input 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.venueName} 
              onChange={(e) => setForm({ ...form, venueName: e.target.value })} 
              placeholder="Nama venue"
            />
          </label>

          <label className="text-white/70 font-semibold">
            Kota
            <input 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.city} 
              onChange={(e) => setForm({ ...form, city: e.target.value })} 
              placeholder="Nama kota"
            />
          </label>

          <label className="text-white/70 sm:col-span-2 font-semibold">
            Alamat
            <input 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.address} 
              onChange={(e) => setForm({ ...form, address: e.target.value })} 
              placeholder="Alamat lengkap venue"
            />
          </label>

          <label className="text-white/70 sm:col-span-2 font-semibold">
            Genre
            <input 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
              value={form.genre} 
              onChange={(e) => setForm({ ...form, genre: e.target.value })} 
              placeholder="Genre musik"
            />
          </label>

          <div className="rounded-xl border border-white/10 p-4 text-white/70 sm:col-span-2 bg-black/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6D19B0]/30 border border-[#8B5CF6]/40 flex items-center justify-center shrink-0 text-white">
              <FaLayerGroup className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Informasi Inventory</p>
              <p className="mt-0.5">Inventory mengikuti kursi dan kategori tiket. Kapasitas {Number(concert.totalTickets || 0).toLocaleString('id-ID')}; harga Rp {Number(concert.minPrice || 0).toLocaleString('id-ID')}–Rp {Number(concert.maxPrice || 0).toLocaleString('id-ID')}.</p>
            </div>
          </div>

          <label className="text-white/70 sm:col-span-2 font-semibold">
            Deskripsi
            <textarea 
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all min-h-[120px]" 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              placeholder="Deskripsi konser..."
            />
          </label>

          <div className="flex items-center justify-end gap-3 sm:col-span-2 pt-3 border-t border-white/10">
            <Link 
              href="/organizer/concerts" 
              className="rounded-xl border border-white/15 bg-black/40 px-5 py-3 font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              Batal
            </Link>
            
            <button 
              disabled={saving} 
              className="rounded-xl px-6 py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
              type="submit"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin text-white w-4 h-4" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <FaSave className="text-white w-4 h-4" />
                  <span>Simpan perubahan</span>
                </>
              )}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
}