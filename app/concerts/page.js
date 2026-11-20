'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import Navbar from '../../components/navbar';
import { useAuth } from '../../context/AuthContext';
import { getConcertPoster, getMediaUrl } from '../../lib/media-url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PRICE_FILTERS = [
  { id: 'under_250k', label: '< Rp 250.000' },
  { id: 'over_250k', label: '> Rp 250.000' },
  { id: 'over_500k', label: '> Rp 500.000' },
  { id: 'over_1m', label: '> Rp 1.000.000' },
];

export default function ConcertsPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    wishlistConcertIds,
    wishlistBusyConcertIds,
    wishlistLoading,
    toggleWishlist,
  } = useAuth();

  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedPriceFilter, setSelectedPriceFilter] = useState(null);

  useEffect(() => {
    const fetchConcerts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/concerts`);
        const rows = response?.data?.data || [];
        setConcerts(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error('Failed to load concerts list:', error);
        setConcerts([]);
      } finally {
        setLoading(false);
      }
    };

    void fetchConcerts();
  }, []);

  const availableLocations = useMemo(() => {
    const locations = concerts
      .map((c) => c.venue?.city || c.venue?.name || c.venueName)
      .filter(Boolean);
    return [...new Set(locations)];
  }, [concerts]);

  const handlePriceFilterClick = (filterId) => {
    setSelectedPriceFilter((prev) => (prev === filterId ? null : filterId));
  };

  const filteredConcerts = useMemo(() => {
    return concerts.filter((concert) => {
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
  }, [concerts, searchQuery, selectedLocation, selectedDate, selectedPriceFilter]);

  const hasActiveFilters = Boolean(
    searchQuery.trim() !== '' || selectedLocation !== '' || selectedDate !== '' || selectedPriceFilter
  );

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

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

      <section className="relative overflow-hidden bg-[#04000E] pt-24 pb-8">
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[820px] h-[280px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6D19B0 0%, #B900A3 55%, transparent 75%)' }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2.5 text-sm font-medium text-white/90 transition-colors hover:text-white cursor-pointer"
            >
              <Image
                src="/icons/previous.png"
                alt="Kembali"
                width={30}
                height={30}
                unoptimized
                className="object-contain"
              />
              Kembali
            </button>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3">
              <span
                className="w-1.5 h-7 rounded-full inline-block"
                style={{ background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)' }}
              />
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent"
                style={{ backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)' }}
              >
                Semua Konser
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-white/60 mt-1.5">
              Temukan jadwal konser favoritmu dan amankan tiketnya sekarang.
            </p>
          </div>

          <div className="w-full rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="relative w-full">
              <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E] border border-white/25 focus-within:border-[#B102A4] transition-colors shadow-sm">
                <img src="/icons/loupe.png" alt="Cari" className="w-4 h-4 object-contain mr-3 opacity-90" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari konser yang kamu mau.."
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/60 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-white/50 hover:text-white ml-2 cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 w-full">
              <div className="sm:col-span-7 relative">
                <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E] border border-white/25 focus-within:border-[#B102A4] transition-colors shadow-sm">
                  <img src="/icons/pin.png" alt="Lokasi" className="w-4 h-4 object-contain mr-3 opacity-90 shrink-0" />
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-white/90 focus:outline-none appearance-none cursor-pointer pr-6 [&>option]:bg-[#120724] [&>option]:text-white [&>option]:py-2"
                  >
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
                <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E] border border-white/25 focus-within:border-[#B102A4] transition-colors shadow-sm">
                  <img src="/icons/calendar.png" alt="Tanggal" className="w-4 h-4 object-contain mr-3 opacity-90 shrink-0" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm text-white/90 focus:outline-none [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full pt-0.5">
              {PRICE_FILTERS.map((item) => {
                const isSelected = selectedPriceFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handlePriceFilterClick(item.id)}
                    className={`relative h-10 rounded-xl text-xs font-medium transition-all duration-200 flex items-center justify-center shadow-sm cursor-pointer ${
                      isSelected
                        ? 'p-[1.5px] shadow-[0_0_12px_rgba(177,2,164,0.4)]'
                        : 'border border-white/25 bg-[#04000E] text-white/90 hover:border-white/55'
                    }`}
                    style={
                      isSelected
                        ? { background: 'linear-gradient(90deg, #1E3DFF 0%, #B102A4 50%, #FA2F84 100%)' }
                        : undefined
                    }
                  >
                    <span
                      className={`w-full h-full flex items-center justify-center rounded-[10px] px-2 ${
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
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-2">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="h-[420px] rounded-[20px] bg-[#120f1d] border border-white/10 animate-pulse p-4 flex flex-col justify-between"
              >
                <div className="w-12 h-14 rounded-[12px] bg-white/10" />
                <div className="space-y-2.5">
                  <div className="h-5 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                  <div className="h-3 w-2/3 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredConcerts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredConcerts.map((concert) => {
              const isWishlisted = Array.isArray(wishlistConcertIds)
                ? wishlistConcertIds.includes(Number(concert.id))
                : false;
              const isWishlistBusy = Array.isArray(wishlistBusyConcertIds)
                ? wishlistBusyConcertIds.includes(Number(concert.id))
                : false;
              const poster =
                getConcertPoster(concert.concertGalleries) ||
                getMediaUrl(concert.thumbnail);
              const concertDate = concert.date ? new Date(concert.date) : null;

              return (
                <div
                  key={concert.id}
                  className="concert-card relative w-full h-[420px] rounded-[20px] overflow-hidden bg-[#120f1d] flex flex-col justify-between p-[16px] shadow-xl"
                >
                  <div className="absolute inset-0 z-0">
                    {poster ? (
                      <Image
                        src={poster}
                        alt={concert.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
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

                    <button
                      type="button"
                      disabled={authLoading || wishlistLoading || isWishlistBusy || !user}
                      onClick={() => user && toggleWishlist(concert.id)}
                      className="bg-transparent border-none cursor-pointer p-1 transition-all hover:opacity-80 disabled:opacity-50"
                      aria-label="Save wishlist"
                    >
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill={isWishlisted ? '#FFFFFF' : 'none'}
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                    </button>
                  </div>

                  <div className="relative z-2">
                    <h3 className="text-[19px] font-[800] text-white m-0 leading-[1.2] line-clamp-1">
                      {concert.name}
                    </h3>
                    <p className="text-[11px] text-[#9ca3af] m-[4px_0_12px_0] line-clamp-1">
                      {concert.organizer?.name || concert.description || 'Live concert'}
                    </p>

                    <div className="text-[10px] text-[#d1d5db] flex flex-col gap-[8px] mb-[16px]">
                      <div className="flex items-center gap-[6px]">
                        <Image
                          src="/icons/kategori.png"
                          alt="Kategori"
                          width={14}
                          height={14}
                          unoptimized
                          style={{ objectFit: 'contain' }}
                        />
                        <span className="truncate">{concert.category || 'Pop, Pop-Soul, R&B'}</span>
                      </div>

                      <div className="flex items-center gap-[6px]">
                        <Image
                          src="/icons/loc.png"
                          alt="Lokasi"
                          width={14}
                          height={14}
                          unoptimized
                          style={{ objectFit: 'contain' }}
                        />
                        <span className="truncate">
                          {concert.venue?.name || concert.venueName || 'Indonesia Arena, Jakarta'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-[12px]">
                      <div>
                        <span className="block text-[9px] text-[#9ca3af]">Mulai dari</span>
                        <span className="text-[12px] font-bold text-white">
                          Rp{' '}
                          {concert.minPrice != null
                            ? Number(concert.minPrice).toLocaleString('id-ID')
                            : '550.000'}
                        </span>
                      </div>
                      <Link
                        href={`/concerts/${concert.id}`}
                        className="px-[12px] py-[8px] rounded-[10px] text-[11px] font-semibold text-white shadow-md hover:opacity-90 transition-opacity shrink-0"
                        style={{ background: 'linear-gradient(to right, #8138E8, #F73BE1)' }}
                      >
                        Beli Tiket
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-[#080314] border border-white/15 p-12 text-center shadow-lg">
            <p className="text-sm text-white/60">
              {hasActiveFilters
                ? 'Tidak ada konser yang sesuai dengan filter pencarian.'
                : 'Belum ada konser yang dipublikasi.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}