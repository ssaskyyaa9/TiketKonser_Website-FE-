// src/app/organizer/orders/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarEO from '../../../../components/navbarEO';
import { 
  FaTicketAlt, 
  FaCalendar, 
  FaEye, 
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaSearch,
  FaFileInvoiceDollar,
  FaTimes
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

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { concertId } = useParams();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

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
        const response = await api.get('/organizer/orders');
        if (!cancelled && response.data.success) {
          const allOrders = Array.isArray(response.data.data) ? response.data.data : [];
          setOrders(allOrders.filter((order) => {
            const orderConcertId = order.concert?.id ?? order.concertId ?? order.concert?.slug ?? order.concert?.name;
            return String(orderConcertId) === String(concertId);
          }));
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error fetching orders:', error);
          toast.error('Gagal memuat riwayat pesanan');
        }
      } finally {
        if (!cancelled) setLoadingOrders(false);
      }
    };
    loadOrders();
    return () => {
      cancelled = true;
    };
  }, [user, loading, router, concertId]);

  const getStatusBadge = (status) => {
    const map = {
      paid: { color: 'text-green-300 bg-green-500/20 border-green-500/30', icon: FaCheckCircle, label: 'Paid' },
      pending: { color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30', icon: FaClock, label: 'Pending' },
      cancelled: { color: 'text-red-300 bg-red-500/20 border-red-500/30', icon: FaTimesCircle, label: 'Cancelled' },
      expired: { color: 'text-red-300 bg-red-500/20 border-red-500/30', icon: FaTimesCircle, label: 'Expired' },
      refunded: { color: 'text-blue-300 bg-blue-500/20 border-blue-500/30', icon: FaCheckCircle, label: 'Refunded' }
    };
    return map[status] || { color: 'text-white/50 bg-white/10 border-white/20', icon: FaClock, label: status || 'Unknown' };
  };

  // Filter berdasarkan status & pencarian teks (nomor order atau nama konser/customer)
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filter === 'all' || order.status === filter;
    
    const orderNum = String(order.orderNumber || order.id || '').toLowerCase();
    const customerName = String(order.user?.name || order.customerName || '').toLowerCase();
    
    const matchesSearch = orderNum.includes(searchTerm.toLowerCase()) || 
                          customerName.includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const openOrderDetail = async (orderId) => {
    try {
      setSelectedOrder(null);
      setLoadingDetail(true);
      const response = await api.get(`/organizer/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat detail pesanan');
    } finally {
      setLoadingDetail(false);
    }
  };

  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat pesanan...</p>
        </div>
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

      {/* Navbar EO */}
      <NavbarEO />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Sales & Transactions</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">{orders[0]?.concert?.name || 'Daftar Pemesanan'}</h1>
            <p className="text-xs text-white/60 mt-1">Kelola pesanan tiket untuk konser ini.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/organizer/orders" className="rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs font-semibold text-white/80 hover:text-white hover:border-[#8B5CF6] transition-colors">
              Kembali ke Konser
            </Link>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
              <FaFileInvoiceDollar className="text-white text-xl" />
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {['all', 'paid', 'pending', 'cancelled', 'expired', 'refunded'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all capitalize cursor-pointer ${
                  filter === status
                    ? 'text-white shadow-lg'
                    : 'bg-[#120d1d] border border-white/15 text-white/60 hover:text-white'
                }`}
                style={filter === status ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' } : {}}
              >
                {status === 'all' ? 'All Orders' : status}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nomor pesanan / pemesan..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner"
            />
          </div>

        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const StatusIcon = statusBadge.icon;
              return (
                <div key={order.id} className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 rounded-2xl p-5 sm:p-6 transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-[#D8B4FE] font-mono">Order #{order.orderNumber || order.id}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-xs text-white/70">
                      <div className="flex items-center gap-2">
                        <FaCalendar className="text-white w-3.5 h-3.5 shrink-0" />
                        <span>{order.createdAt ? format(new Date(order.createdAt), 'd MMM yyyy HH:mm', { locale: id }) : '-'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaTicketAlt className="text-white w-3.5 h-3.5 shrink-0" />
                        <span>{order.orderTickets?.length || 0} Tiket</span>
                      </div>
                      <span className="font-extrabold text-white text-sm">Rp {Number(order.totalAmount || 0).toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-white/10 text-[11px] text-white/50">
                      <span>Pemesan: <strong className="text-white">{order.user?.name || order.customerName || '-'}</strong></span>
                      <span>•</span>
                      <span>Gateway: <strong className="text-white">{order.paymentMethod || '-'}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full md:w-auto justify-between md:justify-end">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wider ${statusBadge.color}`}>
                      <StatusIcon className="w-3 h-3 text-white" />
                      <span>{statusBadge.label}</span>
                    </span>
                    <button
                      onClick={() => openOrderDetail(order.id)}
                      className="py-2.5 px-4 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <FaEye className="w-3.5 h-3.5 text-white" />
                      <span>Detail Pesanan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#120d1d] border border-white/15 p-14 rounded-2xl text-center shadow-xl">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/10"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaTicketAlt className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Orders Found</h3>
            <p className="text-xs text-white/60 mb-6 max-w-md mx-auto">
              Belum ada pesanan tiket yang ditemukan untuk filter atau pencarian saat ini.
            </p>
            <Link 
              href="/organizer/concerts" 
              className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-95 inline-flex items-center gap-2"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              Kelola Konser Saya
            </Link>
          </div>
        )}

      </main>

      {/* Modal Order Detail */}
      {(loadingDetail || selectedOrder) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4" onClick={() => !loadingDetail && setSelectedOrder(null)}>
          <div className="bg-[#120d1d] border border-white/20 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 sm:p-8 shadow-2xl text-xs" onClick={(event) => event.stopPropagation()}>
            
            {loadingDetail ? (
              <div className="flex justify-center py-16">
                <FaSpinner className="h-8 w-8 animate-spin text-[#8B5CF6]" />
              </div>
            ) : selectedOrder ? (
              <>
                <div className="mb-6 flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h2 className="text-base font-extrabold text-white">{selectedOrder.concert?.name || 'Detail Pesanan'}</h2>
                    <p className="mt-1 text-xs text-[#D8B4FE] font-mono">Order #{selectedOrder.orderNumber}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)} 
                    className="w-7 h-7 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                    <FaTimes className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>

                <div className="grid gap-3 rounded-xl bg-black/40 border border-white/10 p-4 text-xs sm:grid-cols-2 mb-6">
                  <p className="text-white/70">Customer: <strong className="text-white">{selectedOrder.user?.name || selectedOrder.customerName || '-'}</strong></p>
                  <p className="text-white/70">Email: <strong className="text-white">{selectedOrder.user?.email || selectedOrder.customerEmail || '-'}</strong></p>
                  <p className="text-white/70">Order Status: <strong className="text-white capitalize">{selectedOrder.status}</strong></p>
                  <p className="text-white/70">Payment Status: <strong className="text-white capitalize">{selectedOrder.orderPayment?.status || 'not created'}</strong></p>
                  <p className="text-white/70">Gateway: <strong className="text-white">{selectedOrder.paymentMethod || '-'}</strong></p>
                  <p className="text-white/70">Total Amount: <strong className="text-[#D8B4FE] font-bold text-sm">Rp {Number(selectedOrder.totalAmount || 0).toLocaleString('id-ID')}</strong></p>
                </div>

                <h3 className="mb-3 font-bold uppercase tracking-wider text-[#A78BFA] text-[11px]">Tiket dalam Pesanan</h3>
                <div className="space-y-2">
                  {(selectedOrder.orderTickets || []).map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between rounded-xl bg-black/40 border border-white/10 p-3.5 text-xs text-white">
                      <div>
                        <p className="font-bold text-[#D8B4FE]">{ticket.category || 'Ticket'}</p>
                        <p className="font-mono text-[11px] text-white/60 mt-0.5">{ticket.ticketNumber}</p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/80 border border-white/15">
                        {ticket.status}
                      </span>
                    </div>
                  ))}
                  {!selectedOrder.orderTickets?.length && (
                    <p className="text-xs text-white/50 text-center py-4 bg-black/40 rounded-xl border border-white/10">Tidak ada tiket pada pesanan ini.</p>
                  )}
                </div>
              </>
            ) : null}

          </div>
        </div>
      )}
    </div>
  );
}