// src/app/organizer/concerts/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarEO from '../../../components/navbarEO';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaCalendarAlt, 
  FaMapMarkerAlt,
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaQrcode,
  FaMusic,
  FaStar,
  FaBolt,
  FaTicketAlt
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function OrganizerConcertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }
    if (user) {
      fetchConcerts();
    }
  }, [user, loading, router]);

  const fetchConcerts = async () => {
    try {
      setLoadingConcerts(true);
      const response = await api.get('/organizer/concerts');
      if (response.data.success) {
        setConcerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching concerts:', error);
      toast.error('Gagal memuat konser');
    } finally {
      setLoadingConcerts(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'published': { color: 'text-[#D8B4FE] bg-[#6D19B0]/30 border-[#8B5CF6]/50', label: 'Published' },
      'on_sale': { color: 'text-[#D8B4FE] bg-[#6D19B0]/30 border-[#8B5CF6]/50', label: 'On Sale' },
      'draft': { color: 'text-white/60 bg-white/5 border-white/15', label: 'Draft' },
      'pending': { color: 'text-[#C4B5FD] bg-[#4C1D95]/30 border-[#7C3AED]/40', label: 'Pending Review' },
      'rejected': { color: 'text-white/70 bg-white/10 border-white/20', label: 'Rejected' },
      'approved': { color: 'text-[#E9D5FF] bg-[#6D19B0]/40 border-[#A855F7]/50', label: 'Approved' },
      'sold_out': { color: 'text-white bg-[#6D19B0] border-[#8B5CF6]', label: 'Sold Out' },
      'finished': { color: 'text-white/50 bg-white/5 border-white/10', label: 'Finished' },
      'cancelled': { color: 'text-white/50 bg-white/5 border-white/10', label: 'Cancelled' }
    };
    return statusMap[status] || { color: 'text-white/60 bg-white/5 border-white/15', label: status };
  };

  const handleDeleteConcert = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus konser ini?')) return;
    try {
      await api.delete(`/organizer/concerts/${id}`);
      toast.success('Konser berhasil dihapus!');
      fetchConcerts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus konser');
    }
  };

  const handlePublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/publish`);
      if (response.data.success) {
        toast.success('Konser berhasil dipublikasikan!');
        fetchConcerts();
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

  const handleSubmitConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/submit`);
      if (response.data.success) {
        toast.success('Konser dikirim untuk moderasi');
        fetchConcerts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim konser untuk moderasi');
    }
  };

  const handleUnpublishConcert = async (id) => {
    try {
      const response = await api.post(`/organizer/concerts/${id}/unpublish`);
      if (response.data.success) {
        toast.success('Konser berhasil di-unpublish!');
        fetchConcerts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal meng-unpublish konser');
    }
  };

  const filteredConcerts = concerts.filter(concert => {
    const matchesSearch = concert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          concert.venueName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || concert.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading || loadingConcerts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat daftar konser...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  const statusTabs = [
    { key: 'all', label: 'Semua' },
    { key: 'published', label: 'Published' },
    { key: 'on_sale', label: 'On Sale' },
    { key: 'draft', label: 'Draft' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'sold_out', label: 'Sold Out' }
  ];

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Event Management</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">My Concerts</h1>
            <p className="text-xs text-white/60 mt-1">Kelola jadwal, status publikasi, dan check-in seluruh konser Anda ({concerts.length} total konser)</p>
          </div>
          
          <Link 
            href="/organizer/concerts/create"
            className="rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaPlus className="w-3.5 h-3.5 text-white" />
            <span>Create New Concert</span>
          </Link>
        </div>

        {/* Search & Status Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama konser atau venue..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            {statusTabs.map((tab) => {
              const active = filterStatus === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setFilterStatus(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                    active
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-[#120d1d] border-white/10 text-white/60 hover:text-white hover:border-white/25'
                  }`}
                  style={active ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' } : {}}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Concerts Horizontal Command List */}
        {filteredConcerts.length > 0 ? (
          <div className="space-y-4">
            {filteredConcerts.map((concert) => {
              const statusBadge = getStatusBadge(concert.status);
              return (
                <div 
                  key={concert.id} 
                  className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 rounded-2xl p-5 transition-all shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div 
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-white/15 shadow-md"
                      style={{ background: 'linear-gradient(135deg, #2E1065 0%, #6D19B0 100%)' }}
                    >
                      <FaMusic className="w-6 h-6 text-white mb-1" />
                      <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                        {concert.genre ? concert.genre.slice(0, 8) : 'Live'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {concert.isFeatured && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#6D19B0]/30 border border-[#8B5CF6]/40 text-[10px] font-semibold text-white flex items-center gap-1">
                            <FaStar className="text-white w-2.5 h-2.5" /> Featured
                          </span>
                        )}
                        {concert.isFlashSale && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#6D19B0]/30 border border-[#8B5CF6]/40 text-[10px] font-semibold text-white flex items-center gap-1">
                            <FaBolt className="text-white w-2.5 h-2.5" /> Flash Sale
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#D8B4FE] transition-colors truncate">
                        {concert.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 text-xs text-white/60">
                        <span className="flex items-center gap-1.5">
                          <FaCalendarAlt className="text-white w-3 h-3" />
                          {concert.date ? format(new Date(concert.date), 'd MMM yyyy', { locale: id }) : '-'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="text-white w-3 h-3" />
                          {concert.venueName || concert.venue || '-'}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FaTicketAlt className="text-white w-3 h-3" />
                          {Number(concert.totalTickets || 0).toLocaleString('id-ID')} Tiket
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:text-right border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10 shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-white/40 block">Harga Mulai</span>
                    <span className="text-base font-extrabold text-[#D8B4FE]">
                      Rp {Number(concert.minPrice || 0).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-white/10">
                    <Link 
                      href={`/concerts/${concert.id}`}
                      className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <FaEye className="w-3 h-3 text-white" />
                      <span>View</span>
                    </Link>

                    <Link 
                      href={`/organizer/concerts/${concert.id}/edit`}
                      className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <FaEdit className="w-3 h-3 text-white" />
                      <span>Edit</span>
                    </Link>

                    <Link
                      href={`/organizer/scanner?concertId=${concert.id}`}
                      className="px-3 py-2 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                    >
                      <FaQrcode className="w-3 h-3 text-white" />
                      <span>Check-in</span>
                    </Link>

                    {(concert.status === 'draft' || concert.status === 'rejected') && (
                      <button 
                        onClick={() => handleSubmitConcert(concert.id)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition hover:opacity-90 flex items-center gap-1.5"
                        style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                      >
                        <FaCheckCircle className="w-3 h-3 text-white" />
                        <span>Submit</span>
                      </button>
                    )}

                    {concert.status === 'approved' && (
                      <button 
                        onClick={() => handlePublishConcert(concert.id)} 
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-md transition hover:opacity-90"
                        style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                      >
                        Publish
                      </button>
                    )}

                    {(concert.status === 'published' || concert.status === 'on_sale') && (
                      <button 
                        onClick={() => handleUnpublishConcert(concert.id)}
                        className="px-3 py-2 rounded-xl bg-[#6D19B0]/25 border border-[#8B5CF6]/40 hover:bg-[#6D19B0]/40 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                      >
                        <FaTimesCircle className="w-3 h-3 text-white" />
                        <span>Unpublish</span>
                      </button>
                    )}

                    <button 
                      onClick={() => handleDeleteConcert(concert.id)}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/15 hover:border-white/40 text-white transition-colors"
                      title="Hapus Konser"
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
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaMusic className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Belum Ada Konser</h3>
            <p className="text-xs text-white/60 mb-6 max-w-md mx-auto">
              Mulai buat konser pertamamu sekarang dan kelola penjualan tiket langsung dari panel ini.
            </p>
            <Link 
              href="/organizer/concerts/create" 
              className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaPlus className="w-3.5 h-3.5 text-white" />
              <span>Create New Concert</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}