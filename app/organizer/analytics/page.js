// src/app/organizer/analytics/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import { 
  FaTicketAlt, 
  FaMoneyBillWave, 
  FaStar,
  FaSpinner,
  FaUsers,
  FaEye,
  FaCalendar,
  FaShoppingCart
} from 'react-icons/fa';
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

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user && user.role === 'organizer') {
      fetchAnalytics();
    }
  }, [user, loading, router, period]);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await api.get('/organizer/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Gagal memuat data analytics');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading || loadingAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-16 h-16 text-[#B900A3] animate-spin mx-auto" />
          <p className="mt-4 text-white/60 text-xs">Memuat data analitik...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') {
    return null;
  }

  const maxSales = analytics?.dailySales?.reduce((max, item) => Math.max(max, item.sales), 1) || 1;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Menggunakan Navbar Atas */}
      <NavbarEO />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        
        {/* Header & Filter Periode */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Analytics</h1>
            <p className="text-xs text-white/60 mt-0.5">Statistik penjualan dan performa konser Anda</p>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-white/15 bg-[#120d1d] px-4 py-2 text-xs text-white w-36 focus:border-[#FA2F84] focus:outline-none shadow-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 shadow-lg hover:border-[#FA2F84]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Tickets Sold</p>
                <p className="text-xl font-extrabold text-white mt-1">{analytics?.totalTicketsSold?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <FaTicketAlt className="text-white text-lg" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 shadow-lg hover:border-[#FA2F84]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Revenue</p>
                <p className="text-lg font-extrabold text-[#F472B6] mt-1">Rp {analytics?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <FaMoneyBillWave className="text-white text-lg" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 shadow-lg hover:border-[#FA2F84]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Avg Rating</p>
                <p className="text-xl font-extrabold text-yellow-400 mt-1">{analytics?.averageRating || 0} ★</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <FaStar className="text-white text-lg" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-5 shadow-lg hover:border-[#FA2F84]/40 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/50">Conversion Rate</p>
                <p className="text-xl font-extrabold text-[#38BDF8] mt-1">{analytics?.conversionRate || 0}%</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0" style={{ background: 'linear-gradient(135deg, #7317AF 0%, #B102A4 100%)' }}>
                <FaShoppingCart className="text-white text-lg" />
              </div>
            </div>
          </div>

        </div>

        {/* Daily Sales Chart */}
        <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 shadow-lg mb-6">
          <h3 className="text-base font-bold mb-4 text-white">Daily Ticket Sales</h3>
          <div className="h-48 flex items-end gap-3">
            {analytics?.dailySales?.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-[#6D19B0] to-[#B900A3] rounded-t-lg transition-all hover:opacity-80"
                  style={{ height: `${(item.sales / maxSales) * 100}%` }}
                />
                <span className="text-[10px] text-white/40">{new Date(item.date).getDate()}</span>
                <span className="text-[10px] text-white/60">{item.sales}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tickets by Category & Top Concerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 shadow-lg">
            <h3 className="text-base font-bold mb-4 text-white">Tickets by Category</h3>
            <div className="space-y-4 text-xs">
              {analytics?.ticketsByCategory?.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-white/60">{item.category}</span>
                    <span className="text-white/80">{item.sold} tickets</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#6D19B0] to-[#B900A3] rounded-full"
                      style={{ width: `${(item.sold / (analytics?.totalTicketsSold || 1)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-[#F472B6] mt-1">Rp {item.revenue?.toLocaleString() || 0}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/15 bg-[#120d1d] p-6 shadow-lg">
            <h3 className="text-base font-bold mb-4 text-white">Top Performing Concerts</h3>
            <div className="space-y-3 text-xs">
              {analytics?.topConcerts?.map((concert, index) => (
                <div key={index} className="flex items-center justify-between p-3.5 rounded-xl border border-white/10 bg-black/40">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="font-bold text-white truncate">{concert.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                      <span>{concert.tickets} tickets</span>
                      <span>•</span>
                      <span className="text-yellow-400">★ {concert.rating}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#F472B6]">Rp {concert.revenue?.toLocaleString() || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Stats Bawah */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-white/15 bg-[#120d1d] p-4 shadow-lg flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#38BDF8]/20 flex items-center justify-center shrink-0">
              <FaEye className="text-[#38BDF8] text-base" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Views</p>
              <p className="text-sm font-bold text-white">{analytics?.views?.toLocaleString() || 0}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-[#120d1d] p-4 shadow-lg flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-[#A78BFA]/20 flex items-center justify-center shrink-0">
              <FaUsers className="text-[#A78BFA] text-base" />
            </div>
            <div>
              <p className="text-xs text-white/50">Total Concerts</p>
              <p className="text-sm font-bold text-white">{analytics?.totalConcerts || 0}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/15 bg-[#120d1d] p-4 shadow-lg flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
              <FaCalendar className="text-green-400 text-base" />
            </div>
            <div>
              <p className="text-xs text-white/50">Upcoming</p>
              <p className="text-sm font-bold text-green-400">{analytics?.upcomingConcerts || 0} concerts</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}