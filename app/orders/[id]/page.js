'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import Navbar from '../../../components/navbar';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaMapMarkerAlt, FaSpinner, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';
import { openMidtransSnap } from '../../../lib/midtrans';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(null);
  const [paymentResult, setPaymentResult] = useState(null);

  const fetchOrder = useCallback(async () => {
    try {
      setLoadingOrder(true);
      const response = await api.get(`/customer/orders/${id}`);
      if (response.data.success) setOrder(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail pesanan');
      if (error.response?.status === 404) router.push('/orders');
    } finally {
      setLoadingOrder(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!user || !id) return undefined;
    const timeout = setTimeout(() => { void fetchOrder(); }, 0);
    return () => clearTimeout(timeout);
  }, [loading, user, id, fetchOrder, router]);

  useEffect(() => {
    if (!order?.expiryDate || order.status !== 'pending') {
      return;
    }
    const updateCountdown = () => setSecondsRemaining(Math.max(0, Math.floor((new Date(order.expiryDate).getTime() - Date.now()) / 1000)));
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [order?.expiryDate, order?.status]);

  useEffect(() => {
    if (order?.status !== 'pending') return undefined;
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/customer/orders/${id}`);
        if (response.data.success) setOrder(response.data.data);
      } catch (error) {
        console.error('Payment status refresh failed:', error);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [order?.status, id]);

  const cancelOrder = async () => {
    if (!confirm('Batalkan pesanan ini?')) return;
    try {
      setCancelling(true);
      await api.put(`/orders/${id}/cancel`);
      toast.success('Pesanan dibatalkan');
      await fetchOrder();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(false);
    }
  };

  const confirmPaymentResult = async () => {
    setPaymentResult('verifying');

    for (let attempt = 0; attempt < 20; attempt += 1) {
      try {
        const response = await api.get(`/customer/orders/${id}`);
        if (response.data.success) {
          const latestOrder = response.data.data;
          setOrder(latestOrder);
          if (latestOrder.status === 'paid' || latestOrder.orderPayment?.status === 'completed') {
            setPaymentResult('success');
            toast.success('Pembayaran berhasil. Tiket dan barcode sudah tersedia.');
            return;
          }
        }
      } catch (error) {
        console.error('Payment confirmation refresh failed:', error);
      }

      if (attempt < 19) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    setPaymentResult('verification-pending');
  };

  const continuePayment = async () => {
    try {
      setProcessingPayment(true);
      const response = await api.post('/payments/create', {
        orderId: order.id,
      });
      const { snapToken, clientKey, isProduction, testMode } = response.data?.data || {};
      if (testMode) {
        toast.success('Pesanan uji coba berhasil. QR tiket sudah dibuat.');
        await fetchOrder();
        return;
      }
      if (!snapToken || !clientKey) throw new Error('Sesi pembayaran tidak tersedia');

      await openMidtransSnap({
        snapToken,
        clientKey,
        isProduction,
        onSuccess: () => { void confirmPaymentResult(); },
        onPending: () => {
          setPaymentResult('pending');
          toast.success('Pembayaran menunggu konfirmasi');
          fetchOrder();
        },
        onError: () => {
          setPaymentResult('failed');
          toast.error('Pembayaran gagal. Silakan periksa status pesanan.');
        },
        onClose: () => toast('Checkout ditutup. Pesanan tetap tersimpan.'),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal membuka pembayaran');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <FaSpinner className="h-9 w-9 animate-spin text-[#B900A3]" />
        </div>
      </div>
    );
  }

  if (!user || !order) return null;

  const concert = order.concert;
  const payment = order.orderPayment;
  const displayedPaymentResult = order.status === 'paid' || payment?.status === 'completed'
    ? 'success'
    : paymentResult;
  const paymentResultMessage = {
    verifying: 'Midtrans mengirim hasil berhasil. Sedang memverifikasi pembayaran dan menyiapkan tiket...',
    success: 'Pembayaran berhasil. Tiket dan barcode sudah tersedia.',
    pending: 'Pembayaran menunggu konfirmasi Midtrans. Status pesanan akan diperbarui otomatis.',
    'verification-pending': 'Pembayaran berhasil di Midtrans, tetapi konfirmasi tiket belum diterima. Status akan diperbarui otomatis.',
    failed: 'Pembayaran gagal. Silakan periksa status pesanan atau coba kembali.'
  }[displayedPaymentResult];

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Tombol Kembali */}
        <div className="mb-4">
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center gap-2.5 text-sm font-medium text-white/90 transition-colors hover:text-white"
          >
            <Image 
              src="/icons/previous.png" 
              alt="Kembali" 
              width={30} 
              height={30} 
              unoptimized 
              className="object-contain" 
            />
            Kembali ke pesanan
          </button>
        </div>

        {/* Header Order ID */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#FA2F84] font-semibold">Detail Pesanan</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">{order.orderNumber}</h1>
            <p className="mt-1 text-xs text-white/50">Dibuat pada {new Date(order.createdAt).toLocaleString('id-ID')}</p>
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-xs font-semibold ${
            order.status === 'paid'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
              : 'border-white/15 bg-black/40 text-white/80'
          }`}>
            {order.status === 'paid' ? 'Berhasil (Paid)' : order.status}
          </span>
        </header>

        {paymentResultMessage && (
          <div className={`mb-6 rounded-xl border p-4 text-xs sm:text-sm ${
            displayedPaymentResult === 'success'
              ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
              : displayedPaymentResult === 'failed'
                ? 'border-red-400/30 bg-red-400/10 text-red-200'
                : 'border-yellow-400/30 bg-yellow-400/10 text-yellow-100'
          }`} role="status" aria-live="polite">
            {paymentResultMessage}
          </div>
        )}

        {/* Layout 2 Kolom Sejajar (items-stretch) */}
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
          
          {/* Kolom Kiri */}
          <section className="space-y-4 flex flex-col justify-between">
            <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg">
              <h2 className="text-lg font-bold text-white">{concert?.name || 'Konser'}</h2>
              <div className="mt-3 grid gap-2.5 text-xs text-white/70 sm:grid-cols-2">
                <p className="flex items-center gap-2"><FaCalendarAlt className="text-[#38BDF8]" />{concert?.date ? new Date(concert.date).toLocaleDateString('id-ID', { dateStyle: 'full' }) : '-'}</p>
                <p className="flex items-center gap-2"><FaMapMarkerAlt className="text-[#FA2F84]" />{concert?.venue?.name || concert?.venueName || '-'}</p>
                <p className="sm:col-span-2 text-white/50">{concert?.venue?.address || concert?.address || ''} {concert?.venue?.city || concert?.city || ''}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg flex-1">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/50">Tiket ({order.orderTickets?.length || 0})</h2>
              <div className="divide-y divide-white/10 space-y-3">
                {(order.orderTickets || []).map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <FaTicketAlt className="text-[#A78BFA] w-4 h-4 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-white">{ticket.seat ? `${ticket.seat.row}-${ticket.seat.number}` : ticket.category}</p>
                        <p className="text-[11px] text-white/50">{ticket.ticketNumber} · <span className="text-emerald-400">{ticket.status}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {ticket.qrCode && ticket.status === 'active' && (
                        <Image src={ticket.qrCode} alt={`QR ${ticket.ticketNumber}`} width={56} height={56} unoptimized className="h-14 w-14 rounded-lg bg-white p-1" />
                      )}
                      <p className="text-sm font-bold text-[#F472B6]">Rp {Number(ticket.price || 0).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                ))}
                {!order.orderTickets?.length && <p className="py-4 text-xs text-white/50">Belum ada tiket pada pesanan ini.</p>}
              </div>
            </div>
          </section>

          {/* Kolom Kanan: Ringkasan Pembayaran & Aksi */}
          <aside className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white/50">Ringkasan Pembayaran</h2>
              <dl className="space-y-2.5 text-xs sm:text-sm text-white/75">
                <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold text-white">Rp {Number(order.subtotal || order.totalAmount).toLocaleString('id-ID')}</dd></div>
                <div className="flex justify-between"><dt>Biaya layanan</dt><dd className="font-semibold text-white">Rp {Number(order.serviceFee || 0).toLocaleString('id-ID')}</dd></div>
                <div className="flex justify-between"><dt>Diskon</dt><dd className="font-semibold text-emerald-400">- Rp {Number(order.discount || 0).toLocaleString('id-ID')}</dd></div>
                <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold text-white"><dt>Total Akhir</dt><dd className="text-[#FA2F84]">Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}</dd></div>
                <div className="flex justify-between pt-2 text-xs text-white/60"><dt>Metode</dt><dd>{payment?.paymentData?.gateway === 'midtrans' ? 'Midtrans' : payment?.paymentData?.gateway === 'disabled' ? 'Mode uji coba' : payment?.method || order.paymentMethod || '-'}</dd></div>
                <div className="flex justify-between text-xs text-white/60"><dt>Status Bayar</dt><dd className={payment?.status === 'completed' ? 'text-emerald-400 font-semibold' : 'text-yellow-400 font-semibold'}>{payment?.status === 'completed' ? 'Berhasil' : payment?.status || 'Menunggu pembayaran'}</dd></div>
              </dl>

              {order.status === 'pending' && secondsRemaining !== null && (
                <p className="mt-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-3 text-xs text-yellow-200">
                  {secondsRemaining > 0
                    ? `Selesaikan pembayaran sebelum ${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}.`
                    : 'Waktu habis. Pesanan sedang dibatalkan otomatis.'}
                </p>
              )}
            </div>

            <div className="space-y-2.5 pt-6">
              {order.status === 'pending' && (!payment || ['pending', 'processing', 'failed'].includes(payment.status)) && (
                <button
                  type="button"
                  onClick={continuePayment}
                  disabled={processingPayment || secondsRemaining === 0}
                  className="w-full rounded-2xl py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {processingPayment ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                  {processingPayment ? 'Membuka pembayaran...' : 'Lanjutkan Pembayaran'}
                </button>
              )}
              {order.status === 'pending' && (
                <button 
                  type="button"
                  onClick={cancelOrder} 
                  disabled={cancelling} 
                  className="w-full rounded-2xl border border-red-400/30 bg-red-500/10 py-3 text-xs font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50 transition"
                >
                  {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}