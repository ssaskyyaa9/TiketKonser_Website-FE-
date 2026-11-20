'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import NavbarEO from '../../../components/navbarEO';
import { FaArrowRight, FaCalendar, FaFileInvoiceDollar, FaMapMarkerAlt, FaSearch, FaSpinner, FaTicketAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getConcertPoster, getMediaUrl } from '../../../lib/media-url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return undefined;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return undefined;
    }
    if (!user) return undefined;

    let cancelled = false;
    const loadOrders = async () => {
      try {
        const [ordersResult, concertsResult, galleryResult] = await Promise.allSettled([
          api.get('/organizer/orders'),
          api.get('/organizer/concerts'),
          api.get('/organizer/gallery'),
        ]);
        if (ordersResult.status === 'rejected') throw ordersResult.reason;
        const response = ordersResult.value;
        if (!response.data?.success) throw new Error(response.data?.message || 'Gagal memuat daftar pesanan');
        if (!cancelled) {
          setOrders(Array.isArray(response.data.data) ? response.data.data : []);

          if (concertsResult.status === 'fulfilled' && concertsResult.value.data?.success) {
            setConcerts(Array.isArray(concertsResult.value.data.data) ? concertsResult.value.data.data : []);
          } else {
            const error = concertsResult.status === 'rejected'
              ? concertsResult.reason
              : new Error(concertsResult.value.data?.message || 'Respons daftar konser tidak valid');
            console.error('Error fetching organizer concerts:', error);
            toast.error('Data konser tidak dapat dimuat');
          }

          if (galleryResult.status === 'fulfilled' && galleryResult.value.data?.success) {
            setGalleryImages(Array.isArray(galleryResult.value.data.data) ? galleryResult.value.data.data : []);
          } else {
            const error = galleryResult.status === 'rejected'
              ? galleryResult.reason
              : new Error(galleryResult.value.data?.message || 'Respons galeri konser tidak valid');
            console.error('Error fetching organizer gallery:', error);
            toast.error('Gambar konser tidak dapat dimuat');
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching orders:', error);
          toast.error(error.response?.data?.message || error.message || 'Gagal memuat daftar pesanan');
        }
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  const concertGroups = useMemo(() => {
    const groups = new Map();
    const concertsById = new Map(concerts.map((concert) => [String(concert.id), concert]));
    const galleriesByConcertId = new Map();
    galleryImages.forEach((image) => {
      const concertId = image.concertId ?? image.concert?.id;
      if (concertId == null || !image.image) return;
      const key = String(concertId);
      galleriesByConcertId.set(key, [...(galleriesByConcertId.get(key) || []), image]);
    });

    orders.forEach((order) => {
      const orderConcert = order.concert || {};
      const id = orderConcert.id ?? order.concertId ?? orderConcert.slug ?? orderConcert.name ?? 'unknown';
      const key = String(id);
      if (!groups.has(key)) {
        const concert = { ...orderConcert, ...concertsById.get(key) };
        const embeddedGalleries = Array.isArray(concert.concertGalleries) ? concert.concertGalleries : [];
        const relatedGalleries = galleriesByConcertId.get(key) || [];
        const uniqueGalleries = [...new Map(
          [...embeddedGalleries, ...relatedGalleries].map((image) => [String(image.id ?? image.image), image])
        ).values()];
        groups.set(key, {
          id: key,
          concert: { ...concert, concertGalleries: uniqueGalleries },
          orders: [],
        });
      }
      groups.get(key).orders.push(order);
    });

    return [...groups.values()]
      .filter((group) => group.concert.name?.toLowerCase().includes(searchTerm.trim().toLowerCase())
        || String(group.concert.venue?.name || group.concert.venueName || '').toLowerCase().includes(searchTerm.trim().toLowerCase()))
      .sort((a, b) => String(a.concert.name || '').localeCompare(String(b.concert.name || ''), 'id'));
  }, [orders, concerts, galleryImages, searchTerm]);

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <NavbarEO />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Sales & Transactions</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Daftar Pemesanan</h1>
            <p className="text-xs text-white/60 mt-1">Pilih konser untuk melihat daftar pemesanan tiketnya.</p>
          </div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
            <FaFileInvoiceDollar className="text-white text-xl" />
          </div>
        </div>

        <div className="relative w-full sm:max-w-sm mb-6">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 w-3.5 h-3.5" />
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Cari nama konser atau venue..."
            className="w-full pl-11 pr-4 py-3 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none"
          />
        </div>

        {concertGroups.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {concertGroups.map((group) => {
              const poster = getConcertPoster(group.concert.concertGalleries)
                || getMediaUrl(group.concert.thumbnail || group.concert.banner || group.concert.poster);
              const concertDate = group.concert.date ? new Date(group.concert.date) : null;
              const validDate = concertDate && !Number.isNaN(concertDate.getTime());
              const ticketCount = group.orders.reduce((total, order) => total + (order.orderTickets?.length || 0), 0);
              const revenue = group.orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0);

              return (
                <Link
                  key={group.id}
                  href={`/organizer/orders/${encodeURIComponent(group.id)}`}
                  className="group overflow-hidden rounded-2xl border border-white/15 bg-[#120d1d] shadow-xl transition hover:-translate-y-1 hover:border-[#8B5CF6]/70"
                >
                  <div className="relative h-48 bg-gradient-to-br from-[#6D19B0]/40 to-[#B900A3]/30">
                    {poster ? (
                      <Image src={poster} alt={`Poster ${group.concert.name || 'konser'}`} fill unoptimized className="object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl opacity-40">♫</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
                      {group.orders.length} Pesanan
                    </span>
                  </div>

                  <div className="p-5">
                    <h2 className="truncate text-lg font-bold text-white group-hover:text-[#D8B4FE]">{group.concert.name || 'Konser'}</h2>
                    <div className="mt-3 space-y-2 text-xs text-white/60">
                      <p className="flex items-center gap-2">
                        <FaCalendar className="shrink-0 text-[#D8B4FE]" />
                        {validDate ? format(concertDate, 'd MMM yyyy', { locale: id }) : 'Tanggal belum tersedia'}
                      </p>
                      <p className="flex items-center gap-2">
                        <FaMapMarkerAlt className="shrink-0 text-[#D8B4FE]" />
                        <span className="truncate">{group.concert.venue?.name || group.concert.venueName || 'Lokasi belum diatur'}</span>
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                      <span className="flex items-center gap-2 text-white/60">
                        <FaTicketAlt className="text-[#D8B4FE]" />
                        {ticketCount} tiket
                      </span>
                      <span className="font-bold text-white">Rp {revenue.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-2 text-xs font-semibold text-[#D8B4FE]">
                      Lihat Daftar Pemesan <FaArrowRight />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] px-6 py-14 text-center shadow-xl">
            <FaTicketAlt className="mx-auto mb-4 h-10 w-10 text-[#A78BFA]" />
            <h2 className="text-lg font-bold text-white">
              {orders.length ? 'Konser tidak ditemukan' : 'Belum ada pemesanan'}
            </h2>
            <p className="mt-2 text-xs text-white/60">
              {orders.length ? 'Coba kata kunci lain.' : 'Pesanan tiket akan tampil di sini setelah ada transaksi.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
