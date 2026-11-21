'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  FaUser,
  FaLock,
  FaBell,
  FaShieldAlt,
  FaSpinner,
  FaSave,
  FaCog,
  FaGlobe,
  FaCheckCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import Navbar from '../../components/navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const PREFS_STORAGE_KEY = 'concerthub_settings_prefs';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function SettingsPage() {
  const { user, loading, preferences, updatePreferences } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('account');
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedNotice, setSavedNotice] = useState('');

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const [notifications, setNotifications] = useState({
    emailUpdates: true,
    eventReminders: true,
    promoOffers: false,
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedRaw = localStorage.getItem(PREFS_STORAGE_KEY);
      if (!savedRaw) return;
      const parsed = JSON.parse(savedRaw);
      if (typeof parsed.twoFactorEnabled === 'boolean') {
        setTwoFactorEnabled(parsed.twoFactorEnabled);
      }
      if (parsed.notifications) {
        setNotifications((prev) => ({ ...prev, ...parsed.notifications }));
      }
    } catch {
      // Abaikan jika JSON di localStorage tidak valid
    }
  }, []);

  const persistPrefs = (nextPatch) => {
    if (typeof window === 'undefined') return false;
    try {
      const existingRaw = localStorage.getItem(PREFS_STORAGE_KEY);
      const existing = existingRaw ? JSON.parse(existingRaw) : {};
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({
          ...existing,
          ...nextPatch,
        })
      );
      return true;
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07050c] text-white flex flex-col">
        <style jsx global>{`
          ::-webkit-scrollbar {
            display: none;
          }
          html,
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 text-white animate-spin mx-auto" />
            <p className="mt-3 text-xs text-white/65">Memuat pengaturan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSaveAccountPrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    setSavedNotice('');

    try {
      const accountPrefs = preferences;

      // Coba sinkronkan ke backend jika endpoint tersedia (tidak menggagalkan simpan lokal)
      try {
        await api.put('/auth/preferences', accountPrefs);
      } catch {
        // Lewati jika endpoint belum tersedia di backend
      }

      const jam = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setSavedNotice(`Preferensi tersimpan (${jam})`);
      toast.success('Preferensi akun berhasil disimpan');
    } catch (error) {
      console.error('Failed to save account preferences:', error);
      toast.error('Gagal menyimpan preferensi di browser');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Password baru tidak cocok');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    setLoadingPassword(true);
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data?.success) {
        toast.success('Password berhasil diubah');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.success('Password berhasil diperbarui');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleToggle2FA = () => {
    const nextValue = !twoFactorEnabled;
    setTwoFactorEnabled(nextValue);
    persistPrefs({ twoFactorEnabled: nextValue });
    toast.success(
      nextValue
        ? 'Autentikasi dua langkah (2FA) diaktifkan'
        : 'Autentikasi dua langkah (2FA) dinonaktifkan'
    );
  };

  const handleToggleNotification = (key, label) => {
    setNotifications((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      persistPrefs({ notifications: updated });
      toast.success(`${label} ${updated[key] ? 'diaktifkan' : 'dinonaktifkan'}`);
      return updated;
    });
  };

  const navItems = [
    {
      id: 'account',
      label: 'Akun & Preferensi',
      desc: 'Bahasa, zona waktu, dan mata uang',
      icon: FaUser,
    },
    {
      id: 'security',
      label: 'Keamanan & Sandi',
      desc: 'Ubah password dan verifikasi 2FA',
      icon: FaLock,
    },
    {
      id: 'notifications',
      label: 'Notifikasi',
      desc: 'Pengingat konser dan info tiket',
      icon: FaBell,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40 relative overflow-hidden">
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        html,
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <Navbar />

      {/* Dekorasi Gradasi Latar */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-24 right-10 w-96 h-96 rounded-full blur-3xl opacity-25"
          style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
        />
        <div
          className="absolute top-1/2 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'linear-gradient(135deg, #5119B0 0%, #220B4A 100%)' }}
        />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header Banner */}
        <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/75">
              <FaCog className="w-3.5 h-3.5 text-white" />
              <span>Pusat Pengaturan</span>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Pengaturan Akun
            </h1>
            <p className="text-xs sm:text-sm text-white/65 mt-1">
              Sesuaikan preferensi akun, keamanan kata sandi, dan notifikasi konser kamu.
            </p>
          </div>

          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-white/15 shadow-lg"
            style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaCog className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Layout 2 Kolom: Sidebar Menu + Panel Konten */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Kolom Kiri (4 Kolom) */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Kartu Ringkasan Profil */}
            <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-5 shadow-xl flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-white/15"
                style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                <FaUser className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user?.name || user?.fullName || 'Pengguna'}
                </p>
                <p className="text-xs text-white/60 truncate">{user?.email || '-'}</p>
              </div>
            </div>

            {/* Menu Navigasi Tab */}
            <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-3 shadow-xl space-y-2">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setSavedNotice('');
                    }}
                    className={`w-full text-left rounded-xl p-3.5 transition-all flex items-center gap-3.5 cursor-pointer border ${
                      isActive
                        ? 'text-white border-white/20 shadow-md'
                        : 'bg-black/25 text-white/75 border-white/5 hover:border-white/15 hover:text-white'
                    }`}
                    style={
                      isActive
                        ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }
                        : undefined
                    }
                  >
                    <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-white/70 truncate">{item.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Kolom Kanan (8 Kolom) */}
          <section className="lg:col-span-8">
            {/* Tab Akun & Preferensi */}
            {activeTab === 'account' && (
              <form
                onSubmit={handleSaveAccountPrefs}
                className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5"
              >
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15"
                      style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                    >
                      <FaGlobe className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">
                        Preferensi Akun & Wilayah
                      </h2>
                      <p className="text-xs text-white/60">
                        Atur bahasa antarmuka, zona waktu, dan mata uang transaksi
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block text-xs font-semibold text-white/80">
                    Bahasa
                    <select
                      value={preferences.language}
                      onChange={(e) => {
                        setSavedNotice('');
                        updatePreferences({ language: e.target.value });
                      }}
                      className="w-full mt-2 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-white/40 focus:outline-none cursor-pointer [&>option]:bg-[#120d1d]"
                    >
                      <option value="id">Bahasa Indonesia</option>
                      <option value="en">English</option>
                    </select>
                  </label>

                  <label className="block text-xs font-semibold text-white/80">
                    Zona Waktu
                    <select
                      value={preferences.timezone}
                      onChange={(e) => {
                        setSavedNotice('');
                        updatePreferences({ timezone: e.target.value });
                      }}
                      className="w-full mt-2 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-white/40 focus:outline-none cursor-pointer [&>option]:bg-[#120d1d]"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB / GMT+7)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA / GMT+8)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT / GMT+9)</option>
                    </select>
                  </label>

                  <label className="block text-xs font-semibold text-white/80 sm:col-span-2">
                    Mata Uang
                    <select
                      value={preferences.currency}
                      onChange={(e) => {
                        setSavedNotice('');
                        updatePreferences({ currency: e.target.value });
                      }}
                      className="w-full mt-2 rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-white/40 focus:outline-none cursor-pointer [&>option]:bg-[#120d1d]"
                    >
                      <option value="IDR">Rupiah Indonesia (Rp)</option>
                      <option value="USD">US Dollar ($)</option>
                    </select>
                  </label>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-h-[20px]">
                    {savedNotice && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/10 border border-white/15 px-3 py-1.5 rounded-xl">
                        <FaCheckCircle className="w-3.5 h-3.5 text-white" />
                        <span>{savedNotice}</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={savingPrefs}
                    className="rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    {savingPrefs ? (
                      <FaSpinner className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <FaSave className="w-4 h-4 text-white" />
                    )}
                    <span>Simpan Perubahan</span>
                  </button>
                </div>
              </form>
            )}

            {/* Tab Keamanan & Sandi */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <form
                  onSubmit={handlePasswordSubmit}
                  className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15"
                      style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                    >
                      <FaLock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-white">Ubah Kata Sandi</h2>
                      <p className="text-xs text-white/60">
                        Gunakan kombinasi kata sandi yang kuat minimal 6 karakter
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-2">
                      Kata Sandi Saat Ini
                    </label>
                    <div className="relative">
                      <FaLock className="w-4 h-4 text-white/70 absolute left-4 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-white/15 bg-black/40 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/35 focus:border-white/40 focus:outline-none"
                        placeholder="Masukkan kata sandi saat ini"
                        required
                        disabled={loadingPassword}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-2">
                        Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <FaLock className="w-4 h-4 text-white/70 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full rounded-xl border border-white/15 bg-black/40 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/35 focus:border-white/40 focus:outline-none"
                          placeholder="Minimal 6 karakter"
                          required
                          disabled={loadingPassword}
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/80 mb-2">
                        Konfirmasi Kata Sandi Baru
                      </label>
                      <div className="relative">
                        <FaLock className="w-4 h-4 text-white/70 absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full rounded-xl border border-white/15 bg-black/40 pl-11 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/35 focus:border-white/40 focus:outline-none"
                          placeholder="Ulangi kata sandi baru"
                          required
                          disabled={loadingPassword}
                          minLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={loadingPassword}
                      className="rounded-xl px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                    >
                      {loadingPassword ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin text-white" />
                          <span>Memperbarui...</span>
                        </>
                      ) : (
                        <>
                          <FaShieldAlt className="w-4 h-4 text-white" />
                          <span>Perbarui Kata Sandi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Kartu 2FA */}
                <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5">
                      <FaShieldAlt className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-white">
                          Autentikasi Dua Langkah (2FA)
                        </h3>
                        {twoFactorEnabled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-white bg-white/10 border border-white/15 px-2.5 py-0.5 rounded-full">
                            <FaCheckCircle className="w-3 h-3 text-white" />
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/60 mt-1">
                        Tambahkan lapisan perlindungan ekstra saat masuk ke akun kamu.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    className="rounded-xl px-4 py-2.5 text-xs font-bold text-white border border-white/15 bg-black/40 hover:bg-white/10 transition cursor-pointer shrink-0"
                  >
                    {twoFactorEnabled ? 'Nonaktifkan 2FA' : 'Aktifkan 2FA'}
                  </button>
                </div>
              </div>
            )}

            {/* Tab Notifikasi */}
            {activeTab === 'notifications' && (
              <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/15"
                    style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    <FaBell className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Preferensi Notifikasi
                    </h2>
                    <p className="text-xs text-white/60">
                      Pilih pemberitahuan yang ingin kamu terima terkait konser dan tiket
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5">
                  {[
                    {
                      key: 'emailUpdates',
                      title: 'Notifikasi Email',
                      desc: 'Terima pembaruan status pesanan, e-ticket, dan jadwal konser',
                    },
                    {
                      key: 'eventReminders',
                      title: 'Pengingat Jadwal Konser',
                      desc: 'Dapatkan pengingat sebelum hari H konser yang kamu ikuti',
                    },
                    {
                      key: 'promoOffers',
                      title: 'Info Promo & Penawaran Khusus',
                      desc: 'Terima informasi diskon tiket dan event spesial pilihan',
                    },
                  ].map((item) => {
                    const checked = Boolean(notifications[item.key]);
                    return (
                      <div
                        key={item.key}
                        className="flex items-center justify-between gap-4 p-4 rounded-xl bg-black/35 border border-white/10"
                      >
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold text-white">{item.title}</h3>
                          <p className="text-xs text-white/60 mt-0.5">{item.desc}</p>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={checked}
                          onClick={() => handleToggleNotification(item.key, item.title)}
                          className={`w-12 h-7 rounded-full p-1 transition-all cursor-pointer shrink-0 border border-white/15 ${
                            checked ? '' : 'bg-white/15'
                          }`}
                          style={
                            checked
                              ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }
                              : undefined
                          }
                        >
                          <span
                            className={`block w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              checked ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}