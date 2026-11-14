// src/app/organizer/profile/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavbarEO from '../../../components/navbarEO';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSpinner, FaUserTie, FaBuilding, FaSave } from 'react-icons/fa';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const emptyProfile = {
  name: '',
  email: '',
  phone: '',
  companyName: '',
  description: '',
  website: '',
  instagram: '',
  youtube: '',
  city: '',
  address: '',
  verificationStatus: 'pending'
};

export default function OrganizerProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(emptyProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return undefined;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return undefined;
    }
    if (user?.role !== 'organizer') return undefined;

    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const response = await api.get('/organizer/profile');
        if (cancelled) return;
        const data = response.data.data;
        setProfile({
          ...emptyProfile,
          ...data,
          name: data.user?.name || user.name || '',
          email: data.user?.email || user.email || '',
          phone: data.user?.phone || ''
        });
      } catch (error) {
        if (!cancelled) toast.error(error.response?.data?.message || 'Gagal memuat profil organizer');
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [user, loading, router]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setProfile((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await api.put('/organizer/profile', {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
        companyName: profile.companyName.trim(),
        description: profile.description,
        website: profile.website,
        instagram: profile.instagram,
        youtube: profile.youtube,
        city: profile.city.trim(),
        address: profile.address.trim()
      });
      const data = response.data.data;
      setProfile((current) => ({
        ...current,
        ...data,
        name: data.user?.name || current.name,
        email: data.user?.email || current.email,
        phone: data.user?.phone || ''
      }));
      toast.success('Profil organizer berhasil diperbarui');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat profil organizer...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') return null;

  const fields = [
    ['companyName', 'Nama Penyelenggara', true],
    ['city', 'Kota', true],
    ['website', 'Website', false],
    ['instagram', 'Instagram', false],
    ['youtube', 'YouTube', false]
  ];

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        <Link 
          href="/organizer/dashboard" 
          className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors bg-[#120d1d] border border-white/15 px-3.5 py-2 rounded-xl shadow-sm mb-6"
        >
          <FaArrowLeft className="text-white" /> Kembali ke Dashboard
        </Link>

        <section className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-xl">
          <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/10 shrink-0" 
                style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                <FaUserTie className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Profil Organizer</h1>
                <p className="text-xs text-white/60 mt-0.5">Informasi ini digunakan untuk identitas dan kontak resmi penyelenggara.</p>
              </div>
            </div>
            
            <span className="rounded-full bg-[#6D19B0]/30 border border-[#8B5CF6]/40 px-3.5 py-1 text-xs font-bold text-[#D8B4FE] capitalize shrink-0">
              Verifikasi: {profile.verificationStatus}
            </span>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2 text-xs">
              
              <label className="space-y-2">
                <span className="font-semibold text-white/80">Nama Kontak <span className="text-[#D8B4FE]">*</span></span>
                <input 
                  name="name" 
                  value={profile.name} 
                  onChange={updateField} 
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
                  required 
                  maxLength={100} 
                />
              </label>

              <label className="space-y-2">
                <span className="font-semibold text-white/80">Email Akun</span>
                <input 
                  value={profile.email} 
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-white/50 cursor-not-allowed" 
                  readOnly 
                />
              </label>

              <label className="space-y-2">
                <span className="font-semibold text-white/80">Nomor Telepon</span>
                <input 
                  name="phone" 
                  value={profile.phone} 
                  onChange={updateField} 
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
                  maxLength={32} 
                />
              </label>

              {fields.map(([name, label, required]) => (
                <label key={name} className="space-y-2">
                  <span className="font-semibold text-white/80">
                    {label} {required ? <span className="text-[#D8B4FE]">*</span> : ''}
                  </span>
                  <input
                    name={name}
                    value={profile[name] || ''}
                    onChange={updateField}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    required={required}
                    maxLength={name === 'companyName' ? 150 : 255}
                  />
                </label>
              ))}

              <label className="space-y-2 md:col-span-2">
                <span className="font-semibold text-white/80">Alamat Penyelenggara <span className="text-[#D8B4FE]">*</span></span>
                <textarea 
                  name="address" 
                  value={profile.address} 
                  onChange={updateField} 
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
                  rows={3} 
                  required 
                  maxLength={2000} 
                />
              </label>

              <label className="space-y-2 md:col-span-2">
                <span className="font-semibold text-white/80">Deskripsi Penyelenggara</span>
                <textarea 
                  name="description" 
                  value={profile.description || ''} 
                  onChange={updateField} 
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all" 
                  rows={4} 
                  maxLength={5000} 
                />
              </label>

            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button 
                type="submit" 
                disabled={saving} 
                className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-w-[140px]"
                style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
              >
                {saving ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-3.5 h-3.5 text-white" />
                    <span>Simpan Profil</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}