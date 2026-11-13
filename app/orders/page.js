'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaClock, FaSearch } from 'react-icons/fa';
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

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchOrders = useCallback(async (page = 1) => {
    try {
      setLoadingOrders(true);
      const response = await api.get(`/customer/orders?status=${filter}&page=${page}&limit=10`);
      if (response.data && response.data.success) {
        const orderData = response.data.data || response.data.orders || [];
        setOrders(Array.isArray(orderData) ? orderData : []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, [filter]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (!user) return undefined;
    const timeout = setTimeout(() => { void fetchOrders(); }, 0);
    return () => clearTimeout(timeout);
  }, [user, loading, filter, router, fetchOrders]);

  const getStatusBadge = (status) => {
    const map = {
      paid: { color: 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/30', label: 'Paid' },
      pending: { color: 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/30', label: 'Pending' },
      cancelled: { color: 'text-red-400 bg-red-400/10 border border-red-400/30', label: 'Cancelled' },
      refunded: { color: 'text-blue-400 bg-blue-400/10 border border-blue-400/30', label: 'Refunded' },
      expired: { color: 'text-gray-400 bg-gray-400/10 border border-gray-400/30', label: 'Expired' }
    };
    return map[status] || map.pending;
  };

  const filteredOrders = orders.filter((order) => {
    if (!order) return false;
    const matchesStatus = filter === 'all' || order.status === filter;
    const query = searchTerm.trim().toLowerCase();
    const matchesQuery = !query || order.orderNumber?.toLowerCase().includes(query) || order.concert?.name?.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <FaSpinner className="w-10 h-10 animate-spin text-[#B900A3]" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Tombol Kembali menggunakan previous.png */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
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
            Kembali
          </button>
        </div>

        {/* Header Title */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-[#FA2F84] font-semibold">Riwayat</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">Daftar Pesanan Tiket</h1>
          <p className="mt-1 text-sm text-white/60">Kelola dan lihat riwayat pesanan tiket konser Anda di sini</p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'paid', 'pending', 'cancelled', 'refunded', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize ${
                  filter === status
                    ? 'text-white shadow-md'
                    : 'border border-white/15 bg-[#120d1d] text-white/60 hover:text-white hover:border-[#FA2F84]/40'
                }`}
                style={filter === status ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' } : {}}
              >
                {status === 'all' ? 'Semua Pesanan' : status}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari pesanan atau konser..."
              className="w-full px-4 py-2.5 pl-10 rounded-xl border border-white/15 bg-[#120d1d] text-xs text-white placeholder-white/40 focus:border-[#FA2F84] focus:outline-none transition-all shadow-md"
            />
          </div>
        </div>

        {/* Orders List / Loading State */}
        {loadingOrders ? (
          <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-12 text-center shadow-lg">
            <FaSpinner className="w-8 h-8 animate-spin mx-auto text-[#FA2F84] mb-3" />
            <p className="text-xs text-white/60">Memuat data pesanan...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              return (
                <div key={order.id} className="relative rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-5 shadow-lg transition-all hover:border-[#FA2F84]">
                  
                  {/* Bagian Kanan Atas: Badge Status */}
                  <div className="absolute top-5 right-5 flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
                      {statusBadge.label}
                    </span>
                  </div>

                  {/* Informasi Utama Konser */}
                  <div className="pr-24">
                    <h3 className="text-lg font-bold text-white tracking-tight">{order.concert?.name || 'Konser'}</h3>
                    <p className="mt-0.5 text-xs text-white/50">Order #{order.orderNumber || order.id}</p>
                  </div>

                  {/* Baris Tengah: Tanggal, Jumlah Tiket, dan Total Harga */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-white/10">
                    <div className="flex flex-wrap items-center gap-6 text-xs text-white/80">
                      
                      {/* Tanggal menggunakan calendar.png */}
                      <div className="flex items-center gap-2">
                        <Image src="/icons/calendar.png" alt="Calendar" width={14} height={14} unoptimized className="object-contain shrink-0" />
                        <span>{order.concert?.date ? format(new Date(order.concert.date), 'd MMM yyyy', { locale: id }) : '-'}</span>
                      </div>

                      {/* Jumlah tiket menggunakan ticket (3).png */}
                      <div className="flex items-center gap-2">
                        <Image src="/icons/ticket.png" alt="Ticket" width={14} height={14} unoptimized className="object-contain shrink-0" />
                        <span>{order.orderTickets?.length || 0} tiket</span>
                      </div>
                    </div>

                    {/* Total Harga Warna Pink */}
                    <div className="text-sm font-extrabold text-[#F472B6]">
                      Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}
                    </div>
                  </div>

                  {/* Baris Bawah: Metode Pembayaran, Waktu, dan Tombol Detail/Invoice */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2 text-[11px] text-white/45">
                    <div className="flex items-center gap-2">
                      <span>Metode: {order.paymentMethod || 'midtrans'}</span>
                      <span>•</span>
                      <span>{order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy HH:mm', { locale: id }) : '-'}</span>
                    </div>

                    {/* Tombol Aksi Kanan Bawah: Detail & Download Invoice */}
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/15 bg-black/40 text-xs font-semibold text-white hover:bg-white/10 transition-colors shadow-sm"
                      >
                        <Image src="/icons/view.png" alt="View" width={13} height={13} unoptimized className="object-contain" />
                        Detail
                      </Link>

                      {order.status === 'paid' && (
                        <button 
                          type="button"
                          onClick={() => toast.success('Mengunduh invoice...')}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/15 bg-black/40 text-xs font-semibold text-white hover:bg-white/10 transition-colors shadow-sm"
                        >
                          <Image src="/icons/download.png" alt="Download" width={13} height={13} unoptimized className="object-contain" />
                          Invoice
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-12 text-center shadow-lg">
            <Image src="/icons/ticket (3).png" alt="Ticket" width={48} height={48} unoptimized className="mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-bold mb-1 text-white">Belum Ada Pesanan</h3>
            <p className="text-xs text-white/60 mb-5">Anda belum melakukan pemesanan tiket konser apapun.</p>
            <Link href="/concerts" className="inline-block rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-md transition hover:opacity-90" style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}>
              Jelajahi Konser
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setPagination({ ...pagination, page });
                  fetchOrders(page);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  page === pagination.page
                    ? 'text-white shadow-md'
                    : 'border border-white/15 bg-[#120d1d] text-white/60 hover:text-white'
                }`}
                style={page === pagination.page ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' } : {}}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}