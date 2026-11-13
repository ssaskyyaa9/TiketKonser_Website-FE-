// src/app/organizer/dashboard/page.js
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarEO from '../../../components/navbarEO';
import { 
  FaMusic, 
  FaTicketAlt, 
  FaMoneyBillWave, 
  FaUsers,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaImage,
  FaGift,
  FaSpinner,
  FaUpload,
  FaQrcode
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getMediaUrl } from '../../../lib/media-url';

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
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [concerts, setConcerts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [promos, setPromos] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);

  // ==================== TICKET STATE ====================
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedConcert, setSelectedConcert] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [ticketForm, setTicketForm] = useState({
    category: '',
    price: '',
    quota: '',
    concertId: ''
  });

  // ==================== GALLERY STATE ====================
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    concertId: '',
    caption: '',
    type: 'photo',
    image: null
  });

  const [uploadingGallery, setUploadingGallery] = useState(false);

  // ==================== SEAT STATE ====================
  const [seats, setSeats] = useState([]);
  const [loadingSeats, setLoadingSeats] = useState(true);
  const [selectedSeatConcert, setSelectedSeatConcert] = useState('');
  const [showSeatModal, setShowSeatModal] = useState(false);
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

  // State untuk form concert
  const [showModal, setShowModal] = useState(false);
  const [editingConcert, setEditingConcert] = useState(null);
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

  // ==================== USE EFFECT ====================
  useEffect(() => {
    const requestedTab = new URLSearchParams(window.location.search).get('tab');
    if (requestedTab === 'profile') setActiveTab('profile');
  }, []);

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
      fetchTickets();
      fetchGallery();
      fetchSeats();
    }
  }, [user, loading, router]);

  // ==================== FETCH FUNCTIONS ====================
  const fetchAllData = async () => {
    setLoadingData(true);
    try {
      await Promise.all([
        fetchDashboard(),
        fetchConcerts(),
        fetchOrders(),
        fetchPromos()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await api.get('/organizer/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  };

  const fetchConcerts = async () => {
    try {
      const response = await api.get('/organizer/concerts');
      if (response.data.success) {
        setConcerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast.error('Gagal memuat konser');
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

  const fetchOrders = async () => {
    try {
      const response = await api.get('/organizer/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchPromos = async () => {
    try {
      const response = await api.get('/organizer/promos');
      if (response.data.success) {
        setPromos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
    }
  };

  // ==================== TICKET FUNCTIONS ====================
  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const url = selectedConcert 
        ? `/organizer/tickets?concertId=${selectedConcert}` 
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
        fetchTickets();
        fetchConcerts();
        fetchDashboard();
      }
    } catch (error) {
      console.error('Error saving ticket:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan tiket');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tiket ini?')) return;
    try {
      await api.delete(`/organizer/tickets/${id}`);
      toast.success('Tiket berhasil dihapus!');
      fetchTickets();
    } catch (error) {
      console.error('Error deleting ticket:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus tiket');
    }
  };

  // ==================== GALLERY FUNCTIONS ====================
  const fetchGallery = async () => {
    try {
      setLoadingGallery(true);
      const response = await api.get('/organizer/gallery');
      if (response.data.success) {
        setGalleryImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryForm.concertId || galleryForm.concertId === '' || galleryForm.concertId === 'undefined') {
      toast.error('Pilih konser terlebih dahulu');
      return;
    }
    if (!galleryForm.image) {
      toast.error('Pilih gambar terlebih dahulu');
      return;
    }

    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append('concertId', galleryForm.concertId);
      formData.append('caption', galleryForm.caption || '');
      formData.append('type', galleryForm.type || 'photo');
      formData.append('image', galleryForm.image);

      const response = await api.post('/organizer/gallery', formData);

      if (response.data.success) {
        toast.success('Gambar berhasil diupload!');
        setShowGalleryModal(false);
        setGalleryForm({ concertId: '', caption: '', type: 'photo', image: null });
        fetchGallery();
      }
    } catch (error) {
      console.error('Error uploading gallery:', error);
      toast.error(error.response?.data?.message || 'Gagal upload gambar');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;
    try {
      await api.delete(`/organizer/gallery/${id}`);
      toast.success('Gambar berhasil dihapus!');
      fetchGallery();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Gagal menghapus gambar');
    }
  };

  // ==================== SEAT FUNCTIONS ====================
  const fetchSeats = async () => {
    try {
      setLoadingSeats(true);
      const url = selectedSeatConcert 
        ? `/organizer/seats?concertId=${selectedSeatConcert}` 
        : '/organizer/seats';
      const response = await api.get(url);
      if (response.data.success) {
        setSeats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
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
      if (editingTicket) {
        response = await api.put(`/organizer/seats/${editingTicket.id}`, payload);
      } else {
        response = await api.post('/organizer/seats', payload);
      }

      if (response.data.success) {
        toast.success('Kursi berhasil ditambahkan!');
        setShowSeatModal(false);
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
        fetchSeats();
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
      fetchSeats();
    } catch (error) {
      console.error('Error deleting seat:', error);
      toast.error('Gagal menghapus kursi');
    }
  };

  // ==================== CONCERT FUNCTIONS ====================
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
        await fetchConcerts();
        await fetchDashboard();
      }
    } catch (error) {
      console.error('Error creating concert:', error);
      toast.error(error.response?.data?.message || 'Gagal membuat konser');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateConcert = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        date: formData.date,
        time: formData.time,
        venueId: formData.venueId ? parseInt(formData.venueId) : null,
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

      const response = await api.put(`/organizer/concerts/${editingConcert.id}`, payload);
      
      if (response.data.success) {
        toast.success('Konser berhasil diupdate!');
        setShowModal(false);
        setEditingConcert(null);
        resetForm();
        await fetchConcerts();
        await fetchDashboard();
      }
    } catch (error) {
      console.error('Error updating concert:', error);
      toast.error(error.response?.data?.message || 'Gagal mengupdate konser');
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

  const handleDeleteConcert = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini?')) return;
    try {
      await api.delete(`/organizer/concerts/${id}`);
      toast.success('Konser berhasil dihapus!');
      fetchConcerts();
      fetchDashboard();
    } catch (error) {
      console.error('Error deleting concert:', error);
      toast.error(error.response?.data?.message || 'Gagal menghapus konser');
    }
  };

  const handlePublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/publish`);
      if (response.data.success) {
        toast.success('Konser berhasil dipublikasikan!');
        fetchConcerts();
        fetchDashboard();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Gagal mempublikasikan konser';
      if (error.response?.data?.message?.includes('already published')) {
        toast.info('Konser ini sudah dipublikasikan sebelumnya.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleUnpublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/unpublish`);
      if (response.data.success) {
        toast.success('Konser berhasil di-unpublish!');
        fetchConcerts();
        fetchDashboard();
      }
    } catch (error) {
      console.error('Error unpublishing concert:', error);
      toast.error(error.response?.data?.message || 'Gagal meng-unpublish konser');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'published': { color: 'text-green-400 bg-green-400/10', label: 'Published' },
      'on_sale': { color: 'text-green-400 bg-green-400/10', label: 'On Sale' },
      'paid': { color: 'text-green-400 bg-green-400/10', label: 'Paid' },
      'pending': { color: 'text-yellow-400 bg-yellow-400/10', label: 'Pending' },
      'draft': { color: 'text-gray-400 bg-gray-400/10', label: 'Draft' },
      'rejected': { color: 'text-red-400 bg-red-400/10', label: 'Rejected' },
      'approved': { color: 'text-blue-400 bg-blue-400/10', label: 'Approved' },
      'sold_out': { color: 'text-red-400 bg-red-400/10', label: 'Sold Out' },
      'finished': { color: 'text-gray-400 bg-gray-400/10', label: 'Finished' },
      'cancelled': { color: 'text-red-400 bg-red-400/10', label: 'Cancelled' }
    };
    return statusMap[status] || { color: 'text-white/40 bg-white/5', label: status };
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-[#B900A3] animate-spin mx-auto" />
          <p className="mt-4 text-white/60">Loading dashboard...</p>
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

  // ==================== RENDER DASHBOARD ====================
  const renderDashboard = () => (
    <div>
      {/* 4 Card Atas: Memanjang ke samping dengan ikon di dalam lingkaran bergradasi 7317AF ke B102A4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Konser Aktif</p>
              <p className="text-xl font-extrabold text-white">{stats.activeConcerts ?? stats.totalConcerts}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.11-.9-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/></svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Total Pesanan</p>
              <p className="text-xl font-extrabold text-white">{stats.totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Total Pendapatan</p>
              <p className="text-lg font-extrabold text-[#F472B6]">Rp {stats.revenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-4 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
            </div>
            <div>
              <p className="text-xs text-white/50">Tiket Terjual</p>
              <p className="text-xl font-extrabold text-white">{stats.soldTickets.toLocaleString()}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Bagian Bawah: Susunan Atas-Bawah untuk Quick Stats & Quick Actions */}
      <div className="space-y-6">
        
        {/* Quick Stats di Atas */}
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">📊 Quick Stats</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex justify-between items-center p-3.5 rounded-xl border border-white/10 bg-black/40">
              <span className="text-xs text-white/60">Pending Orders</span>
              <span className="text-sm font-bold text-yellow-400">{stats.pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-xl border border-white/10 bg-black/40">
              <span className="text-xs text-white/60">Available Tickets</span>
              <span className="text-sm font-bold text-green-400">{stats.availableTickets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3.5 rounded-xl border border-white/10 bg-black/40">
              <span className="text-xs text-white/60">Active Promos</span>
              <span className="text-sm font-bold text-[#F472B6]">{promos.length}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions di Bawah */}
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => setShowModal(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40 hover:border-[#FA2F84] transition-all text-left"
            >
              <span className="flex items-center gap-2.5 text-xs font-semibold">
                <FaPlus className="text-[#38BDF8]" />
                <span>Create New Concert</span>
              </span>
              <span className="text-white/40">→</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('tickets')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40 hover:border-[#FA2F84] transition-all text-left"
            >
              <span className="flex items-center gap-2.5 text-xs font-semibold">
                <FaTicketAlt className="text-[#A78BFA]" />
                <span>Manage Tickets</span>
              </span>
              <span className="text-white/40">→</span>
            </button>

            <Link
              href="/organizer/scanner"
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40 hover:border-[#FA2F84] transition-all text-left"
            >
              <span className="flex items-center gap-2.5 text-xs font-semibold">
                <FaQrcode className="text-green-400" />
                <span>Scan Check-in</span>
              </span>
              <span className="text-white/40">→</span>
            </Link>
            
            <button 
              onClick={() => router.push('/organizer/promos')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40 hover:border-[#FA2F84] transition-all text-left"
            >
              <span className="flex items-center gap-2.5 text-xs font-semibold">
                <FaGift className="text-[#F472B6]" />
                <span>Create Promo</span>
              </span>
              <span className="text-white/40">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  // ==================== RENDER CONCERTS ====================
  const renderConcerts = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Concerts</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
        >
          <FaPlus className="w-3.5 h-3.5" />
          Create Concert
        </button>
      </div>

      <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-white/50 text-xs">
                <th className="px-6 py-3.5">Concert</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Venue</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {concerts.length > 0 ? (
                concerts.map((concert) => {
                  const statusBadge = getStatusBadge(concert.status);
                  return (
                    <tr key={concert.id} className="border-t border-white/5 hover:bg-white/5 transition-colors text-xs">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-white">{concert.name || 'Unnamed Concert'}</p>
                          <p className="text-[11px] text-white/40">{concert.genre || 'General'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {concert.date ? format(new Date(concert.date), 'd MMM yyyy', { locale: id }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-white/70">
                        {concert.venueName || concert.venue || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#F472B6]">
                        Rp {concert.minPrice?.toLocaleString() || 0}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg border border-white/15 bg-black/40 hover:bg-white/10 transition-colors">
                            <FaEye className="w-3.5 h-3.5 text-[#38BDF8]" />
                          </button>
                          <button 
                            onClick={() => {
                              setEditingConcert(concert);
                              setFormData({
                                name: concert.name || '',
                                description: concert.description || '',
                                date: concert.date ? concert.date.split('T')[0] : '',
                                time: concert.time || '',
                                venueId: concert.venueId || '',
                                venueName: concert.venueName || concert.venue || '',
                                venueType: concert.venueType || '',
                                venueCity: concert.city || '',
                                venueAddress: concert.address || '',
                                price: concert.minPrice || '',
                                totalTickets: concert.totalTickets || '',
                                categoryId: concert.categoryId || '',
                                rules: concert.rules || '',
                                youtubeTrailer: concert.youtubeTrailer || '',
                                startSale: concert.startSale || '',
                                endSale: concert.endSale || '',
                                isFeatured: concert.isFeatured || false,
                                isFlashSale: concert.isFlashSale || false,
                                flashSalePrice: concert.flashSalePrice || '',
                                flashSaleEnd: concert.flashSaleEnd || ''
                              });
                              if (concert.venueId) {
                                const venue = venues.find(v => v.id === concert.venueId);
                                setSelectedVenue(venue);
                              }
                              setShowModal(true);
                            }}
                            className="p-2 rounded-lg border border-white/15 bg-black/40 hover:bg-white/10 transition-colors"
                          >
                            <FaEdit className="w-3.5 h-3.5 text-[#A78BFA]" />
                          </button>
                          {['draft', 'pending', 'approved'].includes(concert.status) && (
                            <button 
                              onClick={() => handleDeleteConcert(concert.id)}
                              title="Hapus konser"
                              className="p-2 rounded-lg border border-white/15 bg-black/40 hover:bg-red-500/10 transition-colors"
                            >
                              <FaTrash className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}
                          {concert.status === 'approved' && (
                            <button 
                              onClick={() => handlePublishConcert(concert.id)}
                              className="p-2 rounded-lg border border-white/15 bg-black/40 hover:bg-green-500/10 transition-colors"
                              title="Publish Concert"
                            >
                              <FaCheckCircle className="w-3.5 h-3.5 text-green-400" />
                            </button>
                          )}
                          {(concert.status === 'published' || concert.status === 'on_sale') && (
                            <button 
                              onClick={() => handleUnpublishConcert(concert.id)}
                              className="p-2 rounded-lg border border-white/15 bg-black/40 hover:bg-yellow-500/10 transition-colors"
                              title="Unpublish Concert"
                            >
                              <FaTimesCircle className="w-3.5 h-3.5 text-yellow-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-white/40 text-xs">
                    Belum ada konser. Buat konser pertama Anda!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER TICKET MANAGEMENT ====================
  const renderTicketManagement = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Ticket Management</h2>
        <button 
          onClick={() => {
            setEditingTicket(null);
            setTicketForm({ category: '', price: '', quota: '', concertId: concerts[0]?.id || '' });
            setShowTicketModal(true);
          }}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
        >
          <FaPlus className="w-3.5 h-3.5" />
          Add Ticket Category
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedConcert}
          onChange={(e) => {
            setSelectedConcert(e.target.value);
            fetchTickets();
          }}
          className="rounded-xl border border-white/15 bg-[#120d1d] px-4 py-2 text-xs text-white w-64 focus:border-[#FA2F84] focus:outline-none"
        >
          <option value="">All Concerts</option>
          {concerts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loadingTickets ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="w-8 h-8 text-[#B900A3] animate-spin" />
        </div>
      ) : tickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#A78BFA]">{ticket.category}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  ticket.sold < ticket.quota ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {ticket.quota > 0 ? Math.round((ticket.sold / ticket.quota) * 100) : 0}% terjual
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-white/70">
                  <span>Price</span>
                  <span className="font-bold text-[#F472B6]">Rp {ticket.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Quota</span>
                  <span className="text-white">{ticket.quota.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Sold</span>
                  <span className="text-green-400">{ticket.sold.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Available</span>
                  <span className="text-[#38BDF8]">{ticket.available.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-white/70">
                  <span>Concert</span>
                  <span className="text-white/80 truncate max-w-[140px]">{ticket.concert?.name || '-'}</span>
                </div>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#6D19B0] to-[#B900A3] rounded-full"
                  style={{ width: `${ticket.quota > 0 ? (ticket.sold / ticket.quota) * 100 : 0}%` }}
                />
              </div>
              <div className="flex gap-2 mt-4">
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
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FaEdit className="w-3.5 h-3.5 text-[#A78BFA]" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteTicket(ticket.id)}
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <FaTrash className="w-3.5 h-3.5" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-12 text-center shadow-lg">
          <FaTicketAlt className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Belum Ada Kategori Tiket</h3>
          <p className="text-xs text-white/60">Tambahkan kategori tiket untuk konser Anda.</p>
        </div>
      )}

      {showTicketModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">
                {editingTicket ? 'Edit Ticket Category' : 'Add Ticket Category'}
              </h2>
              <button onClick={() => setShowTicketModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleTicketSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Category *</label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
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
                <label className="block font-semibold text-white/80 mb-1.5">Price (Rp) *</label>
                <input
                  type="number"
                  value={ticketForm.price}
                  onChange={(e) => setTicketForm({...ticketForm, price: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Harga tiket"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Quota *</label>
                <input
                  type="number"
                  value={ticketForm.quota}
                  onChange={(e) => setTicketForm({...ticketForm, quota: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Jumlah tiket"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Concert *</label>
                <select
                  value={ticketForm.concertId}
                  onChange={(e) => setTicketForm({...ticketForm, concertId: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  required
                >
                  <option value="">Pilih Konser</option>
                  {concerts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowTicketModal(false)} className="flex-1 rounded-xl border border-white/15 bg-black/40 py-2.5 font-semibold text-white hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 rounded-xl py-2.5 font-bold text-white shadow-md transition hover:opacity-90 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}>
                  {formLoading ? <FaSpinner className="w-4 h-4 animate-spin" /> : (editingTicket ? 'Update Ticket' : 'Add Ticket')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== RENDER SEAT LAYOUT ====================
  const renderSeatLayout = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Seat Layout</h2>
        <button 
          onClick={() => {
            setShowSeatModal(true);
            setSeatForm({ ...seatForm, concertId: concerts[0]?.id || '' });
          }}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
        >
          <FaPlus className="w-3.5 h-3.5" />
          Add Seat
        </button>
      </div>

      <div className="mb-4">
        <select
          value={selectedSeatConcert}
          onChange={(e) => {
            setSelectedSeatConcert(e.target.value);
            fetchSeats();
          }}
          className="rounded-xl border border-white/15 bg-[#120d1d] px-4 py-2 text-xs text-white w-64 focus:border-[#FA2F84] focus:outline-none"
        >
          <option value="">All Concerts</option>
          {concerts.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {loadingSeats ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="w-8 h-8 text-[#B900A3] animate-spin" />
        </div>
      ) : seats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {seats.map((seat) => (
            <div key={seat.id} className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-4 shadow-lg text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Seat {seat.row}{seat.number}</h4>
                  <p className="text-white/60">{seat.sectionName || 'Default'}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                  seat.status === 'available' ? 'bg-green-500/20 text-green-400' :
                  seat.status === 'booked' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {seat.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div>
                  <span className="text-white/50">Category</span>
                  <p className="font-medium text-white uppercase">{seat.category}</p>
                </div>
                <div>
                  <span className="text-white/50">Price</span>
                  <p className="font-bold text-[#F472B6]">Rp {seat.price?.toLocaleString() || 0}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                <button className="flex-1 rounded-xl border border-white/15 bg-black/40 py-1.5 font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                  <FaEdit className="w-3 h-3 text-[#A78BFA]" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteSeat(seat.id)}
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-1.5 font-semibold hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-1"
                >
                  <FaTrash className="w-3 h-3" />
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-12 text-center shadow-lg">
          <FaUsers className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Belum Ada Kursi</h3>
          <p className="text-xs text-white/60">Tambahkan kursi untuk konser Anda.</p>
        </div>
      )}

      {showSeatModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Add New Seat</h2>
              <button onClick={() => setShowSeatModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSeatSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-white/80 mb-1">Concert *</label>
                <select
                  value={seatForm.concertId}
                  onChange={(e) => setSeatForm({...seatForm, concertId: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
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
                  <label className="block font-semibold text-white/80 mb-1">Row *</label>
                  <input
                    type="text"
                    value={seatForm.row}
                    onChange={(e) => setSeatForm({...seatForm, row: e.target.value.toUpperCase()})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                    placeholder="A"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Number *</label>
                  <input
                    type="number"
                    value={seatForm.number}
                    onChange={(e) => setSeatForm({...seatForm, number: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                    placeholder="1"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Section Name</label>
                <input
                  type="text"
                  value={seatForm.sectionName}
                  onChange={(e) => setSeatForm({...seatForm, sectionName: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="VIP, Regular, etc"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Category *</label>
                  <select
                    value={seatForm.category}
                    onChange={(e) => setSeatForm({...seatForm, category: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
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
                  <label className="block font-semibold text-white/80 mb-1">Price (Rp) *</label>
                  <input
                    type="number"
                    value={seatForm.price}
                    onChange={(e) => setSeatForm({...seatForm, price: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                    placeholder="150000"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Status</label>
                <select
                  value={seatForm.status}
                  onChange={(e) => setSeatForm({...seatForm, status: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="reserved">Reserved</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowSeatModal(false)} className="flex-1 rounded-xl border border-white/15 bg-black/40 py-2.5 font-semibold text-white hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formLoading} className="flex-1 rounded-xl py-2.5 font-bold text-white shadow-md transition hover:opacity-90 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}>
                  {formLoading ? <FaSpinner className="w-4 h-4 animate-spin" /> : 'Add Seat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== RENDER GALLERY ====================
  const renderGallery = () => (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Gallery</h2>
        <button 
          onClick={() => setShowGalleryModal(true)}
          className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 flex items-center gap-2"
          style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
        >
          <FaUpload className="w-3.5 h-3.5" />
          Upload Image
        </button>
      </div>

      {loadingGallery ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="w-8 h-8 text-[#B900A3] animate-spin" />
        </div>
      ) : galleryImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image) => (
            <div key={image.id} className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] overflow-hidden shadow-lg group">
              <div className="relative aspect-square bg-gradient-to-br from-[#6D19B0]/30 to-[#B900A3]/30">
                <Image
                  src={getMediaUrl(image.image)}
                  alt={image.caption || `${image.type} ${image.concert?.name || 'konser'}`}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="p-3 text-xs">
                <p className="font-bold text-white truncate">{image.caption || 'No caption'}</p>
                <p className="text-[11px] text-white/50 capitalize">{image.type}</p>
                <p className="text-[11px] text-white/40 truncate">{image.concert?.name || 'No concert'}</p>
                <div className="flex gap-2 mt-2 pt-2 border-t border-white/10">
                  <button className="flex-1 rounded-xl border border-white/15 bg-black/40 py-1 font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-1">
                    <FaEye className="w-3 h-3 text-[#38BDF8]" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDeleteGallery(image.id)}
                    className="flex-1 rounded-xl border border-white/15 bg-black/40 py-1 font-semibold hover:bg-red-500/10 transition-colors text-red-400 flex items-center justify-center gap-1"
                  >
                    <FaTrash className="w-3 h-3" />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-12 text-center shadow-lg">
          <FaImage className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-1">Belum Ada Gambar</h3>
          <p className="text-xs text-white/60">Upload poster, banner, atau galeri konser Anda.</p>
        </div>
      )}

      {showGalleryModal && (
        <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 sm:p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">Upload Image</h2>
              <button onClick={() => setShowGalleryModal(false)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-white/80 mb-1">
                  Concert <span className="text-red-400">*</span>
                </label>
                <select
                  value={galleryForm.concertId}
                  onChange={(e) => setGalleryForm({...galleryForm, concertId: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  required
                >
                  <option value="">-- Pilih Konser --</option>
                  {concerts && concerts.length > 0 ? (
                    concerts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Belum ada konser</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">
                  Image File <span className="text-red-400">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setGalleryForm({...galleryForm, image: file});
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-1.5 text-white focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#6D19B0] file:text-white hover:file:bg-[#B900A3]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Caption</label>
                <input
                  type="text"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({...galleryForm, caption: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Deskripsi gambar"
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1">Type</label>
                <select
                  value={galleryForm.type}
                  onChange={(e) => setGalleryForm({...galleryForm, type: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                >
                  <option value="photo">Photo</option>
                  <option value="poster">Poster</option>
                  <option value="banner">Banner</option>
                </select>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="flex-1 rounded-xl border border-white/15 bg-black/40 py-2.5 font-semibold text-white hover:bg-white/10 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploadingGallery || !galleryForm.concertId || !galleryForm.image} 
                  className={`flex-1 rounded-xl py-2.5 font-bold text-white shadow-md transition hover:opacity-90 flex items-center justify-center gap-2 ${(!galleryForm.concertId || !galleryForm.image) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {uploadingGallery ? <FaSpinner className="w-4 h-4 animate-spin" /> : 'Upload Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ==================== RENDER ORDERS ====================
  const renderOrders = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Orders</h2>
      <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="text-left text-white/50 text-xs">
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Tickets</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <tr key={order.id} className="border-t border-white/5 hover:bg-white/5 transition-colors text-xs">
                    <td className="px-6 py-4 font-bold text-white">{order.user?.name || order.customerName || '-'}</td>
                    <td className="px-6 py-4 text-white/70">{order.tickets?.length || 0}</td>
                    <td className="px-6 py-4 font-extrabold text-[#F472B6]">Rp {order.totalAmount?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white/70">
                      {order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy', { locale: id }) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/organizer/orders/${order.id}`} className="p-2 rounded-xl border border-white/15 bg-black/40 hover:bg-white/10 transition-colors inline-block">
                        <FaEye className="w-3.5 h-3.5 text-[#38BDF8]" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ==================== RENDER REVENUE ====================
  const renderRevenue = () => (
    <div>
      <h2 className="text-2xl font-bold mb-6">Revenue</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg">
          <p className="text-xs text-white/50">Total Revenue</p>
          <p className="text-2xl font-extrabold text-[#F472B6] mt-1">Rp {stats.revenue.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg">
          <p className="text-xs text-white/50">This Month</p>
          <p className="text-2xl font-extrabold text-[#38BDF8] mt-1">Rp {(stats.revenue * 0.4).toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg">
          <p className="text-xs text-white/50">Growth</p>
          <p className="text-2xl font-extrabold text-green-400 mt-1">+12.5%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 shadow-lg">
        <h3 className="font-bold mb-4 text-sm">Revenue Chart</h3>
        <div className="h-48 flex items-end gap-4">
          {dashboardData?.monthlyRevenue?.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-gradient-to-t from-[#6D19B0] to-[#B900A3] rounded-t-lg transition-all"
                style={{ height: `${Math.min((parseInt(item.total) / 10000000) * 100, 100)}%` }}
              />
              <span className="text-[10px] text-white/50">{item.month?.substring(5) || index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== RENDER PROFILE ====================
  const renderProfile = () => (
    <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-8 max-w-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Organizer Profile</h2>
      <p className="text-xs text-white/60 mb-6">Kelola identitas penyelenggara dan informasi kontak melalui halaman profil.</p>
      <Link href="/organizer/profile" className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 inline-block" style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}>Buka Pengaturan Profil</Link>
    </div>
  );

  // ==================== RENDER PROMOS ====================
  const renderPromos = () => (
    <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] max-w-2xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-2">Promo Management</h2>
      <p className="mb-6 text-xs text-white/60">Buat kode voucher, atur batas penggunaan, dan kelola periode promosi tiket.</p>
      <Link href="/organizer/promos" className="rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90 inline-block" style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}>Kelola Promo</Link>
    </div>
  );

  // ==================== MODAL CREATE/EDIT CONCERT ====================
  const renderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 bg-dark/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 sm:p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">
              {editingConcert ? 'Edit Concert' : 'Create New Concert'}
            </h2>
            <button onClick={() => setShowModal(false)} className="text-white/60 hover:text-white">✕</button>
          </div>

          <form onSubmit={editingConcert ? handleUpdateConcert : handleCreateConcert} className="space-y-3.5 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-white/80 mb-1">
                  Concert Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Enter concert name"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-white/80 mb-1">Genre</label>
                <input
                  type="text"
                  name="genre"
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="e.g. Pop, Rock, Jazz"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-white/80 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                rows="3"
                placeholder="Describe your concert"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-white/80 mb-1">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold text-white/80 mb-1">
                  Time <span className="text-red-400">*</span>
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time || ''}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 p-3.5 bg-black/20">
              <p className="col-span-2 font-semibold text-white/90">Ticket sales period</p>
              <label className="text-white/70">
                Mulai penjualan
                <input
                  type="datetime-local"
                  value={formData.startSale || ''}
                  onChange={(e) => setFormData({ ...formData, startSale: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 mt-1 text-white focus:outline-none"
                />
              </label>
              <label className="text-white/70">
                Akhir penjualan
                <input
                  type="datetime-local"
                  value={formData.endSale || ''}
                  min={formData.startSale || undefined}
                  onChange={(e) => setFormData({ ...formData, endSale: e.target.value })}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 mt-1 text-white focus:outline-none"
                />
              </label>
            </div>

            <div className="border border-[#FA2F84]/30 rounded-xl p-3.5 bg-[#6D19B0]/10">
              <label className="block font-semibold text-white/90 mb-1.5">
                🏟️ Select Venue <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.venueId}
                onChange={(e) => handleVenueSelect(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
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
                <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🏟️</div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{selectedVenue.name}</p>
                      <p className="text-[11px] text-white/60">{selectedVenue.city} - {selectedVenue.address}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">Type: {selectedVenue.type}</span>
                        <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px]">Capacity: {selectedVenue.capacity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-white/80 mb-1">Price (Min)</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Minimum price"
                  min="0"
                />
              </div>
              <div>
                <label className="block font-semibold text-white/80 mb-1">Total Tickets</label>
                <input
                  type="number"
                  name="totalTickets"
                  value={formData.totalTickets || ''}
                  onChange={(e) => setFormData({...formData, totalTickets: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Total tickets"
                  min="1"
                  max={selectedVenue?.capacity || 10000}
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-white/80 mb-1">Rules</label>
              <textarea
                name="rules"
                value={formData.rules || ''}
                onChange={(e) => setFormData({...formData, rules: e.target.value})}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                rows="2"
                placeholder="Concert rules and regulations"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block font-semibold text-white/80 mb-1">YouTube Trailer</label>
                <input
                  type="url"
                  name="youtubeTrailer"
                  value={formData.youtubeTrailer || ''}
                  onChange={(e) => setFormData({...formData, youtubeTrailer: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-white focus:border-[#FA2F84] focus:outline-none"
                  placeholder="YouTube video URL"
                />
              </div>
              <div className="flex items-center gap-4 pt-4">
                <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured || false}
                    onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                    className="rounded border-white/20 bg-dark/50"
                  />
                  ⭐ Featured
                </label>
                <label className="flex items-center gap-2 text-white/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFlashSale || false}
                    onChange={(e) => setFormData({...formData, isFlashSale: e.target.checked})}
                    className="rounded border-white/20 bg-dark/50"
                  />
                  ⚡ Flash Sale
                </label>
              </div>
            </div>

            {formData.isFlashSale && (
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#FA2F84]/30 p-3.5 bg-black/30">
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Flash Sale Price</label>
                  <input
                    type="number"
                    name="flashSalePrice"
                    value={formData.flashSalePrice || ''}
                    onChange={(e) => setFormData({...formData, flashSalePrice: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-white focus:outline-none"
                    placeholder="Discounted price"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1">Flash Sale End</label>
                  <input
                    type="datetime-local"
                    name="flashSaleEnd"
                    value={formData.flashSaleEnd || ''}
                    onChange={(e) => setFormData({...formData, flashSaleEnd: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-1.5 text-white focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-white/15 bg-black/40 py-2.5 font-semibold text-white hover:bg-white/10 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={formLoading} className="flex-1 rounded-xl py-2.5 font-bold text-white shadow-md transition hover:opacity-90 flex items-center justify-center gap-2" style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}>
                {formLoading ? <FaSpinner className="w-4 h-4 animate-spin" /> : (editingConcert ? 'Update Concert' : 'Create Concert')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'concerts':
        return renderConcerts();
      case 'tickets':
        return renderTicketManagement();
      case 'seats':
        return renderSeatLayout();
      case 'gallery':
        return renderGallery();
      case 'promos':
        return renderPromos();
      case 'orders':
        return renderOrders();
      case 'revenue':
        return renderRevenue();
      case 'analytics':
        return <div className="text-center py-8 text-white/60 text-xs">Analytics - <Link href="/organizer/analytics" className="text-[#38BDF8] hover:underline">Go to Analytics</Link></div>;
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar Atas */}
      <NavbarEO />

      {/* Main Content dengan Padding Atas */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Tab Menu Navigasi Organizer */}
        <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-white/10 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'concerts', label: 'Konser' },
            { id: 'tickets', label: 'Tiket' },
            { id: 'seats', label: 'Kursi' },
            { id: 'gallery', label: 'Galeri' },
            { id: 'promos', label: 'Promo' },
            { id: 'orders', label: 'Pesanan' },
            { id: 'revenue', label: 'Pendapatan' },
            { id: 'analytics', label: 'Analitik' },
            { id: 'profile', label: 'Profil' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'text-white shadow-md'
                  : 'border border-white/15 bg-[#120d1d] text-white/60 hover:text-white hover:border-[#FA2F84]/40'
              }`}
              style={activeTab === tab.id ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' } : {}}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="ml-auto px-4 py-2 rounded-xl border border-red-400/30 bg-red-500/10 text-xs font-semibold text-red-300 hover:bg-red-500/20 transition-all"
          >
            Logout
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold capitalize text-white">{activeTab}</h1>
            <p className="text-xs text-white/60 mt-0.5">Organizer Dashboard Panel</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium border border-[#FA2F84]/30 bg-[#FA2F84]/10 text-[#FA2F84]">
              🏢 {user?.name}
            </span>
            <button 
              onClick={fetchAllData}
              className="px-3.5 py-1.5 rounded-xl border border-white/15 bg-[#120d1d] text-xs font-semibold text-white hover:bg-white/10 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FaSpinner className="w-3.5 h-3.5 text-[#38BDF8]" />
              Refresh
            </button>
          </div>
        </div>

        {renderContent()}
        {renderModal()}
      </main>
    </div>
  );
}