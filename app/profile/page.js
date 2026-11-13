'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaEdit, FaSave, FaSpinner, FaLock } from 'react-icons/fa';
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

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileStats, setProfileStats] = useState({ totalTickets: 0, upcomingEvents: 0, wishlistCount: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    city: '',
    country: '',
    address: ''
  });

  const loadProfile = async () => {
    const response = await api.get('/customer/profile');
    if (!response.data.success) {
      throw new Error(response.data.message || 'Gagal memuat profil');
    }
    return response.data.data;
  };

  const applyProfile = (userData) => {
    setFormData({
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      bio: userData.bio || '',
      city: userData.city || '',
      country: userData.country || '',
      address: userData.address || ''
    });
    setProfileStats({
      totalTickets: Number(userData.totalTickets) || 0,
      upcomingEvents: Number(userData.upcomingEvents) || 0,
      wishlistCount: Number(userData.wishlistCount) || 0
    });
  };

  const fetchProfile = async () => {
    try {
      applyProfile(await loadProfile());
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || error.message || 'Gagal memuat profil');
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    let active = true;
    loadProfile()
      .then((userData) => {
        if (active) applyProfile(userData);
      })
      .catch((error) => {
        if (active) {
          console.error('Error fetching profile:', error);
          toast.error(error.response?.data?.message || error.message || 'Gagal memuat profil');
        }
      })
      .finally(() => {
        if (active) setLoadingProfile(false);
      });

    return () => {
      active = false;
    };
  }, [user, loading, router]);

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const response = await api.put('/customer/profile', formData);
      if (response.data.success) {
        const updatedUser = response.data.data;
        setFormData((current) => ({
          ...current,
          name: updatedUser.name || '',
          phone: updatedUser.phone || '',
          bio: updatedUser.bio || '',
          city: updatedUser.city || '',
          country: updatedUser.country || '',
          address: updatedUser.address || ''
        }));
        toast.success('Profil berhasil diperbarui!');
        setIsEditing(false);
      } else {
        toast.error(response.data.message || 'Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Konfirmasi password baru tidak cocok');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await api.put('/customer/profile', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Gagal mengubah password');
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password berhasil diperbarui');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <Navbar />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="w-10 h-10 animate-spin mx-auto text-[#B900A3]" />
            <p className="mt-4 text-white/60 text-xs">Memuat profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#B900A3]/35">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Navbar />

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl border border-[#FA2F84]/40 bg-[#120d1d] p-6 sm:p-8 shadow-lg">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-md" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
                  {(formData.name || user.name)?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">{formData.name || user.name}</h2>
                  <p className="text-xs sm:text-sm text-white/60">{user.email}</p>
                  <span className="mt-2 inline-block px-3 py-1 rounded-full text-[11px] font-medium border border-[#FA2F84]/30 bg-[#FA2F84]/10 text-[#FA2F84]">
                    🎫 Customer
                  </span>
                </div>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  <FaEdit className="w-3.5 h-3.5" />
                  Edit Profil
                </button>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-white/75 mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 pl-11 text-xs sm:text-sm text-white focus:border-[#FA2F84] focus:outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/75 mb-1.5">Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 pl-11 text-xs sm:text-sm text-white focus:border-[#FA2F84] focus:outline-none opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/75 mb-1.5">Nomor Telepon</label>
                  <div className="relative">
                    <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 pl-11 text-xs sm:text-sm text-white focus:border-[#FA2F84] focus:outline-none disabled:opacity-60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white/75 mb-1.5">Kota</label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 pl-11 text-xs sm:text-sm text-white focus:border-[#FA2F84] focus:outline-none disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/75 mb-1.5">Alamat</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="2"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-[#FA2F84] focus:outline-none disabled:opacity-60"
                  placeholder="Alamat lengkap Anda"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/75 mb-1.5">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="3"
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white focus:border-[#FA2F84] focus:outline-none disabled:opacity-60"
                  placeholder="Ceritakan sedikit tentang Anda..."
                />
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="px-5 py-2 rounded-xl border border-white/15 bg-black/40 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    disabled={savingProfile} 
                    className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    {savingProfile ? <FaSpinner className="w-3.5 h-3.5 animate-spin" /> : <FaSave className="w-3.5 h-3.5" />}
                    {savingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              )}
            </form>

            {/* Form Ubah Password */}
            <form onSubmit={handlePasswordChange} className="mt-8 border-t border-white/10 pt-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-white">
                <FaLock className="text-[#FA2F84] w-4 h-4" />
                Ubah Password
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  type="password"
                  autoComplete="current-password"
                  value={passwordForm.currentPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Password saat ini"
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.newPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Password baru (min. 8 karakter)"
                  minLength={8}
                  required
                />
                <input
                  type="password"
                  autoComplete="new-password"
                  value={passwordForm.confirmPassword}
                  onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-xs sm:text-sm text-white placeholder-white/40 focus:border-[#FA2F84] focus:outline-none"
                  placeholder="Konfirmasi password baru"
                  minLength={8}
                  required
                />
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={savingPassword} 
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {savingPassword ? <FaSpinner className="h-3.5 w-3.5 animate-spin" /> : <FaLock className="h-3.5 w-3.5" />}
                  {savingPassword ? 'Menyimpan...' : 'Simpan Password'}
                </button>
              </div>
            </form>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-extrabold text-[#38BDF8]">{profileStats.totalTickets}</p>
                <p className="text-xs text-white/60">Tiket</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-extrabold text-[#A78BFA]">{profileStats.upcomingEvents}</p>
                <p className="text-xs text-white/60">Mendatang</p>
              </div>
              <div className="text-center">
                <p className="text-xl sm:text-2xl font-extrabold text-[#F472B6]">{profileStats.wishlistCount}</p>
                <p className="text-xs text-white/60">Wishlist</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}