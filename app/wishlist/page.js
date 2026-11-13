'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FaTicketAlt, 
  FaBookmark, 
  FaRegBookmark,
  FaMapMarkerAlt, 
  FaSpinner,
  FaArrowRight,
  FaMusic
} from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import Navbar from '../../components/navbar';
import { getConcertPoster, getMediaUrl } from '../../lib/media-url';

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

export default function WishlistPage() {
  const { user, loading, removeWishlist } = useAuth();
  const router = useRouter();
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [removingIds, setRemovingIds] = useState([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return;

    let isActive = true;
    const loadWishlist = async () => {
      try {
        const response = await api.get('/customer/wishlist');
        if (isActive && response.data.success) {
          setWishlist(response.data.data);
        }
      } catch (error) {
        if (isActive) {
          console.error('Error fetching wishlist:', error);
          toast.error('Gagal memuat wishlist');
        }
      } finally {
        if (isActive) setLoadingWishlist(false);
      }
    };

    loadWishlist();
    return () => {
      isActive = false;
    };
  }, [user, loading, router]);

  const handleToggleWishlist = async (concertId) => {
    setRemovingIds((prev) => [...prev, concertId]);

    const removed = await removeWishlist(concertId);
    if (removed) {
      setTimeout(() => {
        setWishlist((current) =>
          current.filter((item) => Number(item.concertId) !== Number(concertId))
        );
        setRemovingIds((prev) => prev.filter((id) => id !== concertId));
      }, 250);
    } else {
      setRemovingIds((prev) => prev.filter((id) => id !== concertId));
    }
  };

  const formatDateParts = (value) => {
    if (!value || !Number.isFinite(new Date(value).getTime())) {
      return { day: '--', month: '---' };
    }
    const dateObj = new Date(value);
    return {
      day: format(dateObj, 'dd', { locale: id }),
      month: format(dateObj, 'MMM', { locale: id }).toUpperCase(),
    };
  };

  const formatPrice = (value) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(Number(value) || 0);

  if (loading || loadingWishlist) {
    return (
      <div className="min-h-screen bg-[#07050c] text-white">
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center pt-20">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-[#FA2F84] animate-spin mx-auto" />
            <p className="mt-4 text-white/60 text-sm">Memuat tiket disimpan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#FA2F84]/30">
      <Navbar />

      <main className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header Section */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-8">
          {/* Sisi Kiri: Icon & Judul */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className="relative flex h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 items-center justify-center rounded-2xl p-[1.5px]"
              style={{
                background: 'linear-gradient(135deg, #1E3DFF 0%, #F73BE1 100%)',
              }}
            >
              <div
                className="flex h-full w-full items-center justify-center rounded-[14.5px]"
                style={{
                  background: 'linear-gradient(135deg, #5119B0 0%, #220B4A 100%)',
                }}
              >
                <FaTicketAlt className="h-6 w-6 sm:h-7 sm:w-7 text-white -rotate-12" />
              </div>
            </div>

            <div>
              <h1
                className="text-xl sm:text-2xl font-semibold tracking-tight bg-clip-text text-transparent inline-block"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)',
                }}
              >
                Tiket Disimpan
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-white/65">
                Konser yang kamu simpan, siap ditemukan kembali kapan saja.
              </p>
            </div>
          </div>

          {/* Sisi Kanan: Angka & Garis (Angka persis di tengah-tengah garisnya) */}
          <div className="flex flex-col items-center">
            <span
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)',
              }}
            >
              {wishlist.length}
            </span>
            <div
              className="mt-2.5 h-1.5 w-16 sm:w-20 rounded-full"
              style={{
                background: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)',
              }}
            />
          </div>
        </div>

        {/* Grid Daftar Tiket */}
        <section className="mt-8">
          {wishlist.length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {wishlist.map((item) => {
                const concert = item.concert;
                const poster =
                  getConcertPoster(concert?.concertGalleries) ||
                  getMediaUrl(concert?.thumbnail || concert?.banner);
                const availableTickets = Number(concert?.availableTickets);
                const isSoldOut =
                  Number.isFinite(availableTickets) && availableTickets <= 0;
                const venueName =
                  concert?.venue?.name ||
                  concert?.venueName ||
                  'Lokasi belum diatur';
                const city = concert?.venue?.city || concert?.city;
                const fullLocation = city ? `${venueName}, ${city}` : venueName;
                const { day, month } = formatDateParts(concert?.date);
                const isRemoving = removingIds.includes(item.concertId);

                return (
                  <article
                    key={item.id}
                    className="group relative aspect-[3/4.3] overflow-hidden rounded-2xl border border-white/15 bg-[#120d1d] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#F73BE1]/60 hover:shadow-[0_10px_30px_rgba(250,47,132,0.18)]"
                  >
                    {poster ? (
                      <Image
                        src={poster}
                        alt={`Poster ${concert?.name || 'konser'}`}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#5119B0]/40 via-[#120d1d] to-[#FA2F84]/20">
                        <FaMusic className="h-12 w-12 text-white/25" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-[#090612] via-[#090612]/65 to-black/20" />

                    <div className="absolute inset-x-3.5 top-3.5 flex items-start justify-between">
                      <div className="flex flex-col items-center justify-center rounded-xl border border-white/15 bg-black/60 px-2.5 py-1.5 backdrop-blur-md">
                        <span className="text-sm font-bold leading-none text-white">
                          {day}
                        </span>
                        <span className="mt-1 text-[10px] font-semibold tracking-wider text-white/75">
                          {month}
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label={`Hapus ${concert?.name || 'konser'} dari simpanan`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleToggleWishlist(item.concertId);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/30 text-white backdrop-blur-sm transition-transform active:scale-90 hover:bg-black/50"
                      >
                        {isRemoving ? (
                          <FaRegBookmark className="h-5 w-5 text-white" />
                        ) : (
                          <FaBookmark className="h-5 w-5 text-white" />
                        )}
                      </button>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4">
                      <Link
                        href={`/concerts/${concert?.slug || concert?.id}`}
                        className="block"
                      >
                        <h2 className="line-clamp-1 text-lg font-bold text-white transition-colors group-hover:text-[#FA2F84]">
                          {concert?.name || 'Konser'}
                        </h2>
                      </Link>

                      <p className="mt-0.5 line-clamp-1 text-xs text-white/65">
                        {concert?.tagline ||
                          concert?.organizer?.name ||
                          'Live in concert'}
                      </p>

                      <div className="mt-3 space-y-1.5 text-[11px] text-white/75">
                        <div className="flex items-center gap-2">
                          <FaMusic className="h-3 w-3 flex-shrink-0 text-white" />
                          <span className="truncate">
                            {concert?.genre || 'Pop, Live Music'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="h-3 w-3 flex-shrink-0 text-white" />
                          <span className="truncate">{fullLocation}</span>
                        </div>
                      </div>

                      <div className="mt-3.5 flex items-end justify-between gap-2 border-t border-white/15 pt-3">
                        <div className="min-w-0">
                          <p className="text-[10px] text-white/55">Mulai dari</p>
                          <p className="truncate text-sm font-bold text-white">
                            {formatPrice(concert?.minPrice)}
                          </p>
                        </div>

                        <Link
                          href={`/concerts/${concert?.slug || concert?.id}`}
                          className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition ${
                            isSoldOut
                              ? 'bg-white/15 text-white/60 hover:bg-white/20'
                              : 'bg-gradient-to-r from-[#8E2DE2] to-[#C8228B] shadow-md hover:opacity-90'
                          }`}
                        >
                          {isSoldOut ? 'Habis' : 'Beli Tiket'}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-16 text-center">
              <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl p-[1.5px]"
                style={{
                  background: 'linear-gradient(135deg, #1E3DFF 0%, #F73BE1 100%)',
                }}
              >
                <div
                  className="flex h-full w-full items-center justify-center rounded-[14.5px]"
                  style={{
                    background: 'linear-gradient(135deg, #5119B0 0%, #220B4A 100%)',
                  }}
                >
                  <FaBookmark className="h-6 w-6 text-white" />
                </div>
              </div>
              <h2 className="mt-6 text-xl sm:text-2xl font-bold text-white">
                Belum ada tiket disimpan
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-white/60">
                Simpan konser favoritmu dengan menekan ikon bookmark agar mudah ditemukan kembali di sini.
              </p>
              <Link
                href="/concerts"
                className="mt-7 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{
                  background: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)',
                }}
              >
                Jelajahi Konser <FaArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}