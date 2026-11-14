// src/app/admin/dashboard/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { 
  FaUsers, 
  FaBuilding, 
  FaClock, 
  FaMoneyBillWave,
  FaSpinner,
  FaUserCheck
} from 'react-icons/fa';
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

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

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
      fetchDashboard();
    }
  }, [user, loading, router]);

  const fetchDashboard = async () => {
    try {
      setLoadingData(true);
      const response = await api.get('/super-admin/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') return null;

  const stats = {
    totalUsers: dashboardData?.stats?.totalUsers || 0,
    totalOrganizers: dashboardData?.stats?.totalOrganizers || 0,
    pendingVerifications: (dashboardData?.stats?.pendingOrganizers || 0) + (dashboardData?.stats?.pendingConcerts || 0),
    totalRevenue: dashboardData?.stats?.totalRevenue || 0
  };

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <NavbarAdmin />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Super Admin Overview</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Dashboard</h1>
            <p className="text-xs text-white/60 mt-0.5">Ringkasan statistik sistem platform ConcertHub.</p>
          </div>
          <button 
            onClick={fetchDashboard}
            className="rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaSpinner className="w-3.5 h-3.5 text-white animate-spin" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Users</span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
                <FaUsers className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.totalUsers}</p>
          </div>

          <div className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Organizers</span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
                <FaBuilding className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-white">{stats.totalOrganizers}</p>
          </div>

          <div className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Pending Verification</span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
                <FaClock className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-yellow-300">{stats.pendingVerifications}</p>
          </div>

          <div className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Total Revenue</span>
              <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white">
                <FaMoneyBillWave className="w-4 h-4 text-white" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-[#D8B4FE]">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl">
          <h2 className="text-base font-bold text-white mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {dashboardData?.recentUsers?.slice(0, 5).map((userItem) => (
              <div key={userItem.id} className="flex items-center gap-3.5 p-4 bg-black/40 border border-white/10 rounded-xl text-xs">
                <div className="w-9 h-9 rounded-xl bg-[#6D19B0]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-white shrink-0">
                  <FaUserCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="font-bold text-white">{userItem.name} terdaftar</p>
                  <p className="text-[11px] text-white/50 mt-0.5">Sebagai {userItem.role} • {new Date(userItem.createdAt).toLocaleDateString('id-ID')}</p>
                </div>
              </div>
            ))}
            {!dashboardData?.recentUsers?.length && (
              <p className="text-xs text-white/50 text-center py-6">Belum ada aktivitas terbaru.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}