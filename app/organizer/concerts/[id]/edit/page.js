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
  FaSave,
  FaLayerGroup,
} from 'react-icons/fa';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const VENUE_OPTIONS = [
  {
    name: 'Jakarta International Stadium (JIS)',
    city: 'Jakarta Utara',
    address: 'Jl. Laksamana RE Martadinata, Papanggo, Tj. Priok, Jakarta Utara',
  },
  {
    name: 'Gelora Bung Karno (GBK) Madya / Main Stadium',
    city: 'Jakarta Pusat',
    address: 'Jl. Pintu Satu Senayan, Gelora, Tanah Abang, Jakarta Pusat',
  },
  {
    name: 'Indonesia Arena GBK',
    city: 'Jakarta Pusat',
    address: 'Jl. Asia Afrika, Gelora, Tanah Abang, Jakarta Pusat',
  },
  {
    name: 'ICE BSD City',
    city: 'Tangerang',
    address: 'Jl. BSD Grand Boulevard No.1, Pagedangan, Tangerang',
  },
  {
    name: 'Beach City International Stadium',
    city: 'Jakarta Utara',
    address: 'Kawasan Ancol Taman Impian, Jl. Lodan Timur, Jakarta Utara',
  },
  {
    name: 'Eldorado Dome',
    city: 'Bandung',
    address: 'Jl. Dr. Setiabudi No.438, Gudangkahuripan, Lembang, Bandung',
  },
  {
    name: 'Jatim Expo (JX International)',
    city: 'Surabaya',
    address: 'Jl. Ahmad Yani No.99, Margorejo, Wonocolo, Surabaya',
  },
];

const QUICK_TIMES = ['15:00', '16:30', '18:00', '19:00', '19:30', '20:00', '21:00'];

const normalizeRupiah = (rawValue) => {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return 0;
  const cleaned = String(rawValue).replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  if (parsed > 0 && parsed < 1000) {
    return parsed * 1000;
  }
  return Math.round(parsed);
};

const formatRupiah = (amount) => {
  const numeric = normalizeRupiah(amount);
  return `Rp ${numeric.toLocaleString('id-ID')}`;
};

const emptyForm = {
  name: '',
  description: '',
  date: '',
  time: '19:00',
  startSale: '',
  endSale: '',
  venueChoice: '',
  venueName: '',
  city: '',
  address: '',
  genre: '',
  minPrice: '',
};

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
    if (user?.role === 'organizer' && id) {
      void loadConcert();
    }
  }, [loading, user, id]);

  const loadConcert = async () => {
    try {
      setLoadingData(true);
      const response = await api.get(`/organizer/concerts/${id}`);
      if (!response.data.success) throw new Error('Konser tidak ditemukan');
      const item = response.data.data;
      setConcert(item);

      const matchedPreset = VENUE_OPTIONS.find(
        (v) => v.name.toLowerCase() === String(item.venueName || '').toLowerCase()
      );

      setForm({
        name: item.name || '',
        description: item.description || '',
        date: item.date ? new Date(item.date).toISOString().slice(0, 10) : '',
        time: item.time ? String(item.time).slice(0, 5) : '19:00',
        startSale: item.startSale ? new Date(item.startSale).toISOString().slice(0, 16) : '',
        endSale: item.endSale ? new Date(item.endSale).toISOString().slice(0, 16) : '',
        venueChoice: matchedPreset ? matchedPreset.name : item.venueName ? 'custom' : '',
        venueName: item.venueName || '',
        city: item.city || '',
        address: item.address || '',
        genre: item.genre || '',
        minPrice: item.minPrice != null ? String(item.minPrice) : '',
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal memuat konser');
      router.push('/organizer/concerts');
    } finally {
      setLoadingData(false);
    }
  };

  const handleVenueChoiceChange = (e) => {
    const choice = e.target.value;
    if (!choice) {
      setForm((prev) => ({ ...prev, venueChoice: '' }));
      return;
    }
    if (choice === 'custom') {
      setForm((prev) => ({ ...prev, venueChoice: 'custom' }));
      return;
    }
    const preset = VENUE_OPTIONS.find((v) => v.name === choice);
    if (preset) {
      setForm((prev) => ({
        ...prev,
        venueChoice: preset.name,
        venueName: preset.name,
        city: preset.city,
        address: preset.address,
      }));
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const normalizedMinPrice = normalizeRupiah(form.minPrice);
      const currentMaxPrice = Number(concert?.maxPrice || 0);
      const payload = {
        name: form.name.trim(),
        description: form.description,
        date: form.date,
        time: form.time,
        startSale: form.startSale || null,
        endSale: form.endSale || null,
        venueName: form.venueName.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        genre: form.genre.trim(),
        minPrice: normalizedMinPrice,
        maxPrice: currentMaxPrice < normalizedMinPrice ? normalizedMinPrice : currentMaxPrice,
      };

      const response = await api.put(`/organizer/concerts/${id}`, payload);
      if (response?.data?.data) {
        setConcert(response.data.data);
      }
      toast.success('Perubahan konser berhasil disimpan');
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
        ::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <NavbarEO />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
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
                <span className="text-xs text-white/50">
                  • Status saat ini: <strong className="text-white">{concert.status}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Edit konser
              </h1>
              <p className="text-xs text-white/60 mt-1">
                Perbarui harga minimum, pilihan venue, jadwal, dan detail konser Anda.
              </p>
            </div>

            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaMusic className="text-white text-xl" />
            </div>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="bg-[#120d1d] border border-white/15 mt-7 grid gap-5 rounded-2xl p-6 sm:p-8 sm:grid-cols-2 shadow-2xl text-xs"
        >
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
            <span className="flex items-center gap-1.5">
              <FaCalendarAlt className="text-[#D8B4FE] w-3.5 h-3.5" />
              Pilih Tanggal
            </span>
            <input
              required
              type="date"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all [color-scheme:dark] cursor-pointer"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>

          <div className="text-white/70 font-semibold">
            <label className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <FaClock className="text-[#D8B4FE] w-3.5 h-3.5" />
                Pilih Jam ({form.time || '--:--'} WIB)
              </span>
            </label>
            <input
              required
              type="time"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all [color-scheme:dark] cursor-pointer"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_TIMES.map((presetTime) => {
                const active = form.time === presetTime;
                return (
                  <button
                    key={presetTime}
                    type="button"
                    onClick={() => setForm({ ...form, time: presetTime })}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                      active
                        ? 'text-white border border-[#FA2F84]'
                        : 'bg-black/40 text-white/70 border border-white/10 hover:text-white hover:border-white/30'
                    }`}
                    style={
                      active
                        ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }
                        : undefined
                    }
                  >
                    {presetTime}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="text-white/70 font-semibold">
            Harga Minimum / Price Min ({formatRupiah(form.minPrice)})
            <input
              required
              type="number"
              min="0"
              step="1000"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
              value={form.minPrice}
              onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
              placeholder="Contoh: 175000"
            />
          </label>

          <label className="text-white/70 font-semibold">
            Genre
            <input
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
              value={form.genre}
              onChange={(e) => setForm({ ...form, genre: e.target.value })}
              placeholder="Pop, Rock, Indie, Jazz"
            />
          </label>

          <label className="text-white/70 font-semibold">
            Mulai penjualan tiket
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all [color-scheme:dark]"
              value={form.startSale}
              onChange={(e) => setForm({ ...form, startSale: e.target.value })}
            />
          </label>

          <label className="text-white/70 font-semibold">
            Akhir penjualan tiket
            <input
              type="datetime-local"
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all [color-scheme:dark]"
              min={form.startSale || undefined}
              value={form.endSale}
              onChange={(e) => setForm({ ...form, endSale: e.target.value })}
            />
          </label>

          <label className="text-white/70 sm:col-span-2 font-semibold">
            <span className="flex items-center gap-1.5">
              <FaMapMarkerAlt className="text-[#D8B4FE] w-3.5 h-3.5" />
              Pilih Venue
            </span>
            <select
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d] [&>option]:text-white"
              value={form.venueChoice}
              onChange={handleVenueChoiceChange}
            >
              <option value="">-- Pilih venue konser --</option>
              {VENUE_OPTIONS.map((venue) => (
                <option key={venue.name} value={venue.name}>
                  {venue.name} ({venue.city})
                </option>
              ))}
              <option value="custom">Lainnya (Isi manual)</option>
            </select>
          </label>

          {form.venueChoice === 'custom' && (
            <label className="text-white/70 sm:col-span-2 font-semibold">
              Nama Venue Manual
              <input
                className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                value={form.venueName}
                onChange={(e) => setForm({ ...form, venueName: e.target.value })}
                placeholder="Ketik nama venue"
              />
            </label>
          )}

          <label className="text-white/70 font-semibold">
            Kota
            <input
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Nama kota"
            />
          </label>

          <label className="text-white/70 font-semibold">
            Alamat
            <input
              className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 mt-2 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat lengkap venue"
            />
          </label>

          <div className="rounded-xl border border-white/10 p-4 text-white/70 sm:col-span-2 bg-black/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6D19B0]/30 border border-[#8B5CF6]/40 flex items-center justify-center shrink-0 text-white">
              <FaLayerGroup className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">Ringkasan Harga & Kapasitas</p>
              <p className="mt-0.5">
                Kapasitas {Number(concert.totalTickets || 0).toLocaleString('id-ID')} tiket • Price
                Min baru: <strong className="text-white">{formatRupiah(form.minPrice)}</strong> •
                Max sebelumnya:{' '}
                <strong className="text-white">
                  {formatRupiah(
                    Math.max(Number(concert.maxPrice || 0), normalizeRupiah(form.minPrice))
                  )}
                </strong>
              </p>
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