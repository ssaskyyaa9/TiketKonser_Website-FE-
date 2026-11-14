// src/app/organizer/revenue/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarEO from '../../../components/navbarEO';
import { 
  FaSpinner,
  FaDownload,
  FaArrowDown,
  FaArrowUp,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt,
  FaMusic,
  FaWallet
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

export default function RevenuePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState(null);
  const [loadingRevenue, setLoadingRevenue] = useState(true);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'organizer') {
      fetchRevenue();
    }
  }, [user, loading, router, period]);

  const fetchRevenue = async () => {
    try {
      setLoadingRevenue(true);
      const response = await api.get('/organizer/revenue');
      if (response.data.success) {
        setRevenueData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching revenue:', error);
      toast.error('Gagal memuat data revenue');
    } finally {
      setLoadingRevenue(false);
    }
  };

  if (loading || loadingRevenue) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat data pendapatan...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') return null;

  const maxRevenue = revenueData?.monthly?.reduce((max, item) => Math.max(max, item.total), 0) || 1;
  const growthVal = revenueData?.growth || 0;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Header Banner dengan Gradasi Utama */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Financial Insights</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Revenue & Earnings</h1>
            <p className="text-xs text-white/60 mt-1">Pantau performa pendapatan dari penjualan tiket konser secara real-time.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="py-2.5 px-4 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner cursor-pointer"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button 
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaDownload className="w-3.5 h-3.5 text-white" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards dengan Aksen Gradasi */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#6D19B0]/10 rounded-full blur-2xl group-hover:bg-[#6D19B0]/25 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
                <FaWallet className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rp {Number(revenueData?.total || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-[#A78BFA] mt-1 font-medium">Akumulasi seluruh waktu</p>
          </div>

          {/* Card 2: This Month */}
          <div className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#B900A3]/10 rounded-full blur-2xl group-hover:bg-[#B900A3]/25 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Bulan Ini</span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
                <FaCalendarAlt className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Rp {Number(revenueData?.thisMonth || 0).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-[#A78BFA] mt-1 font-medium capitalize">
              {format(new Date(), 'MMMM yyyy', { locale: id })}
            </p>
          </div>

          {/* Card 3: Growth */}
          <div className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 p-6 rounded-2xl shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Growth</span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
                <FaChartLine className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${growthVal >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {growthVal >= 0 ? `+${growthVal}%` : `${growthVal}%`}
              </p>
              {growthVal >= 0 ? (
                <div className="w-7 h-7 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center text-green-300">
                  <FaArrowUp className="w-3.5 h-3.5 text-white" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300">
                  <FaArrowDown className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-white/50 mt-1 font-medium">Dibandingkan bulan lalu</p>
          </div>

        </div>

        {/* Revenue Chart dengan Gradasi Ungu-Magenta */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Revenue Performance Chart</h3>
              <p className="text-xs text-white/60 mt-0.5">Grafik tren pendapatan bulanan</p>
            </div>
          </div>
          
          <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6 border-t border-white/10">
            {revenueData?.monthly?.map((item, index) => {
              const heightPercent = maxRevenue > 0 ? (item.total / maxRevenue) * 100 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-mono text-[#D8B4FE] opacity-0 group-hover:opacity-150 transition-opacity">
                    Rp {(item.total / 1000).toFixed(0)}K
                  </span>
                  <div 
                    className="w-full rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                    style={{ 
                      height: `${Math.max(8, heightPercent)}%`,
                      background: 'linear-gradient(180deg, #B900A3 0%, #6D19B0 100%)' 
                    }}
                  />
                  <span className="text-[11px] font-medium text-white/60 mt-1 truncate max-w-full">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Concert */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-6">
            <h3 className="text-base font-bold text-white">Revenue by Concert</h3>
            <p className="text-xs text-white/60 mt-0.5">Rincian pendapatan berdasarkan masing-masing konser</p>
          </div>

          <div className="space-y-3">
            {revenueData?.byConcert && revenueData.byConcert.length > 0 ? (
              revenueData.byConcert.map((concert, index) => {
                const totalRev = revenueData?.total || 1;
                const percentage = totalRev > 0 ? Math.round((concert.revenue / totalRev) * 100) : 0;
                return (
                  <div key={index} className="bg-black/40 border border-white/10 hover:border-[#8B5CF6]/50 p-4 sm:p-5 rounded-xl transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#6D19B0]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-white shrink-0">
                        <FaMusic className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-white tracking-tight">{concert.name}</p>
                        <p className="text-xs text-white/50 mt-0.5">{concert.tickets || 0} tiket terjual</p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-white/10">
                      <p className="font-extrabold text-white text-base">Rp {Number(concert.revenue || 0).toLocaleString('id-ID')}</p>
                      <p className="text-xs text-[#D8B4FE] font-medium mt-0.5">{percentage}% dari total pendapatan</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-white/40 text-xs">
                Belum ada data rincian pendapatan konser.
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}