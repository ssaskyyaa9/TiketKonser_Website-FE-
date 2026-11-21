'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSpinner, FaTicketAlt, FaCheckCircle } from 'react-icons/fa';
import Navbar from '../../components/navbar';
import { openMidtransSnap } from '../../lib/midtrans';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function CheckoutContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const concertId = searchParams.get('concert');
  const categoryParam = searchParams.get('categories');

  const [concert, setConcert] = useState(null);
  const [selectedTicketCategories, setSelectedTicketCategories] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '', nik: '' });
  const [loadingData, setLoadingData] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  const requestedCategories = useMemo(() => {
    return String(categoryParam || '')
      .split(',')
      .map((value) => {
        const [id, quantity] = value.split(':').map(Number);
        return { id, quantity };
      })
      .filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantity) && item.quantity > 0);
  }, [categoryParam]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      toast.error('Silakan login terlebih dahulu');
      const checkoutPath = `${window.location.pathname}${window.location.search}`;
      router.push(`/login?redirect=${encodeURIComponent(checkoutPath)}`);
      return;
    }
    if (!concertId) return;

    let cancelled = false;
    const fetchCheckoutData = async () => {
      try {
        const [concertResponse, seatsResponse] = await Promise.all([
          api.get(`/concerts/${concertId}`),
          api.get(`/concerts/${concertId}/seats`),
        ]);
        if (cancelled) return;

        if (concertResponse.data?.success) {
          setConcert(concertResponse.data.data);
        }
        setCustomerInfo({ name: user.name || '', email: user.email || '', phone: user.phone || '', nik: '' });

        if (seatsResponse.data?.success) {
          const seatData = seatsResponse.data.data || {};
          const categories = seatData.ticketCategories || [];
          const categoriesById = new Map(categories.map((ticketCategory) => [Number(ticketCategory.id), ticketCategory]));
          const chosenCategories = requestedCategories.map((request) => {
            const ticketCategory = categoriesById.get(request.id);
            if (!ticketCategory || request.quantity > Number(ticketCategory.available || 0)) return null;
            return {
              id: Number(ticketCategory.id),
              category: ticketCategory.category,
              price: Number(ticketCategory.price || 0),
              quantity: request.quantity,
            };
          });

          if (!requestedCategories.length || chosenCategories.some((ticketCategory) => !ticketCategory)) {
            toast.error('Kategori atau jumlah tiket sudah tidak tersedia');
            router.push(`/concerts/${concertId}`);
            return;
          }

          if (chosenCategories.reduce((sum, ticketCategory) => sum + ticketCategory.quantity, 0) > 10) {
            toast.error('Maksimal 10 tiket per pesanan');
            router.push(`/concerts/${concertId}`);
            return;
          }

          setSelectedTicketCategories(chosenCategories);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('Checkout data error:', error);
        toast.error(error.response?.data?.message || 'Gagal memuat data checkout');
        router.push(`/concerts/${concertId}`);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    fetchCheckoutData();
    return () => {
      cancelled = true;
    };
  }, [concertId, loading, requestedCategories, router, user]);

  const subtotal = selectedTicketCategories.reduce((sum, ticketCategory) => sum + ticketCategory.price * ticketCategory.quantity, 0);
  const serviceFee = subtotal * 0.05;
  const discount = appliedPromo?.discount || 0;
  const total = Math.max(0, subtotal + serviceFee - discount);
  const saleStartTime = concert?.startSale ? new Date(concert.startSale).getTime() : null;
  const saleEndTime = concert?.endSale ? new Date(concert.endSale).getTime() : null;
  const saleNotStarted = saleStartTime !== null && saleStartTime > currentTime;
  const saleEnded = saleEndTime !== null && saleEndTime <= currentTime;
  const formatSaleDate = (value) => new Date(value).toLocaleString('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta'
  });

  const applyPromo = async () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.error('Masukkan kode promo terlebih dahulu');
      return;
    }
    if (!concertId || subtotal <= 0) {
      toast.error('Pilih tiket sebelum menggunakan promo');
      return;
    }

    try {
      setValidatingPromo(true);
      const response = await api.get('/promos/validate', {
        params: { code, subtotal, concertId },
      });
      if (!response.data?.success || !response.data.data?.valid) {
        throw new Error(response.data?.message || 'Kode promo tidak valid');
      }
      setAppliedPromo(response.data.data);
      setPromoCode(response.data.data.code);
      toast.success('Promo berhasil digunakan');
    } catch (error) {
      setAppliedPromo(null);
      toast.error(error.response?.data?.message || error.message || 'Kode promo tidak dapat digunakan');
    } finally {
      setValidatingPromo(false);
    }
  };

  const handleCheckout = async () => {
    if (!user || !concertId) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/login');
      return;
    }

    if (selectedTicketCategories.length === 0) {
      toast.error('Pilih kategori tiket terlebih dahulu');
      router.push(`/concerts/${concertId}`);
      return;
    }
    if (saleNotStarted || saleEnded) {
      toast.error(saleNotStarted
        ? `Penjualan tiket dibuka ${formatSaleDate(concert.startSale)} WIB`
        : 'Periode penjualan tiket konser ini sudah berakhir');
      return;
    }

    let createdOrderId;
    try {
      setPlacingOrder(true);

      const orderResponse = await api.post('/orders', {
        concertId: Number(concertId),
        categories: selectedTicketCategories.map((ticketCategory) => ({
          ticketCategoryId: ticketCategory.id,
          quantity: ticketCategory.quantity,
        })),
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        customerNIK: customerInfo.nik,
        ...(appliedPromo ? { promotionCode: appliedPromo.code } : {}),
      });

      if (!orderResponse.data?.success) {
        throw new Error(orderResponse.data?.message || 'Gagal membuat pesanan');
      }

      const orderId = orderResponse.data.data?.id;
      if (!orderId) {
        throw new Error('Order berhasil dibuat tetapi ID tidak tersedia');
      }
      createdOrderId = orderId;

      const paymentResponse = await api.post('/payments/create', {
        orderId,
      });

      if (!paymentResponse.data?.success) {
        throw new Error(paymentResponse.data?.message || 'Gagal membuat pembayaran');
      }

      const { snapToken, clientKey, isProduction, testMode } = paymentResponse.data.data || {};
      if (testMode) {
        toast.success('Pesanan uji coba berhasil. QR tiket sudah dibuat.');
        router.push(`/orders/${orderId}`);
        return;
      }
      if (!snapToken || !clientKey) {
        throw new Error('Token pembayaran dari gateway tidak tersedia');
      }

      await openMidtransSnap({
        snapToken,
        clientKey,
        isProduction,
        onSuccess: () => {
          toast.success('Pembayaran berhasil diproses');
          router.push(`/orders/${orderId}`);
        },
        onPending: () => {
          toast.success('Pembayaran menunggu konfirmasi');
          router.push(`/orders/${orderId}`);
        },
        onError: () => {
          toast.error('Pembayaran gagal. Periksa status pesanan untuk mencoba lagi.');
          router.push(`/orders/${orderId}`);
        },
        onClose: () => {
          toast('Checkout ditutup. Pesanan tetap tersimpan.');
          router.push(`/orders/${orderId}`);
        },
      });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || error.message || 'Checkout gagal');
      if (createdOrderId) router.push(`/orders/${createdOrderId}`);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <div className="text-center">
          <FaSpinner className="w-10 h-10 mx-auto animate-spin text-[#B900A3]" />
          <p className="mt-4 text-white/60">Memuat checkout...</p>
        </div>
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <div className="text-center">
          <p className="text-lg font-semibold">Data konser tidak ditemukan</p>
          <button onClick={() => router.push('/')} className="mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-white" style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}>Kembali ke beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Tombol Kembali menggunakan /icons/prevoius.png */}
        <div className="mb-4">
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.state?.idx > 0) {
                router.back();
              } else {
                router.push(concertId ? `/concerts/${concertId}` : '/concerts');
              }
            }}
            className="inline-flex items-center gap-2.5 text-lg font-extrabold text-white/90 transition-colors hover:text-white"
          >
            <Image 
              src="/icons/previous.png" 
              alt="Kembali" 
              width={30} 
              height={30} 
              unoptimized 
              className="object-contain" 
            />
            PEMBAYARAN TIKET
          </button>
        </div>

        {/* Layout 2 Kolom dengan items-stretch agar tinggi kiri dan kanan persis sama */}
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr] items-stretch">
          
          {/* Kolom Kiri: Form Informasi Pembeli & Tiket */}
          <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 shadow-lg flex flex-col justify-between">
            <div>
              <div className="mb-6 flex items-center gap-3.5">
                <div className="rounded-xl bg-[#6D19B0]/20 border border-[#FA2F84]/30 p-3 text-white">
                  <FaTicketAlt className="w-5 h-5 text-[#FA2F84]" />
                </div>
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Konser Dipilih</p>
                  <h2 className="text-xl font-bold text-white">{concert.name}</h2>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-white/70">Nama Lengkap
                    <input required className="w-full mt-1.5 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#FA2F84] focus:outline-none" value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} />
                  </label>
                  <label className="text-xs font-semibold text-white/70">Email Aktif
                    <input required type="email" className="w-full mt-1.5 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#FA2F84] focus:outline-none" value={customerInfo.email} onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })} />
                  </label>
                  <label className="text-xs font-semibold text-white/70">Nomor Telepon
                    <input required type="tel" className="w-full mt-1.5 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#FA2F84] focus:outline-none" value={customerInfo.phone} onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })} />
                  </label>
                  <label className="text-xs font-semibold text-white/70">NIK (Nomor Induk Kependudukan)
                    <input required inputMode="numeric" pattern="[0-9]{16}" maxLength={16} className="w-full mt-1.5 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white focus:border-[#FA2F84] focus:outline-none" value={customerInfo.nik} onChange={(e) => setCustomerInfo({ ...customerInfo, nik: e.target.value.replace(/\D/g, '').slice(0, 16) })} />
                  </label>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4 mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-white/50">Rincian Tiket Pesanan</p>
              <div className="space-y-2.5">
                {selectedTicketCategories.map((ticketCategory) => (
                  <div key={ticketCategory.id} className="flex justify-between gap-4 text-sm">
                    <span className="text-white/90 font-medium">{ticketCategory.category} <span className="text-white/45">× {ticketCategory.quantity}</span></span>
                    <span className="text-white font-bold">Rp {(ticketCategory.price * ticketCategory.quantity).toLocaleString('id-ID')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Ringkasan Pembayaran & Tombol Aksi */}
          <aside className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/50">Total Pembayaran</p>
                <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #38BDF8 0%, #F472B6 100%)' }}>
                  Rp {total.toLocaleString('id-ID')}
                </h3>
              </div>

              {(saleNotStarted || saleEnded) && (
                <div role="status" className="rounded-xl border border-yellow-400/20 bg-yellow-400/10 p-4 text-xs text-yellow-100">
                  {saleNotStarted
                    ? `Penjualan tiket dibuka ${formatSaleDate(concert.startSale)} WIB.`
                    : 'Periode penjualan tiket konser ini sudah berakhir.'}
                </div>
              )}

              {/* Input Promo */}
              <div className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-2">
                <label htmlFor="promo-code" className="block text-xs font-semibold text-white/70">Punya kode promo?</label>
                <div className="flex gap-2">
                  <input
                    id="promo-code"
                    value={promoCode}
                    onChange={(event) => {
                      setPromoCode(event.target.value);
                      setAppliedPromo(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        void applyPromo();
                      }
                    }}
                    placeholder="Masukkan kode promo"
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-sm text-white placeholder-white/30 focus:border-[#FA2F84] focus:outline-none"
                    disabled={validatingPromo || placingOrder}
                  />
                  <button
                    type="button"
                    onClick={() => void applyPromo()}
                    disabled={validatingPromo || placingOrder || !promoCode.trim()}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white transition hover:opacity-90 disabled:opacity-50 shrink-0"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    {validatingPromo ? <FaSpinner className="animate-spin" /> : appliedPromo ? 'Ganti' : 'Pakai'}
                  </button>
                </div>
                {appliedPromo && <p className="text-xs text-emerald-400 font-medium">Promo {appliedPromo.code} berhasil diterapkan.</p>}
              </div>

              <div className="space-y-2.5 text-xs sm:text-sm text-white/75 border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Biaya layanan (5%)</span>
                  <span className="font-semibold text-white">Rp {serviceFee.toLocaleString('id-ID')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Diskon promo</span>
                    <span>- Rp {discount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/10">
                  <span>Total Akhir</span>
                  <span className="text-[#FA2F84]">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleCheckout}
                disabled={placingOrder || saleNotStarted || saleEnded}
                className="w-full rounded-2xl py-3.5 text-sm sm:text-base font-bold text-white shadow-lg transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                }}
              >
                {placingOrder ? (
                  <span className="flex items-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Memproses Pesanan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <FaCheckCircle />
                    {saleNotStarted ? 'Penjualan belum dimulai' : saleEnded ? 'Penjualan berakhir' : 'Buat Pesanan & Bayar'}
                  </span>
                )}
              </button>
            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={(
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <FaSpinner className="w-10 h-10 animate-spin text-[#B900A3]" />
      </div>
    )}>
      <CheckoutContent />
    </Suspense>
  );
}