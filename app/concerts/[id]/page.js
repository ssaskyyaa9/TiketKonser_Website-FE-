'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/navbar';
import NavbarEO from '../../../components/navbarEO';
import VenueCategoryMap from '../../../components/VenueCategoryMap';
import { FaBookmark, FaRegBookmark, FaSpinner, FaMusic } from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getConcertPoster } from '../../../lib/media-url';

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

export default function ConcertDetailPage() {
  const { id: concertId } = useParams();
  const { user, wishlistConcertIds, toggleWishlist: toggleConcertWishlist } = useAuth();
  const router = useRouter();
  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showMap, setShowMap] = useState(false);
  const [selectedTicketQuantities, setSelectedTicketQuantities] = useState({});
  const [seatMapData, setSeatMapData] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(true);

  const isOrganizer = user?.role === 'organizer';
  const isWishlist = wishlistConcertIds.includes(Number(concert?.id));

  useEffect(() => {
    if (concertId) {
      fetchConcert();
      fetchSeats();
    }
  }, [concertId]);

  const fetchConcert = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/concerts/${concertId}`);
      if (response.data.success) {
        setConcert(response.data.data);
      } else {
        toast.error('Konser tidak ditemukan');
        router.push(isOrganizer ? '/organizer/concerts' : '/concerts');
      }
    } catch (error) {
      console.error('Error fetching concert:', error);
      toast.error('Gagal memuat detail konser');
    } finally {
      setLoading(false);
    }
  };

  const fetchSeats = async () => {
    try {
      setLoadingSeats(true);
      const response = await api.get(`/concerts/${concertId}/seats`);
      if (response.data.success) {
        setSeatMapData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
    } finally {
      setLoadingSeats(false);
    }
  };

  const handleBack = () => {
    if (isOrganizer) {
      router.push('/organizer/concerts');
      return;
    }
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const toggleWishlist = async () => {
    if (isOrganizer) return;
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }
    await toggleConcertWishlist(concert.id);
  };

  const handleBuyTicket = () => {
    if (isOrganizer) {
      toast.error('Akun Event Organizer tidak dapat membeli tiket');
      return;
    }
    const selectedCategories = Object.entries(selectedTicketQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([categoryId, quantity]) => `${categoryId}:${quantity}`);

    if (selectedCategories.length === 0) {
      toast.error('Pilih kategori tiket terlebih dahulu');
      return;
    }

    const checkoutPath = `/checkout?concert=${concert.id}&categories=${selectedCategories.join(',')}`;
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`);
      return;
    }

    router.push(checkoutPath);
  };

  const updateTicketQuantity = (ticketCategory, change) => {
    if (isOrganizer) return;
    setSelectedTicketQuantities((current) => {
      const currentQuantity = Number(current[ticketCategory.id] || 0);
      const nextQuantity = currentQuantity + change;
      const totalSelected = Object.values(current).reduce(
        (sum, quantity) => sum + Number(quantity || 0),
        0
      );
      if (
        nextQuantity < 0 ||
        nextQuantity > Number(ticketCategory.available || 0) ||
        (change > 0 && totalSelected >= 10)
      ) {
        return current;
      }
      return { ...current, [ticketCategory.id]: nextQuantity };
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'EEEE, d MMMM yyyy', { locale: id });
    } catch (error) {
      return '-';
    }
  };

  const ticketCategories = seatMapData?.ticketCategories || [];
  const totalSelectedTickets = Object.values(selectedTicketQuantities).reduce(
    (sum, quantity) => sum + Number(quantity || 0),
    0
  );

  const getCategoryStyle = (categoryName = '') => {
    const name = categoryName.toLowerCase().trim();
    if (name.includes('vvip')) {
      return { dot: 'bg-[#F472B6]', text: 'text-[#F472B6]', border: 'border-[#F472B6]/40' };
    }
    if (name.includes('vip')) {
      return { dot: 'bg-[#A78BFA]', text: 'text-[#A78BFA]', border: 'border-[#A78BFA]/40' };
    }
    if (name.includes('reguler') || name.includes('regular')) {
      return { dot: 'bg-[#38BDF8]', text: 'text-[#38BDF8]', border: 'border-[#38BDF8]/40' };
    }
    return { dot: 'bg-cyan-400', text: 'text-cyan-400', border: 'border-cyan-400/40' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c]">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 text-[#B900A3] animate-spin mx-auto" />
          <p className="mt-4 text-white/60 text-sm">Memuat detail tiket...</p>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c]">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold mb-2 text-white">Konser tidak ditemukan</h2>
          <Link
            href={isOrganizer ? '/organizer/concerts' : '/concerts'}
            className="btn-primary inline-block mt-4"
          >
            {isOrganizer ? 'Kembali ke Konser Saya' : 'Kembali ke Daftar Konser'}
          </Link>
        </div>
      </div>
    );
  }

  const concertPoster = getConcertPoster(concert.concertGalleries);
  const venueName =
    concert.venueName || concert.venue?.name || 'Gelora Bung Karno Main Stadium, Jakarta';
  const soldTickets = concert.soldTickets || 9;
  const totalTickets = concert.totalTickets || 100;
  const soldPercentage = Math.min(100, Math.round((soldTickets / totalTickets) * 100));

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        html,
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Navbar menyesuaikan role akun */}
      {isOrganizer ? <NavbarEO /> : <Navbar />}

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Tombol Kembali */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-5 text-1x1 font-medium text-white/90 transition-colors hover:text-white cursor-pointer"
          >
            <Image
              src="/icons/previous.png"
              alt="Kembali"
              width={30}
              height={30}
              unoptimized
              className="object-contain"
            />
            {isOrganizer ? 'Kembali ke Konser Saya' : 'Kembali'}
          </button>
        </div>

        {/* Layout Utama 2 Kolom */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ================= KOLOM KIRI (7 Kolom) ================= */}
          <div className="lg:col-span-7 space-y-4">
            {/* Box Media / Poster atau Peta Denah */}
            <div className="relative overflow-hidden rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-3.5 shadow-lg">
              {showMap ? (
                <div className="space-y-1">
                  <div className="h-[285px] w-full overflow-hidden rounded-xl bg-black/50">
                    <VenueCategoryMap
                      concert={concert}
                      venue={concert?.venue}
                      ticketCategories={ticketCategories}
                    />
                  </div>
                </div>
              ) : (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
                  {concertPoster ? (
                    <Image
                      src={concertPoster}
                      alt={`Poster ${concert.name}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#6D19B0]/40 to-[#B900A3]/20">
                      <FaMusic className="h-16 w-16 text-white/30" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Box Detail Info Konser */}
            <div className="relative rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] px-5 py-4.5 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {concert.name}
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-white/75">
                    {concert.description ||
                      concert.tagline ||
                      'Yuk seruin weekend dengan nonton konser di GBK'}
                  </p>
                </div>

                {!isOrganizer && (
                  <button
                    onClick={toggleWishlist}
                    aria-label="Simpan ke wishlist"
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white transition-transform active:scale-95"
                  >
                    {isWishlist ? (
                      <FaBookmark className="w-4 h-4 text-white" />
                    ) : (
                      <FaRegBookmark className="w-4 h-4 text-white" />
                    )}
                  </button>
                )}
              </div>

              <div className="my-3 h-[1px] w-full bg-white/10" />

              <div className="space-y-3 text-2x1 text-white/95">
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/calendar.png"
                    alt="Calendar"
                    width={16}
                    height={16}
                    unoptimized
                    className="object-contain shrink-0"
                  />
                  <span>
                    <strong className="font-semibold text-white">Tanggal :</strong>{' '}
                    {concert.dateLabel || formatDate(concert.date)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/pin.png"
                    alt="Location"
                    width={17}
                    height={17}
                    unoptimized
                    className="object-contain shrink-0"
                  />
                  <span>
                    <strong className="font-semibold text-white">Lokasi :</strong> {venueName}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/jam.png"
                    alt="Clock"
                    width={16}
                    height={16}
                    unoptimized
                    className="object-contain shrink-0"
                  />
                  <span>
                    <strong className="font-semibold text-white">Waktu :</strong>{' '}
                    {concert.time ? concert.time.slice(0, 5) + ':30' : '18:30:30'}
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="rounded-xl px-4 bottom-7 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {showMap ? 'Tutup Denah' : 'Lihat denah'}
                </button>
              </div>
            </div>
          </div>

          {/* ================= KOLOM KANAN (5 Kolom) ================= */}
          <div className="lg:col-span-5 space-y-7">
            {/* Box Info Tiket Ringkasan */}
            <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-white">Info tiket</h3>

              <div className="space-y-3 text-2x1 sm:text-sm">
                <div className="flex justify-between items-center text-white/75">
                  <span>Harga mulai</span>
                  <span className="font-bold text-white">
                    Rp {concert.minPrice?.toLocaleString('id-ID') || '250.000'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white/75">
                  <span>Tiket tersedia</span>
                  <span className="font-bold text-white">{concert.availableTickets || 99}</span>
                </div>
                <div className="flex justify-between items-center text-white/75">
                  <span>Tiket terjual</span>
                  <span className="font-bold text-white">{soldTickets}</span>
                </div>
                <div className="flex justify-between items-center text-white/75">
                  <span>Kapasitas</span>
                  <span className="font-bold text-white">{totalTickets}</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-xs text-white/60 mb-1">
                  <span>Tiket terjual {soldPercentage}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${soldPercentage}%`,
                      background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* List Kategori Tiket */}
            <div className="space-y-4 -mt-4">
              {ticketCategories.length > 0 ? (
                ticketCategories.map((ticketCategory) => {
                  const quantity = Number(selectedTicketQuantities[ticketCategory.id] || 0);
                  const style = getCategoryStyle(ticketCategory.category);

                  return (
                    <div
                      key={ticketCategory.id}
                      className={`rounded-2xl border ${style.border} bg-[#120d1d] p-5 sm:p-5 shadow-lg flex items-center justify-between gap-4`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span className={`h-3.5 w-3.5 rounded-full ${style.dot}`} />
                          <h3 className="font-bold text-white text-base sm:text-lg">
                            {ticketCategory.category}
                          </h3>
                        </div>
                        <p className={`mt-1.5 text-base sm:text-lg font-extrabold ${style.text}`}>
                          Rp {Number(ticketCategory.price).toLocaleString('id-ID')}
                        </p>
                        <p className="mt-1 text-xs text-white/60">
                          Tersedia {ticketCategory.available} tiket
                        </p>
                      </div>

                      {!isOrganizer && (
                        <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/15">
                          <button
                            type="button"
                            onClick={() => updateTicketQuantity(ticketCategory, -1)}
                            disabled={quantity === 0}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold transition hover:bg-white/20 disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-bold text-sm sm:text-base">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateTicketQuantity(ticketCategory, 1)}
                            disabled={
                              quantity >= Number(ticketCategory.available) ||
                              totalSelectedTickets >= 10
                            }
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold transition hover:bg-white/20 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <>
                  <div className="rounded-2xl border border-[#38BDF8]/40 bg-[#120d1d] p-4.5 sm:p-5 shadow-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#38BDF8]" />
                        <h3 className="font-bold text-white text-base sm:text-lg">Regular</h3>
                      </div>
                      <p className="mt-1.5 text-base sm:text-lg font-extrabold text-[#38BDF8]">
                        Rp 250.000
                      </p>
                      <p className="mt-1 text-xs text-white/60">Tersedia 50 tiket</p>
                    </div>
                    {!isOrganizer && (
                      <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/15">
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold">
                          -
                        </span>
                        <span className="w-6 text-center font-bold text-sm sm:text-base">0</span>
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold">
                          +
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#A78BFA]/40 bg-[#120d1d] p-4.5 sm:p-5 shadow-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#A78BFA]" />
                        <h3 className="font-bold text-white text-base sm:text-lg">VIP</h3>
                      </div>
                      <p className="mt-1.5 text-base sm:text-lg font-extrabold text-[#A78BFA]">
                        Rp 750.000
                      </p>
                      <p className="mt-1 text-xs text-white/60">Tersedia 29 tiket</p>
                    </div>
                    {!isOrganizer && (
                      <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/15">
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold">
                          -
                        </span>
                        <span className="w-6 text-center font-bold text-sm sm:text-base">0</span>
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold">
                          +
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-[#F472B6]/40 bg-[#120d1d] p-4.5 sm:p-5 shadow-lg flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="h-3.5 w-3.5 rounded-full bg-[#F472B6]" />
                        <h3 className="font-bold text-white text-base sm:text-lg">VVIP</h3>
                      </div>
                      <p className="mt-1.5 text-base sm:text-lg font-extrabold text-[#F472B6]">
                        Rp 1.500.000
                      </p>
                      <p className="mt-1 text-xs text-white/60">Tersedia 20 tiket</p>
                    </div>
                    {!isOrganizer && (
                      <div className="flex items-center gap-3 bg-black/40 px-3 py-2 rounded-xl border border-white/15">
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold">
                          -
                        </span>
                        <span className="w-6 text-center font-bold text-sm sm:text-base">0</span>
                        <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 text-white text-sm font-bold">
                          +
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tombol Utama Bawah Penuh (hanya untuk customer/non-organizer) */}
        {!isOrganizer && (
          <div className="mt-6">
            <button
              onClick={handleBuyTicket}
              disabled={totalSelectedTickets === 0}
              className="w-full rounded-2xl py-4 text-base sm:text-lg font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
              style={{
                background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
              }}
            >
              Yuk Lanjutkan beli ({totalSelectedTickets} tiket) nya
            </button>
          </div>
        )}
      </main>
    </div>
  );
}