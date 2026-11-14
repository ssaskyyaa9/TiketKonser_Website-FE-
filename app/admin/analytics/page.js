// src/app/admin/analytics/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaSpinner } from 'react-icons/fa';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function AdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'super_admin') {
      fetchAnalytics();
    }
  }, [user, loading, router]);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const response = await api.get('/super-admin/analytics');
      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  if (loading || loadingAnalytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat analitik...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <NavbarAdmin />

      <main className="ml-64 p-8 max-w-7xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-8 bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Platform Stats</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Analytics</h1>
            <p className="text-xs text-white/60 mt-0.5">Analisis pertumbuhan pengguna, pendapatan bulanan, dan konser terlaris.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
            <h3 className="font-extrabold text-sm text-white mb-4">Monthly Revenue</h3>
            <div className="space-y-3">
              {analytics?.monthlyRevenue?.map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{item.month}</span>
                    <span className="text-white font-bold">Rp {parseInt(item.total).toLocaleString('id-ID')}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                        width: `${Math.min((parseInt(item.total) / 10000000) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
            <h3 className="font-extrabold text-sm text-white mb-4">User Growth</h3>
            <div className="space-y-3">
              {analytics?.userGrowth?.map((item) => (
                <div key={item.month}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{item.month}</span>
                    <span className="text-white font-bold">{item.count} pengguna</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                        width: `${Math.min((parseInt(item.count) / 500) * 100, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl md:col-span-2">
            <h3 className="font-extrabold text-sm text-white mb-4">Konser Terlaris</h3>
            <div className="space-y-3">
              {analytics?.topConcerts?.length ? analytics.topConcerts.map((concert) => (
                <div key={concert.id} className="flex items-center justify-between gap-4 p-3 bg-black/40 border border-white/10 rounded-xl">
                  <span className="truncate text-white font-bold">{concert.name}</span>
                  <span className="shrink-0 text-xs font-bold text-[#D8B4FE]">{Number(concert.ticketCount || 0).toLocaleString('id-ID')} tiket</span>
                </div>
              )) : <p className="text-xs text-white/50 text-center py-4">Belum ada data penjualan konser.</p>}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}