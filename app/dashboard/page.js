'use client';

import Image from 'next/image';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCalendar, FaMapMarkerAlt, FaArrowRight, FaChevronDown } from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../../components/navbar';
import { getConcertPoster, getMediaUrl } from '../../lib/media-url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
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

const PRICE_FILTERS = [
  { id: 'under_250k', label: '< Rp 250.000' },
  { id: 'over_250k', label: '> Rp 250.000' },
  { id: 'over_500k', label: '> Rp 500.000' },
  { id: 'over_1m', label: '> Rp 1.000.000' },
];

const getUserRole = (authUser) => {
  if (!authUser) return '';
  return String(
    authUser.role ||
      authUser.userRole ||
      authUser.user_type ||
      authUser.type ||
      'customer'
  ).toLowerCase();
};

export default function CustomerDashboard() {
  const {
    user,
    loading: authLoading,
    wishlistConcertIds,
    wishlistBusyConcertIds,
    wishlistLoading,
    toggleWishlist,
  } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(null);
  const recommendedScrollRef = useRef(null);
  const trendingScrollRef = useRef(null);

  const userRole = getUserRole(user);
  const isCustomer = Boolean(user) && userRole === 'customer';

  // State untuk Countdown Timer Flash Sale (2 jam 15 menit 30 detik)
  const [timeLeft, setTimeLeft] = useState(2 * 3600 + 15 * 60 + 30);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.75;
      ref.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    if (userRole !== 'customer') {
      if (userRole === 'organizer' || userRole === 'eo') {
        router.replace('/eo/dashboard');
      } else if (userRole === 'admin') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/');
      }
      return;
    }

    fetchDashboard();
  }, [user, userRole, authLoading, router]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customer/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Gagal memuat dashboard');
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData?.stats || { totalTickets: 0, upcomingEvents: 0, wishlist: 0, totalSpent: 0 };
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const recentOrders = dashboardData?.recentOrders || [];
  const publishedConcerts = dashboardData?.publishedConcerts || [];

  const wishlistCount = !wishlistLoading && Array.isArray(wishlistConcertIds)
    ? wishlistConcertIds.length
    : stats.wishlist;

  const availableLocations = useMemo(() => {
    const locations = publishedConcerts
      .map((c) => c.venue?.city || c.venue?.name || c.venueName)
      .filter(Boolean);
    return [...new Set(locations)];
  }, [publishedConcerts]);

  const handlePriceFilterClick = (filterId) => {
    setSelectedPriceFilter((prev) => (prev === filterId ? null : filterId));
  };

  const filteredConcerts = useMemo(() => {
    return publishedConcerts.filter((concert) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = concert.name?.toLowerCase().includes(q);
        const matchOrg = concert.organizer?.name?.toLowerCase().includes(q);
        const matchCat = concert.category?.toLowerCase().includes(q);
        const matchVenue = (concert.venue?.name || concert.venue?.city || concert.venueName || '')
          .toLowerCase()
          .includes(q);
        if (!matchName && !matchOrg && !matchCat && !matchVenue) return false;
      }

      if (selectedLocation !== '') {
        const city = (concert.venue?.city || '').toLowerCase();
        const venueName = (concert.venue?.name || concert.venueName || '').toLowerCase();
        const target = selectedLocation.toLowerCase();
        if (!city.includes(target) && !venueName.includes(target)) return false;
      }

      if (selectedDate !== '') {
        if (!concert.date) return false;
        const concertDateStr = format(new Date(concert.date), 'yyyy-MM-dd');
        if (concertDateStr !== selectedDate) return false;
      }

      if (selectedPriceFilter) {
        const price = Number(concert.minPrice || 0);
        if (selectedPriceFilter === 'under_250k' && price > 250000) return false;
        if (selectedPriceFilter === 'over_250k' && price <= 250000) return false;
        if (selectedPriceFilter === 'over_500k' && price <= 500000) return false;
        if (selectedPriceFilter === 'over_1m' && price <= 1000000) return false;
      }

      return true;
    });
  }, [
    publishedConcerts,
    searchQuery,
    selectedLocation,
    selectedDate,
    selectedPriceFilter,
  ]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== '' || selectedLocation !== '' || selectedDate !== '' || selectedPriceFilter
  );

  const handleClaimPromo = () => {
    toast.success('Promo diskon hingga 30% berhasil diklaim!');
  };

  if (authLoading || (isCustomer && loading)) {
    return (
      <div className="min-h-screen bg-[#04000E] text-white">
        <Navbar />
        <div className="min-h-[75vh] flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 border-4 border-[#9C419C] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-white/60 text-sm">Memuat dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isCustomer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#04000E] text-white selection:bg-[#B102A4] selection:text-white overflow-x-hidden">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        body {
          overflow-y: scroll;
        }
        body::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        
        /* Animasi Timbul (Lift Effect) pada Card Konser */
        .concert-card {
          border: 1px solid rgba(255, 255, 255, 0.15);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease;
        }
        .concert-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(177, 2, 164, 0.25);
          border: 1px solid rgba(250, 47, 132, 0.6);
        }
      `}</style>
      <Navbar />

      <section className="relative overflow-hidden bg-[#04000E] pt-8 sm:pt-12">
        <div className="absolute inset-0 z-0">
          <Image src="/icons/bground.png" alt="Background Concert" fill priority className="object-cover object-center" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-14">
          <p className="text-sm sm:text-base text-white/90 font-normal mb-6">
            Halo {user?.name || 'pengguna'} yuk kita war tiket sekarang!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link href="/my-tickets" className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/20 hover:border-[#B102A4] transition-all group shadow-md">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <img src="/icons/ticket.png" alt="Tiket Saya" className="w-4 h-4 object-contain" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white"> {stats.totalTickets} </span>
                <span className="text-xs text-white/85">Tiket Saya</span>
              </div>
            </Link>

            <Link href="/orders" className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/20 hover:border-[#B102A4] transition-all group shadow-md">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <img src="/icons/calendar.png" alt="Mendatang" className="w-4 h-4 object-contain" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white"> {stats.upcomingEvents} </span>
                <span className="text-xs text-white/85">Mendatang</span>
              </div>
            </Link>

            <Link href="/wishlist" className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/20 hover:border-[#B102A4] transition-all group shadow-md">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <img src="/icons/save.png" alt="Disimpan" className="w-4 h-4 object-contain" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-white"> {wishlistCount} </span>
                <span className="text-xs text-white/85">Disimpan</span>
              </div>
            </Link>

            <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/20 shadow-md">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <img src="/icons/dolar.png" alt="Total Pengeluaran" className="w-4 h-4 object-contain" />
              </div>
              <div>
                <span className="text-base font-bold text-white">
                  Rp {stats.totalSpent.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 flex flex-col justify-between max-w-lg w-full">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold leading-tight bg-clip-text text-transparent mb-1.5" style={{ backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)' }}>
                  Mau nonton konser apa hari ini?
                </h1>
                <p className="text-base sm:text-lg font-medium text-white mb-5"> Yuk cari tiket konser favoritmu! </p>
              </div>

              <div className="w-full space-y-3">
                <div className="relative w-full">
                  <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/30 focus-within:border-[#B102A4] transition-colors shadow-sm">
                    <img src="/icons/loupe.png" alt="Cari" className="w-4 h-4 object-contain mr-3 opacity-90" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari konser yang kamu mau.." className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/70 focus:outline-none" />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery('')} className="text-xs text-white/50 hover:text-white ml-2"> Reset </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
                  <div className="sm:col-span-7 relative">
                    <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/30 focus-within:border-[#B102A4] transition-colors shadow-sm">
                      <img src="/icons/pin.png" alt="Lokasi" className="w-4 h-4 object-contain mr-3 opacity-90 shrink-0" />
                      <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm text-white/90 focus:outline-none appearance-none cursor-pointer pr-6 [&>option]:bg-[#120724] [&>option]:text-white [&>option]:py-2">
                        <option value="">Pilih lokasi</option>
                        {availableLocations.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                      <FaChevronDown className="w-3 h-3 text-white/70 pointer-events-none shrink-0" />
                    </div>
                  </div>

                  <div className="sm:col-span-5 relative">
                    <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/30 focus-within:border-[#B102A4] transition-colors shadow-sm">
                      <img src="/icons/calendar.png" alt="Tanggal" className="w-4 h-4 object-contain mr-3 opacity-90 shrink-0" />
                      <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full bg-transparent text-xs sm:text-sm text-white/90 focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                  {PRICE_FILTERS.map((item) => {
                    const isSelected = selectedPriceFilter === item.id;
                    return (
                      <button key={item.id} type="button" onClick={() => handlePriceFilterClick(item.id)}
                        className={`relative h-10 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center shadow-sm ${
                          isSelected
                            ? 'p-[1.5px] shadow-[0_0_12px_rgba(177,2,164,0.4)]'
                            : 'border border-white/30 bg-[#04000E]/85 backdrop-blur-md text-white/90 hover:border-white/60'
                        }`}
                        style={
                          isSelected
                            ? { background: 'linear-gradient(90deg, #1E3DFF 0%, #B102A4 50%, #FA2F84 100%)' }
                            : undefined
                        }
                      >
                        <span className={`w-full h-full flex items-center justify-center rounded-[10px] px-2 ${
                            isSelected ? 'bg-[#04000E] text-white font-semibold' : ''
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-4 max-w-sm mx-auto w-full">
              <div className="relative rounded-2xl bg-[#04000E] border border-white/15 px-5 py-4 overflow-hidden flex items-center justify-between shadow-lg">
                <div className="relative z-10 max-w-[62%]">
                  <p className="text-xs font-medium text-[#9C419C] mb-0.5">
                    Promo Spesial
                  </p>
                  <h2 className="text-sm sm:text-base font-bold text-white leading-snug"> Diskon Hingga </h2>
                  <p className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent my-0.5"
                    style={{ backgroundImage: 'linear-gradient(90deg, #C332D2 0%, #AB47DF 100%)' }} > 30%
                  </p>
                  <button type="button" onClick={handleClaimPromo}
                    className="mt-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity cursor-pointer shadow"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    Klaim Promo
                  </button>
                  <p className="text-[10px] text-white/70 mt-2 leading-tight">
                    Untuk pembelian minimal 2 tiket, periode terbatas!
                  </p>
                </div>

                <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
                  <Image src="/icons/diskon.png" alt="Promo Diskon 30%" fill className="object-contain" />
                </div>
              </div>

              <div className="rounded-2xl bg-[#04000E] border border-white/15 px-5 py-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <img src="/icons/ticket.png" alt="Icon Tiket" className="w-4 h-4 object-contain" />
                    <h3 className="text-xs sm:text-sm font-semibold text-white"> Tiket Saya </h3>
                  </div>
                  <Link href="/my-tickets" className="text-xs font-medium hover:underline flex items-center gap-1" style={{ color: '#B003A4' }}> Lihat semua <span>→</span> </Link>
                </div>

                {upcomingEvents.length > 0 ? (
                  <div className="space-y-2.5">
                    {upcomingEvents.slice(0, 2).map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-white truncate">
                            {ticket.concert?.name || 'Concert'}
                          </p>
                          <p className="text-[11px] text-white/60 truncate">
                            {ticket.concert?.venue?.name || '-'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-medium text-[#9C419C]">
                            {ticket.concert?.date
                              ? format(new Date(ticket.concert.date), 'd MMM', {
                                  locale: id,
                                })
                              : '-'}
                          </p>
                          <p className="text-[10px] text-white/50">
                            {ticket.concert?.date
                              ? format(new Date(ticket.concert.date), 'HH:mm', {
                                  locale: id,
                                })
                              : '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-0.5">
                    <p className="text-xs sm:text-sm font-semibold text-white/95"> Belum ada tiket? </p>
                    <p className="text-[11px] text-white/60 mt-0.5 mb-3"> Yuk, cari konser favoritmu dan pesan sekarang </p>
                    <Link href="/concerts"
                      className="inline-block px-5 py-2 rounded-lg text-xs font-semibold text-white hover:opacity-90 transition-opacity shadow"
                      style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }} >
                      Cari Konser
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 rounded-full inline-block" style={{ background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)' }} />
            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)' }} >
              Konser Rekomendasi
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/concerts" className="text-xs sm:text-sm hover:underline transition-colors" style={{ color: '#B003A4' }} >
              Lihat semua →
            </Link>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-white/60 mb-4"> Deretan konser megah siap manjakan telinga kamu. </p>

        <div className="relative group/slider">
          <div ref={recommendedScrollRef} className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth" >
            {filteredConcerts.length > 0 ? (
              filteredConcerts.map((concert) => {
                const isWishlisted = wishlistConcertIds.includes(Number(concert.id));
                const isWishlistBusy = wishlistBusyConcertIds.includes(Number(concert.id));
                const poster =
                  getConcertPoster(concert.concertGalleries) ||
                  getMediaUrl(concert.thumbnail);
                const concertDate = concert.date ? new Date(concert.date) : null;

                return (
                  <div key={concert.id} className="concert-card relative shrink-0 w-[215px] sm:w-[225px] lg:w-[calc((100%-64px)/5)] h-[420px] rounded-[20px] overflow-hidden bg-[#120f1d] flex flex-col justify-between p-[16px] shadow-xl" >
                    <div className="absolute inset-0 z-0">
                      {poster ? (
                        <Image src={poster} alt={concert.name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl bg-[#1a0b36]">
                          🎵
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,0,14,0.98)] via-[rgba(4,0,14,0.75)] to-transparent z-1" />
                    </div>

                    <div className="relative z-2 flex justify-between items-start">
                      {concertDate && (
                        <div className="bg-black border border-white/20 rounded-[12px] px-3 py-2 text-center min-w-[50px] shadow-md">
                          <span className="block text-[16px] font-bold text-white leading-none">
                            {format(concertDate, 'dd', { locale: id })}
                          </span>
                          <span className="block text-[10px] font-bold text-white uppercase mt-[3px]">
                            {format(concertDate, 'MMM', { locale: id })}
                          </span>
                        </div>
                      )}

                      <button type="button" disabled={authLoading || wishlistLoading || isWishlistBusy}
                        onClick={() => toggleWishlist(concert.id)}
                        className="bg-transparent border-none cursor-pointer p-1 transition-all hover:opacity-80"
                        aria-label="Save wishlist"
                      >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted ? '#FFFFFF' : 'none'} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>

                    <div className="relative z-2">
                      <h3 className="text-[19px] font-[800] text-white m-0 leading-[1.2] line-clamp-1">
                        {concert.name}
                      </h3>
                      <p className="text-[11px] text-[#9ca3af] m-[4px_0_12px_0]">
                        {concert.organizer?.name || concert.description || 'Live concert'}
                      </p>

                      <div className="text-[10px] text-[#d1d5db] flex flex-col gap-[8px] mb-[16px]">
                        <div className="flex items-center gap-[6px]">
                          <Image src="/icons/kategori.png" alt="Kategori" width={14} height={14} style={{ objectFit: 'contain' }} />
                          <span className="truncate">{concert.category || 'Pop, Pop-Soul, R&B'}</span>
                        </div>

                        <div className="flex items-center gap-[6px]">
                          <Image src="/icons/loc.png" alt="Lokasi" width={14} height={14} style={{ objectFit: 'contain' }} />
                          <span className="truncate">
                            {concert.venue?.name || concert.venueName || 'Indonesia Arena, Jakarta'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-[12px]">
                        <div>
                          <span className="block text-[9px] text-[#9ca3af]">Mulai dari</span>
                          <span className="text-[12px] font-bold text-white">
                            Rp {concert.minPrice != null ? Number(concert.minPrice).toLocaleString('id-ID') : '550.000'}
                          </span>
                        </div>
                        <Link href={`/concerts/${concert.id}`}
                          className="px-[12px] py-[8px] rounded-[10px] text-[11px] font-semibold text-white shadow-md hover:opacity-90 transition-opacity shrink-0"
                          style={{ background: 'linear-gradient(to right, #8138E8, #F73BE1)' }}
                        >
                          Beli Tiket
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-12 text-white/40 text-sm">
                {hasActiveFilters ? 'Tidak ada konser yang sesuai dengan filter pencarian.' : 'Tidak ada konser rekomendasi saat ini.'}
              </div>
            )}
          </div>

          {filteredConcerts.length > 5 && (
            <button type="button" onClick={() => scrollSlider(recommendedScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors border border-white/20 shadow-lg cursor-pointer" aria-label="Scroll kanan" >
              <img src="/icons/next.png" alt="Next" className="w-4 h-4 object-contain filter invert" />
            </button>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span
              className="w-1.5 h-6 rounded-full inline-block"
              style={{ background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)' }}
            />
            <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)' }} > Trending Saat Ini </h2>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/concerts" className="text-xs sm:text-sm hover:underline transition-colors" style={{ color: '#B003A4' }} >
              Lihat semua →
            </Link>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-white/60 mb-4">
          Jangan lewatkan panggung musik terhangat saat ini!
        </p>

        <div className="relative group/slider">
          <div
            ref={trendingScrollRef}
            className="flex gap-4 overflow-x-auto pb-4 pt-1 no-scrollbar scroll-smooth"
          >
            {filteredConcerts.length > 0 ? (
              filteredConcerts.map((concert) => {
                const isWishlisted = wishlistConcertIds.includes(Number(concert.id));
                const isWishlistBusy = wishlistBusyConcertIds.includes(Number(concert.id));
                const poster =
                  getConcertPoster(concert.concertGalleries) ||
                  getMediaUrl(concert.thumbnail);
                const concertDate = concert.date ? new Date(concert.date) : null;

                return (
                  <div key={`trending-${concert.id}`} className="concert-card relative shrink-0 w-[215px] sm:w-[225px] lg:w-[calc((100%-64px)/5)] h-[420px] rounded-[20px] overflow-hidden bg-[#120f1d] flex flex-col justify-between p-[16px] shadow-xl" >
                    <div className="absolute inset-0 z-0">
                      {poster ? (
                        <Image src={poster} alt={concert.name} fill unoptimized className="object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-5xl bg-[#1a0b36]">
                          🎵
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(4,0,14,0.98)] via-[rgba(4,0,14,0.75)] to-transparent z-1" />
                    </div>

                    <div className="relative z-2 flex justify-between items-start">
                      {concertDate && (
                        <div className="bg-black border border-white/20 rounded-[12px] px-3 py-2 text-center min-w-[50px] shadow-md">
                          <span className="block text-[16px] font-bold text-white leading-none">
                            {format(concertDate, 'dd', { locale: id })}
                          </span>
                          <span className="block text-[10px] font-bold text-white uppercase mt-[3px]">
                            {format(concertDate, 'MMM', { locale: id })}
                          </span>
                        </div>
                      )}
                      <button type="button" disabled={authLoading || wishlistLoading || isWishlistBusy} onClick={() => toggleWishlist(concert.id)} className="bg-transparent border-none cursor-pointer p-1 transition-all hover:opacity-80" aria-label="Save wishlist" >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill={isWishlisted ? '#FFFFFF' : 'none'} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    </div>

                    <div className="relative z-2">
                      <h3 className="text-[19px] font-[800] text-white m-0 leading-[1.2] line-clamp-1"> {concert.name} </h3>
                      <p className="text-[11px] text-[#9ca3af] m-[4px_0_12px_0]">
                        {concert.organizer?.name || concert.description || 'Live concert'}
                      </p>

                      <div className="text-[10px] text-[#d1d5db] flex flex-col gap-[8px] mb-[16px]">
                        <div className="flex items-center gap-[6px]">
                          <Image src="/icons/kategori.png" alt="Kategori" width={14} height={14} style={{ objectFit: 'contain' }} />
                          <span className="truncate">{concert.category || 'Pop, Pop-Soul, R&B'}</span>
                        </div>

                        <div className="flex items-center gap-[6px]">
                          <Image src="/icons/loc.png" alt="Lokasi" width={14} height={14} style={{ objectFit: 'contain' }} />
                          <span className="truncate">
                            {concert.venue?.name || concert.venueName || 'Indonesia'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-white/10 pt-[12px]">
                        <div>
                          <span className="block text-[9px] text-[#9ca3af]">Mulai dari</span>
                          <span className="text-[12px] font-bold text-white"> Rp {concert.minPrice != null ? Number(concert.minPrice).toLocaleString('id-ID') : '550.000'} </span>
                        </div>
                        <Link href={`/concerts/${concert.id}`} className="px-[12px] py-[8px] rounded-[10px] text-[11px] font-semibold text-white shadow-md hover:opacity-90 transition-opacity shrink-0" style={{ background: 'linear-gradient(to right, #8138E8, #F73BE1)' }} > Beli Tiket </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full text-center py-12 text-white/40 text-sm">
                {hasActiveFilters ? 'Tidak ada konser yang sesuai dengan filter pencarian.' : 'Tidak ada konser trending saat ini.'}
              </div>
            )}
          </div>

          {filteredConcerts.length > 5 && (
            <button type="button" onClick={() => scrollSlider(trendingScrollRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/70 hover:bg-black/90 flex items-center justify-center transition-colors border border-white/20 shadow-lg cursor-pointer" aria-label="Scroll kanan" >
              <img src="/icons/next.png" alt="Next" className="w-4 h-4 object-contain filter invert" />
            </button>
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-1.5 h-6 rounded-full inline-block" style={{ background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)' }} />
          <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)' }} >
            Konser Dalam waktu dekat
          </h2>
        </div>

        <div className="space-y-3 mt-4">
          {publishedConcerts.length > 0 && filteredConcerts.length === 0 ? (
            <div className="w-full text-center py-10 rounded-2xl bg-[#080314] border border-white/15 text-white/40 text-sm">
              Tidak ada konser yang sesuai dengan filter pencarian.
            </div>
          ) : (
            (publishedConcerts.length > 0 ? filteredConcerts.slice(0, 5) : [1, 2, 3, 4, 5]).map((item, idx) => {
              const concert = typeof item === 'object' ? item : null;
              const isWishlisted = concert ? wishlistConcertIds.includes(Number(concert.id)) : false;
              const isWishlistBusy = concert ? wishlistBusyConcertIds.includes(Number(concert.id)) : false;
              const poster = concert ? (getConcertPoster(concert.concertGalleries) || getMediaUrl(concert.thumbnail)) : null;
              const concertDate = concert?.date ? new Date(concert.date) : null;

              const concertName = concert?.name || 'Winter Sound Festival 2027';
              const organizerName = concert?.organizer?.name || 'Live in concert';
              const venueCity = concert?.venue?.city || concert?.venue?.name || concert?.venueName || 'Jakarta, Indonesia';
              const venueDetail = concert?.venue?.name || 'Indonesia Arena';
              const concertTime = concert?.date ? format(new Date(concert.date), 'HH.mm', { locale: id }) + ' WIB' : '19.00 WIB';
              const concertPrice = concert?.minPrice != null ? `Rp ${Number(concert.minPrice).toLocaleString('id-ID')}` : 'Rp 550.000';

              return (
                <div
                  key={`soon-${concert?.id || idx}`}
                  className="flex flex-col md:grid md:grid-cols-12 md:items-center gap-4 p-3.5 rounded-2xl bg-[#080314] border border-white/15 hover:border-white/35 transition-all shadow-lg"
                >
                  {/* Kolom 1: Tanggal, Poster, Judul & Organizer */}
                  <div className="md:col-span-3 flex items-center gap-3.5 min-w-0">
                    <div className="w-[52px] py-2.5 rounded-xl bg-black text-white text-center border border-white/15 shrink-0 shadow">
                      <p className="text-sm font-bold leading-none">{concertDate ? format(concertDate, 'dd', { locale: id }) : '03'}</p>
                      <p className="text-[10px] font-bold uppercase mt-1 tracking-wider">{concertDate ? format(concertDate, 'MMM', { locale: id }) : 'AGU'}</p>
                    </div>

                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-white/10 shadow">
                      {poster ? (
                        <Image src={poster} alt="Poster" fill unoptimized className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-lg">🎵</div>
                      )}
                    </div>

                    <div className="min-w-0 pr-2">
                      <h4 className="font-bold text-sm sm:text-base text-white truncate">{concertName}</h4>
                      <p className="text-xs text-white/50 truncate mt-0.5">{organizerName}</p>
                    </div>
                  </div>

                  {/* Kolom 2: Lokasi */}
                  <div className="hidden md:flex md:col-span-3 items-center gap-2.5 text-xs text-white/80 min-w-0 pl-2">
                    <Image src="/icons/loc.png" alt="Loc" width={16} height={16} className="object-contain opacity-85 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{venueCity}</p>
                      <p className="text-[11px] text-white/50 truncate">{venueDetail}</p>
                    </div>
                  </div>

                  {/* Kolom 3: Jam */}
                  <div className="hidden md:flex md:col-span-2 items-center gap-2 text-xs text-white/80">
                    <Image src="/icons/clock.png" alt="Clock" width={16} height={16} className="object-contain opacity-85 shrink-0" />
                    <span className="text-xs font-medium">{concertTime}</span>
                  </div>

                  {/* Kolom 4: Harga, Beli Tiket & Save Wishlist */}
                  <div className="md:col-span-4 flex items-center justify-end gap-6 lg:gap-8">
                    <div className="text-right min-w-[95px]">
                      <p className="text-xs sm:text-sm font-bold text-white">{concertPrice}</p>
                    </div>

                    {concert ? (
                      <Link href={`/concerts/${concert.id}`} className="px-6 py-2.5 min-w-[115px] text-center rounded-xl text-xs font-semibold text-white shadow-md hover:opacity-90 transition-opacity shrink-0" style={{ background: 'linear-gradient(90deg, #B900A3 0%, #6D19B0 100%)' }} > Beli Tiket </Link>
                    ) : (
                      <button type="button" className="px-6 py-2.5 min-w-[115px] text-center rounded-xl text-xs font-semibold text-white shadow-md shrink-0" style={{ background: 'linear-gradient(90deg, #B900A3 0%, #6D19B0 100%)' }} > Beli Tiket </button>
                    )}

                    <button type="button" disabled={authLoading || wishlistLoading || isWishlistBusy} onClick={() => concert && toggleWishlist(concert.id)} className="transition-all hover:scale-110 cursor-pointer p-1 bg-transparent border-none shrink-0" aria-label="Save" >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? '#FFFFFF' : 'none'} stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-1">
          <span className="w-1.5 h-6 rounded-full inline-block" style={{ background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)' }} />
          <h2 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)' }} > FLASH SALE </h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B900A3] text-white uppercase tracking-wider"> HOT </span>
        </div>
        <p className="text-xs sm:text-sm text-white/60 mb-4"> Penawaran waktu terbatas </p>

        <div className="rounded-2xl bg-[#120724] border border-[#B900A3]/40 p-6 flex flex-col sm:flex-row items-center justify-between shadow-xl">
          <div className="flex items-center gap-5 w-full sm:w-auto mb-4 sm:mb-0">
            <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center shrink-0 border border-white/10 shadow-inner p-3">
              <Image src="/icons/flash (1).png" alt="Flash Sale" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2"> Flash Sale! </h3>
              <p className="text-xs text-white/70 mt-0.5"> Penawaran terbatas - diskon hingga 50% untuk acara-acara tertentu </p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-white/50 block">Akan berakhir</span>
              <span className="text-xl sm:text-2xl font-extrabold text-[#FA2F84] tracking-wider">{formatCountdown(timeLeft)}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
        <div className="rounded-2xl bg-white/[0.02] border border-white/10 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-bold text-white"> Pesanan Terbaru </h3>
            <Link href="/orders" className="text-xs hover:underline flex items-center gap-1 font-medium" style={{ color: '#B003A4' }} > Lihat Semua <FaArrowRight className="w-3 h-3" /> </Link>
          </div>
          {recentOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentOrders.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#04000E] border border-white/10 shadow" >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs sm:text-sm font-semibold text-white truncate"> {order.concert?.name || 'Concert'} </p>
                    <p className="text-[11px] text-white/40 mt-0.5"> Order #{order.orderNumber || order.id} </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-bold text-white"> Rp {order.totalAmount?.toLocaleString('id-ID') || 0} </p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {order.createdAt
                        ? format(new Date(order.createdAt), 'd MMM yyyy', {
                            locale: id,
                          })
                        : '-'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-xs text-center py-6"> Belum ada riwayat pesanan. </p>
          )}
        </div>
      </section>
    </div>
  );
}