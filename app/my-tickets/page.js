'use client';

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import toast from 'react-hot-toast';
import axios from 'axios';
import Navbar from '../../components/navbar';

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

export default function MyTicketsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketQrs, setTicketQrs] = useState({});
  const [qrModalTicket, setQrModalTicket] = useState(null);
  const [loadingQrId, setLoadingQrId] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
      return;
    }
    if (user) {
      fetchTickets();
    }
  }, [user, loading, router]);

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const response = await api.get('/customer/tickets');
      if (response.data.success) {
        setTickets(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Gagal memuat tiket');
    } finally {
      setLoadingTickets(false);
    }
  };

  const resolveQrCode = async (ticket) => {
    if (ticketQrs[ticket.id]) return ticketQrs[ticket.id];
    if (ticket.qrCode) {
      setTicketQrs((current) => ({ ...current, [ticket.id]: ticket.qrCode }));
      return ticket.qrCode;
    }
    const response = await api.get(`/customer/tickets/${ticket.id}/qr`);
    const qrValue = response.data?.data?.qrCode || response.data?.qrCode;
    if (!qrValue) throw new Error('QR belum tersedia');
    setTicketQrs((current) => ({ ...current, [ticket.id]: qrValue }));
    return qrValue;
  };

  const showTicketQr = async (ticket, event) => {
    event.stopPropagation();
    try {
      setLoadingQrId(ticket.id);
      const qrValue = await resolveQrCode(ticket);
      setQrModalTicket({ ...ticket, resolvedQr: qrValue });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'QR belum tersedia');
    } finally {
      setLoadingQrId(null);
    }
  };

  const downloadTicketQr = async (ticket, event) => {
    event.stopPropagation();
    try {
      const qrCode = await resolveQrCode(ticket);
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `barcode-${ticket.ticketNumber || ticket.id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal mengunduh barcode');
    }
  };

  const downloadTicketPdf = async (ticketId, event) => {
    event.stopPropagation();
    try {
      const response = await api.get(`/customer/tickets/${ticketId}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengunduh tiket');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      active: { color: 'text-[#2CEAA3] bg-[#2CEAA3]/15', label: 'Aktif' },
      used: { color: 'text-gray-400 bg-gray-400/15', label: 'Digunakan' },
      refunded: { color: 'text-blue-400 bg-blue-400/15', label: 'Dikembalikan' },
      cancelled: { color: 'text-red-400 bg-red-400/15', label: 'Dibatalkan' }
    };
    return map[status] || map.active;
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      if (filter !== 'all' && ticket.status !== filter) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const concertName = ticket.concert?.name?.toLowerCase() || '';
        const venueName = (ticket.concert?.venue?.name || ticket.concert?.venueName || '').toLowerCase();
        const ticketNum = (ticket.ticketNumber || String(ticket.id)).toLowerCase();
        if (!concertName.includes(q) && !venueName.includes(q) && !ticketNum.includes(q)) return false;
      }

      if (selectedDate !== '') {
        if (!ticket.concert?.date) return false;
        const ticketDateStr = format(new Date(ticket.concert.date), 'yyyy-MM-dd');
        if (ticketDateStr !== selectedDate) return false;
      }

      return true;
    });
  }, [tickets, filter, searchQuery, selectedDate]);

  if (loading || loadingTickets) {
    return (
      <div className="min-h-screen bg-[#04000E] text-white">
        <Navbar />
        <div className="min-h-[75vh] flex items-center justify-center pt-24">
          <div className="text-center">
            <FaSpinner className="w-12 h-12 text-[#B900A3] animate-spin mx-auto" />
            <p className="mt-4 text-white/60 text-sm">Memuat tiket Anda...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

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
      `}</style>
      
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16">
        {/* Header Section */}
        <div className="flex items-center gap-5 mb-8">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg p-3.5 relative"
            style={{ background: 'linear-gradient(135deg, #5119B0 0%, #220B4A 100%)' }}
          >
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                padding: '1.5px',
                background: 'linear-gradient(135deg, #1E3DFF 0%, #F73BE1 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />
            <Image src="/icons/ticket (4).png" alt="Tiket" width={32} height={32} unoptimized className="object-contain relative z-10" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)' }}>
              Tiket Saya
            </h1>
            <p className="text-xs sm:text-sm text-white/60 mt-1">Semua tiket konser Anda di satu tempat</p>
          </div>
        </div>

        {/* Filters & Search Section */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'all', label: 'Semua Tiket' },
              { id: 'active', label: 'Aktif' },
              { id: 'used', label: 'Digunakan' },
              { id: 'refunded', label: 'Dikembalikan' }
            ].map((item) => {
              const isActive = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : 'bg-[#04000E]/85 border border-white/20 text-white/70 hover:text-white hover:border-white/40'
                  }`}
                  style={isActive ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' } : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 lg:col-span-5 relative">
              <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/30 focus-within:border-[#B900A3] transition-colors shadow-sm">
                <Image src="/icons/loupe.png" alt="Cari" width={16} height={16} unoptimized className="w-4 h-4 object-contain mr-3 opacity-90" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari konser yang kamu mau.."
                  className="w-full bg-transparent text-xs sm:text-sm text-white placeholder-white/70 focus:outline-none"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery('')} className="text-xs text-white/50 hover:text-white ml-2">Reset</button>
                )}
              </div>
            </div>

            <div className="sm:col-span-4 lg:col-span-3 relative">
              <div className="flex items-center w-full h-11 px-4 rounded-xl bg-[#04000E]/85 backdrop-blur-md border border-white/30 focus-within:border-[#B900A3] transition-colors shadow-sm">
                <Image src="/icons/calendar.png" alt="Tanggal" width={16} height={16} unoptimized className="object-contain mr-3 opacity-90 shrink-0" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-transparent text-xs sm:text-sm text-white/90 focus:outline-none [color-scheme:dark]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const statusBadge = getStatusBadge(ticket.status);
              const seatLabel = ticket.seat
                ? `${ticket.seat.row}-${ticket.seat.number}`
                : `${ticket.category || 'Regular'}`;
              const isSelected = selectedTicket?.id === ticket.id;
              const concertDate = ticket.concert?.date ? new Date(ticket.concert.date) : null;
              const orderId = ticket.orderId || ticket.order?.id;
              const orderDetailHref = orderId ? `/orders/${orderId}` : '/orders';

              const concert = ticket.concert || {};
              const organizerName =
                (typeof concert.organizer === 'object' ? concert.organizer?.name : concert.organizer) ||
                concert.organizerName ||
                concert.organizer_name ||
                concert.promoter ||
                concert.promoterName ||
                concert.creator?.name ||
                concert.user?.name ||
                ticket.organizerName ||
                '-';

              const cityLocation =
                concert.venue?.city ||
                concert.city ||
                concert.location ||
                'Indonesia';
              const venueName =
                concert.venue?.name ||
                concert.venueName ||
                concert.venue_name ||
                '-';

              const formattedPrice = Number(ticket.price || 0).toLocaleString('id-ID');
              const activeQr = ticketQrs[ticket.id] || ticket.qrCode;

              return (
                <div
                  key={ticket.id}
                  className="px-5 py-4 rounded-2xl bg-[#060111] border shadow-xl transition-all cursor-pointer"
                  style={{ borderColor: isSelected ? '#B900A3' : 'rgba(185, 0, 163, 0.45)' }}
                  onClick={() => setSelectedTicket(isSelected ? null : ticket)}
                >
                  <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 lg:gap-6">
                    
                    {/* 1. Tanggal & Bulan */}
                    <div className="w-12 text-center shrink-0">
                      <p className="text-base font-bold text-white leading-tight">
                        {concertDate ? format(concertDate, 'dd', { locale: id }) : '-'}
                      </p>
                      <p className="text-[11px] font-bold uppercase text-white/80 tracking-wider mt-0.5">
                        {concertDate ? format(concertDate, 'MMM', { locale: id }) : '-'}
                      </p>
                    </div>

                    {/* 2. QR Code */}
                    <button
                      type="button"
                      onClick={(e) => showTicketQr(ticket, e)}
                      className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 overflow-hidden shadow hover:scale-105 transition-transform"
                      title="Lihat QR Tiket"
                    >
                      {activeQr ? (
                        <Image
                          src={activeQr}
                          alt={`QR ${ticket.ticketNumber}`}
                          width={64}
                          height={64}
                          unoptimized
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <Image src="/icons/qr-code.png" alt="QR" width={36} height={36} unoptimized className="object-contain" />
                      )}
                    </button>

                    {/* 3. Judul Konser & Nama Organizer */}
                    <div className="min-w-[160px] flex-1">
                      <h3 className="text-base font-bold text-white truncate">
                        {concert.name || '-'}
                      </h3>
                      <p className="text-xs text-white/50 truncate mt-1">
                        {organizerName}
                      </p>
                    </div>

                    {/* 4. Lokasi Kota & Nama Venue */}
                    <div className="min-w-[170px] flex-1">
                      <div className="flex items-center gap-2">
                        <Image src="/icons/loc.png" alt="Lokasi" width={14} height={14} unoptimized className="object-contain shrink-0" />
                        <span className="text-xs sm:text-sm text-white/80 truncate">{cityLocation}</span>
                      </div>
                      <p className="text-xs text-white/50 truncate mt-1 pl-[22px]">
                        {venueName}
                      </p>
                    </div>

                    {/* 5. Waktu & Seat/Kategori */}
                    <div className="min-w-[125px] shrink-0">
                      <div className="flex items-center gap-2">
                        <Image src="/icons/clock.png" alt="Waktu" width={14} height={14} unoptimized className="object-contain shrink-0" />
                        <span className="text-xs sm:text-sm text-white/80">{concert.time || '-'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Image src="/icons/ticket (3).png" alt="Seat" width={14} height={14} unoptimized className="object-contain shrink-0" />
                        <span className="text-xs text-white font-medium truncate">{seatLabel}</span>
                      </div>
                    </div>

                    {/* 6. Harga & Status Tiket */}
                    <div className="min-w-[110px] text-center shrink-0">
                      <p className="text-sm font-bold text-white">Rp {formattedPrice}</p>
                      <span className={`inline-block w-full max-w-[90px] py-0.5 rounded-md text-[11px] font-semibold mt-1 text-center ${statusBadge.color}`}>
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* 7. Tombol Aksi */}
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={orderDetailHref}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center"
                        title={`Lihat Pesanan ${concert.name || ''}`.trim()}
                      >
                        <Image src="/icons/view.png" alt="Detail Pesanan" width={20} height={20} unoptimized className="object-contain" />
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => downloadTicketQr(ticket, e)}
                        className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-semibold text-white transition-colors flex items-center gap-1.5"
                      >
                        <Image src="/icons/download.png" alt="PNG" width={13} height={13} unoptimized className="object-contain" />
                        PNG
                      </button>

                      <button
                        type="button"
                        onClick={(e) => downloadTicketPdf(ticket.id, e)}
                        className="px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-lg text-[11px] font-semibold text-white transition-colors flex items-center gap-1.5"
                      >
                        <Image src="/icons/download.png" alt="PDF" width={13} height={13} unoptimized className="object-contain" />
                        PDF
                      </button>

                      <button
                        type="button"
                        onClick={(e) => showTicketQr(ticket, e)}
                        disabled={loadingQrId === ticket.id}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                        title="Tampilkan Barcode"
                      >
                        {loadingQrId === ticket.id ? (
                          <FaSpinner className="w-4 h-4 animate-spin text-white" />
                        ) : (
                          <Image src="/icons/qr-code.png" alt="QR" width={22} height={22} unoptimized className="object-contain" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isSelected && (
                    <div className="mt-5 pt-4 border-t border-white/15 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs sm:text-sm text-white/90">
                      <div>
                        <p className="text-white/50 text-[11px] mb-0.5">Nomor Tiket</p>
                        <p className="font-mono font-medium text-white tracking-wide">{ticket.ticketNumber || ticket.id}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[11px] mb-0.5">Nomor Pesanan</p>
                        <p className="font-mono font-medium text-white tracking-wide">{ticket.order?.orderNumber || ticket.orderId || '-'}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[11px] mb-0.5">Harga</p>
                        <p className="font-bold text-white">Rp {formattedPrice}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[11px] mb-0.5">Kategori Tiket</p>
                        <p className="font-medium text-white">{ticket.seat ? `${seatLabel} (${ticket.category || 'VIP'})` : seatLabel}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[11px] mb-0.5">Jenis Pembayaran</p>
                        <p className="font-medium text-white">{ticket.order?.paymentMethod || '-'}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-[11px] mb-0.5">Dibuat pada</p>
                        <p className="font-medium text-white">{ticket.createdAt ? format(new Date(ticket.createdAt), 'd MMM yyyy HH:mm', { locale: id }) : '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-[#080314] border border-white/15 text-center shadow-lg">
            <Image src="/icons/tickets (4).png" alt="No Tickets" width={64} height={64} unoptimized className="opacity-20 mx-auto mb-4 object-contain" />
            <h3 className="text-lg font-bold mb-1 text-white">Tidak Ada Tiket Ditemukan</h3>
            <p className="text-xs sm:text-sm text-white/60 mb-4">Anda tidak memiliki tiket dalam kategori atau pencarian ini.</p>
            <Link
              href="/dashboard"
              className="inline-block px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-md hover:opacity-95 transition-opacity"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              Cari Konser
            </Link>
          </div>
        )}
      </div>

      {/* Modal QR Tiket */}
      {qrModalTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setQrModalTicket(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">QR Code Tiket</h2>
              <button
                type="button"
                onClick={() => setQrModalTicket(null)}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                aria-label="Tutup"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm font-semibold text-white">{qrModalTicket.concert?.name || 'Konser'}</p>
            <p className="text-xs text-white/60 mt-0.5 mb-4">{qrModalTicket.ticketNumber || qrModalTicket.id}</p>
            {qrModalTicket.resolvedQr && (
              <div className="mx-auto w-52 h-52 rounded-xl bg-white p-3 flex items-center justify-center">
                <Image
                  src={qrModalTicket.resolvedQr}
                  alt={`QR ${qrModalTicket.ticketNumber || qrModalTicket.id}`}
                  width={192}
                  height={192}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div className="mt-5 flex justify-center gap-2.5">
              <button
                type="button"
                onClick={(e) => downloadTicketQr(qrModalTicket, e)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-md hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                Unduh PNG
              </button>
              <button
                type="button"
                onClick={() => setQrModalTicket(null)}
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/10 text-xs font-semibold text-white hover:bg-white/20"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}