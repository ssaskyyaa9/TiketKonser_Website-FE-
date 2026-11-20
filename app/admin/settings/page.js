'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
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

export default function AdminSettingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    siteName: 'ShowTime',
    siteDescription: 'Concert Ticket Booking Platform',
    currency: 'IDR',
    emailVerification: true,
    twoFactorAuth: false,
    maintenanceMode: false
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

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
      fetchSettings();
    }
  }, [user, loading, router]);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await api.get('/super-admin/system');
      if (response.data.success) {
        setSettings((current) => ({ ...current, ...response.data.data }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSettings = async () => {
    try {
      const response = await api.put('/super-admin/system', settings);
      if (response.data.success) {
        toast.success('Pengaturan sistem berhasil disimpan');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan pengaturan');
    }
  };

  if (loading || loadingSettings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat pengaturan...</p>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Configuration</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">System Settings</h1>
            <p className="text-xs text-white/60 mt-0.5">Kelola pengaturan umum dan keamanan platform.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          <div className="bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm text-white mb-2">General Settings</h3>
            
            <div>
              <label className="block font-semibold text-white/80 mb-1.5">Site Name</label>
              <input 
                type="text" 
                name="siteName"
                value={settings.siteName}
                onChange={handleSettingChange}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block font-semibold text-white/80 mb-1.5">Site Description</label>
              <input 
                type="text" 
                name="siteDescription"
                value={settings.siteDescription}
                onChange={handleSettingChange}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all" 
              />
            </div>

            <div>
              <label className="block font-semibold text-white/80 mb-1.5">Currency</label>
              <select 
                name="currency"
                value={settings.currency}
                onChange={handleSettingChange}
                className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
              >
                <option value="IDR">Indonesian Rupiah (Rp)</option>
                <option value="USD">US Dollar ($)</option>
              </select>
            </div>

            <div className="pt-2">
              <button 
                onClick={handleSaveSettings} 
                className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 cursor-pointer"
                style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                Save Settings
              </button>
            </div>
          </div>

          <div className="bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl space-y-4">
            <h3 className="font-extrabold text-sm text-white mb-2">Security & Maintenance</h3>
            
            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
              <div>
                <h4 className="font-bold text-white">Email Verification</h4>
                <p className="text-[11px] text-white/60 mt-0.5">Require email verification for new users</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="emailVerification"
                  checked={settings.emailVerification}
                  onChange={handleSettingChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-[#8B5CF6] transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
              <div>
                <h4 className="font-bold text-white">Two-Factor Authentication</h4>
                <p className="text-[11px] text-white/60 mt-0.5">Enable 2FA for admin accounts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onChange={handleSettingChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-[#8B5CF6] transition-all"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-xl">
              <div>
                <h4 className="font-bold text-white">Maintenance Mode</h4>
                <p className="text-[11px] text-white/60 mt-0.5">Put the platform in maintenance mode</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onChange={handleSettingChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-white/20 rounded-full peer peer-checked:bg-[#8B5CF6] transition-all"></div>
              </label>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}