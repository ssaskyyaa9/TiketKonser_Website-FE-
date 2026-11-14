// src/app/organizer/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarEO from '../../../components/navbarEO';
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

export default function OrganizerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [concerts, setConcerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);

  // State untuk form concert
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    venueId: '',
    venueName: '',
    venueType: '',
    venueCity: '',
    venueAddress: '',
    price: '',
    totalTickets: '',
    categoryId: '',
    rules: '',
    youtubeTrailer: '',
    startSale: '',
    endSale: '',
    isFeatured: false,
    isFlashSale: false,
    flashSalePrice: '',
    flashSaleEnd: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
    }
    if (user && user.role === 'organizer') {
      fetchAllData();
      fetchVenues();
    }
  }, [user, loading, router]);

  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      const [dashRes, concRes, ordRes, promRes] = await Promise.all([
        api.get('/organizer/dashboard'),
        api.get('/organizer/concerts'),
        api.get('/organizer/orders'),
        api.get('/organizer/promos')
      ]);

      if (dashRes.data.success) setDashboardData(dashRes.data.data);
      if (concRes.data.success) setConcerts(concRes.data.data);
      if (ordRes.data.success) setOrders(ordRes.data.data);
      if (promRes.data.success) setPromos(promRes.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data dashboard');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      if (response.data.success) {
        setVenues(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    }
  };

  const handleVenueSelect = (venueId) => {
    const venue = venues.find(v => v.id === parseInt(venueId));
    setSelectedVenue(venue);
    setFormData({
      ...formData,
      venueId: venueId,
      venueName: venue?.name || '',
      venueType: venue?.type || '',
      venueCity: venue?.city || '',
      venueAddress: venue?.address || '',
      totalTickets: venue?.capacity || formData.totalTickets
    });
  };

  const handleCreateConcert = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Nama konser wajib diisi');
        setFormLoading(false);
        return;
      }
      if (!formData.date) {
        toast.error('Tanggal konser wajib diisi');
        setFormLoading(false);
        return;
      }
      if (!formData.time) {
        toast.error('Waktu konser wajib diisi');
        setFormLoading(false);
        return;
      }
      if (!formData.venueId) {
        toast.error('Venue wajib dipilih');
        setFormLoading(false);
        return;
      }

      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        date: formData.date,
        time: formData.time,
        venueId: parseInt(formData.venueId),
        venueName: formData.venueName || '',
        venueType: formData.venueType || '',
        city: formData.venueCity || '',
        address: formData.venueAddress || '',
        minPrice: parseFloat(formData.price) || 0,
        maxPrice: parseFloat(formData.price) || 0,
        totalTickets: parseInt(formData.totalTickets) || 0,
        genre: formData.categoryId || '',
        rules: formData.rules || '',
        youtubeTrailer: formData.youtubeTrailer || '',
        startSale: formData.startSale || null,
        endSale: formData.endSale || null,
        isFeatured: formData.isFeatured || false,
        isFlashSale: formData.isFlashSale || false,
        flashSalePrice: formData.flashSalePrice ? parseFloat(formData.flashSalePrice) : null,
        flashSaleEnd: formData.flashSaleEnd || null
      };

      const response = await api.post('/organizer/concerts', payload);
      if (response.data.success) {
        toast.success('Konser berhasil dibuat!');
        setShowModal(false);
        resetForm();
        await fetchAllData();
      }
    } catch (error) {
      console.error('Error creating concert:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat konser');
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      date: '',
      time: '',
      venueId: '',
      venueName: '',
      venueType: '',
      venueCity: '',
      venueAddress: '',
      price: '',
      totalTickets: '',
      categoryId: '',
      rules: '',
      youtubeTrailer: '',
      startSale: '',
      endSale: '',
      isFeatured: false,
      isFlashSale: false,
      flashSalePrice: '',
      flashSaleEnd: ''
    });
    setSelectedVenue(null);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <svg className="w-12 h-12 text-[#B900A3] animate-spin mx-auto" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="mt-4 text-xs text-white/60">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  const stats = dashboardData?.stats || {
    totalConcerts: concerts.length,
    totalOrders: orders.length,
    revenue: 0,
    soldTickets: 0,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    availableTickets: 0
  };

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      {/* Main Content */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header Dashboard */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Dashboard</h1>
            <p className="text-xs text-white/60 mt-1">Organizer Dashboard Panel</p>
          </div>
          
          {/* Tombol Refresh dengan Border Gradasi Tanpa Ikon */}
          <button
            onClick={fetchAllData}
            className="p-[1.5px] rounded-xl transition-opacity hover:opacity-90 shadow-md"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <div className="bg-[#120d1d] hover:bg-[#191227] transition-colors rounded-[10.5px] px-5 py-2 text-xs font-semibold text-white">
              Refresh
            </div>
          </button>
        </div>

        {/* 4 Card Atas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 flex items-center gap-4 shadow-lg hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Konser Aktif</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{stats.activeConcerts ?? stats.totalConcerts}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 flex items-center gap-4 shadow-lg hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Total Pesanan</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{stats.totalOrders}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 flex items-center gap-4 shadow-lg hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Total Pendapatan</p>
              <p className="text-lg font-extrabold text-white mt-0.5">Rp {stats.revenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 flex items-center gap-4 shadow-lg hover:border-white/30 transition-all">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Tiket Terjual</p>
              <p className="text-xl font-extrabold text-white mt-0.5">{stats.soldTickets.toLocaleString()}</p>
            </div>
          </div>

        </div>

        {/* Kotak Kanan dan Kiri Penuh: Quick Stats & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Kotak Kiri: Quick Stats */}
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                {/* Ikon Header Quick Stats warna ungu */}
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#A78BFA]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">Quick Stats</h2>
              </div>

              <div className="space-y-3.5">
                <div className="flex justify-between items-center p-4 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex items-center gap-3">
                    {/* Ikon item warna putih */}
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                    </svg>
                    <span className="text-xs text-white/70">Pending Orders</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stats.pendingOrders}</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex items-center gap-3">
                    {/* Ikon item warna putih */}
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    <span className="text-xs text-white/70">Available Tickets</span>
                  </div>
                  <span className="text-sm font-bold text-white">{stats.availableTickets.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex items-center gap-3">
                    {/* Ikon item warna putih */}
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" />
                    </svg>
                    <span className="text-xs text-white/70">Active Promos</span>
                  </div>
                  <span className="text-sm font-bold text-white">{promos.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kotak Kanan: Quick Actions */}
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                {/* Ikon Header Quick Actions warna ungu */}
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[#B900A3]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M7 2v11h3v9l7-12h-4l4-8z" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">Quick Actions</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl text-white font-semibold text-xs shadow-md transition hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <span className="flex items-center gap-2.5">
                    {/* Ikon item warna putih */}
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    <span>Create New Concert</span>
                  </span>
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </button>

                <Link
                  href="/organizer/tickets"
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/15 bg-black/40 hover:border-white/30 transition-all text-white font-semibold text-xs"
                >
                  <span className="flex items-center gap-2.5">
                    {/* Ikon item warna putih */}
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
                    </svg>
                    <span>Manage Tickets</span>
                  </span>
                  <svg className="w-4 h-4 text-white/50 fill-current" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </Link>

                <Link
                  href="/organizer/scanner"
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/15 bg-black/40 hover:border-white/30 transition-all text-white font-semibold text-xs"
                >
                  <span className="flex items-center gap-2.5">
                    {/* Ikon item warna putih */}
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm8-12v8h8V3h-8zm6 6h-4V5h4v4zm-5.99 4h2v2h-2zm2 2h2v2h-2zm-2 2h2v2h-2zm4 0h2v2h-2zm2 2h2v2h-2zm-4 0h2v2h-2zm2-6h2v2h-2zm2 2h2v2h-2z" />
                    </svg>
                    <span>Scan Check-in</span>
                  </span>
                  <svg className="w-4 h-4 text-white/50 fill-current" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </Link>

                <Link
                  href="/organizer/promos"
                  className="w-full flex items-center justify-between p-4 rounded-xl border border-white/15 bg-black/40 hover:border-white/30 transition-all text-white font-semibold text-xs"
                >
                  <span className="flex items-center gap-2.5">
                    {/* Ikon item warna putih */}
                    <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z" />
                    </svg>
                    <span>Create Promo</span>
                  </span>
                  <svg className="w-4 h-4 text-white/50 fill-current" viewBox="0 0 24 24">
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Modal Create New Concert */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Create New Concert</h2>
              <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white transition-colors">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateConcert} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">
                    Concert Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                    placeholder="Enter concert name"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Genre</label>
                  <input
                    type="text"
                    name="genre"
                    value={formData.categoryId || ''}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                    placeholder="e.g. Pop, Rock, Jazz"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Description</label>
                <textarea
                  name="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                  rows="3"
                  placeholder="Describe your concert"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">
                    Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">
                    Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5 rounded-xl border border-white/10 p-4 bg-black/30">
                <p className="col-span-2 font-semibold text-white/90">Ticket Sales Period</p>
                <label className="text-white/70">
                  Mulai Penjualan
                  <input
                    type="datetime-local"
                    value={formData.startSale || ''}
                    onChange={(e) => setFormData({ ...formData, startSale: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 mt-1.5 text-white focus:outline-none"
                  />
                </label>
                <label className="text-white/70">
                  Akhir Penjualan
                  <input
                    type="datetime-local"
                    value={formData.endSale || ''}
                    min={formData.startSale || undefined}
                    onChange={(e) => setFormData({ ...formData, endSale: e.target.value })}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 mt-1.5 text-white focus:outline-none"
                  />
                </label>
              </div>

              <div className="border border-white/15 rounded-xl p-4 bg-black/30">
                <label className="flex items-center gap-2 font-semibold text-white/90 mb-2">
                  <svg className="w-4 h-4 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Select Venue <span className="text-red-400">*</span></span>
                </label>
                <select
                  value={formData.venueId}
                  onChange={(e) => handleVenueSelect(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Venue --</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} - {venue.city} ({venue.type})
                    </option>
                  ))}
                </select>

                {selectedVenue && (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/50 p-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white">{selectedVenue.name}</p>
                        <p className="text-[11px] text-white/60">{selectedVenue.city} - {selectedVenue.address}</p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px]">Type: {selectedVenue.type}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px]">Capacity: {selectedVenue.capacity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Price (Min)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                    placeholder="Minimum price"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Total Tickets</label>
                  <input
                    type="number"
                    name="totalTickets"
                    value={formData.totalTickets || ''}
                    onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                    placeholder="Total tickets"
                    min="1"
                    max={selectedVenue?.capacity || 10000}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Rules</label>
                <textarea
                  name="rules"
                  value={formData.rules || ''}
                  onChange={(e) => setFormData({...formData, rules: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                  rows="2"
                  placeholder="Concert rules and regulations"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-center">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">YouTube Trailer</label>
                  <input
                    type="url"
                    name="youtubeTrailer"
                    value={formData.youtubeTrailer || ''}
                    onChange={(e) => setFormData({...formData, youtubeTrailer: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-white/40 focus:outline-none"
                    placeholder="YouTube video URL"
                  />
                </div>
                <div className="flex items-center gap-5 pt-4">
                  <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured || false}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="rounded border-white/20 bg-black/50"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFlashSale || false}
                      onChange={(e) => setFormData({...formData, isFlashSale: e.target.checked})}
                      className="rounded border-white/20 bg-black/50"
                    />
                    <span>Flash Sale</span>
                  </label>
                </div>
              </div>

              {formData.isFlashSale && (
                <div className="grid grid-cols-2 gap-3.5 rounded-xl border border-white/15 p-4 bg-black/30">
                  <div>
                    <label className="block font-semibold text-white/80 mb-1.5">Flash Sale Price</label>
                    <input
                      type="number"
                      name="flashSalePrice"
                      value={formData.flashSalePrice || ''}
                      onChange={(e) => setFormData({...formData, flashSalePrice: e.target.value})}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:outline-none"
                      placeholder="Discounted price"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-white/80 mb-1.5">Flash Sale End</label>
                    <input
                      type="datetime-local"
                      name="flashSaleEnd"
                      value={formData.flashSaleEnd || ''}
                      onChange={(e) => setFormData({...formData, flashSaleEnd: e.target.value})}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-2.5 font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 rounded-xl py-2.5 font-bold text-white shadow-md transition hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {formLoading ? (
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  ) : (
                    'Create Concert'
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