'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function RegisterOrganizerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    description: '',
    website: '',
    instagram: '',
    youtube: '',
    city: '',
    address: '',
    bankName: '',
    bankAccount: '',
    bankHolder: '',
    role: 'organizer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();

  const ICON_PATH = '/icons';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Nama lengkap wajib diisi';
    if (!formData.email) newErrors.email = 'Email wajib diisi';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }
    if (!formData.companyName) newErrors.companyName = 'Nama perusahaan wajib diisi';
    if (!formData.city) newErrors.city = 'Kota wajib diisi';
    if (!formData.address) newErrors.address = 'Alamat wajib diisi';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon isi semua field yang wajib (*)');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await register(formData);
      
      if (!result.success) {
        setLoading(false);
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat registrasi');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center justify-center py-8 px-4 relative overflow-x-hidden no-scrollbar">
      <style jsx global>{`
        html, body {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar, .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        /* Mencegah autofill browser merubah background dan teks menjadi putih */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0px 1000px #0C0C0E inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <Link
        href="/"
        className="fixed top-7 left-7 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      >
        <img
          src={`${ICON_PATH}/previous.png`}
          alt="Kembali"
          className="w-11 h-11 object-contain"
        />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[820px] flex flex-col gap-5 z-10"
      >
        <div className="w-full bg-[#09090B] border border-white/25 rounded-[22px] px-7 py-9 md:px-12 md:py-10 shadow-2xl">
          <div className="text-center mb-9">
            <h1 className="text-2xl md:text-[28px] font-bold tracking-tight bg-gradient-to-r from-[#2B66FF] via-[#8E38FF] to-[#FF2E93] bg-clip-text text-transparent">
              Daftarkan akun sebagai organizer
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2.5">
              <img
                src={`${ICON_PATH}/warning.png`}
                alt="Peringatan"
                className="w-4 h-4 object-contain"
              />
              <p className="text-xs md:text-[13px] text-[#FBBF24] font-normal">
                Semua field dengan tanda * wajib diisi
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            <div className="border-b border-white/15 pb-7">
              <h3 className="text-base md:text-[17px] font-semibold mb-5 bg-gradient-to-r from-[#2E6BFF] to-[#7B61FF] bg-clip-text text-transparent inline-block">
                Informasi Pribadi
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Nama lengkap <span className="text-[#F59E0B] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/user.png`}
                      alt="User"
                      className="w-4 h-4 object-contain absolute left-4 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
                    />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukan nama lengkap"
                      required
                      className={`w-full bg-[#0C0C0E] text-white ${
                        errors.name ? 'border-red-500' : 'border-white/25 focus:border-[#9D34DA]'
                      } border rounded-[10px] py-2.5 pl-11 pr-4 text-[13px] placeholder:text-white/35 outline-none transition-colors`}
                    />
                  </div>
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Email <span className="text-[#F59E0B] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/email.png`}
                      alt="Email"
                      className="w-4 h-4 object-contain absolute left-4 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nama@gmail.com"
                      required
                      className={`w-full bg-[#0C0C0E] text-white ${
                        errors.email ? 'border-red-500' : 'border-white/25 focus:border-[#9D34DA]'
                      } border rounded-[10px] py-2.5 pl-11 pr-4 text-[13px] placeholder:text-white/35 outline-none transition-colors`}
                    />
                  </div>
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    No telp <span className="text-[#F59E0B] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/telephone.png`}
                      alt="Telepon"
                      className="w-4 h-4 object-contain absolute left-4 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Masukan no telp aktif"
                      required
                      className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] py-2.5 pl-11 pr-4 text-[13px] placeholder:text-white/35 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Kata sandi <span className="text-[#F59E0B] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/padlock.png`}
                      alt="Kata Sandi"
                      className="w-4 h-4 object-contain absolute left-4 top-1/2 -translate-y-1/2 opacity-60 pointer-events-none"
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimal 6 karakter"
                      required
                      minLength={6}
                      className={`w-full bg-[#0C0C0E] text-white ${
                        errors.password ? 'border-red-500' : 'border-white/25 focus:border-[#9D34DA]'
                      } border rounded-[10px] py-2.5 pl-11 pr-11 text-[13px] placeholder:text-white/35 outline-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                    >
                      {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>
            </div>

            <div className="border-b border-white/15 pb-7">
              <h3 className="text-base md:text-[17px] font-semibold mb-5 bg-gradient-to-r from-[#2E6BFF] to-[#7B61FF] bg-clip-text text-transparent inline-block">
                Informasi Perusahaan
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Nama Perusahaan <span className="text-[#F59E0B] ml-0.5">*</span>
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/building.png`}
                      alt="Perusahaan"
                      className="w-4 h-4 object-contain absolute left-4 top-1/2 -translate-y-1/2 brightness-0 invert opacity-70 pointer-events-none"
                    />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Nama perusahaan"
                      required
                      className={`w-full bg-[#0C0C0E] text-white ${
                        errors.companyName ? 'border-red-500' : 'border-white/25 focus:border-[#9D34DA]'
                      } border rounded-[10px] py-2.5 pl-11 pr-4 text-[13px] placeholder:text-white/35 outline-none transition-colors`}
                    />
                  </div>
                  {errors.companyName && <p className="text-red-400 text-xs mt-1">{errors.companyName}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Deskripsi Perusahaan
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ceritakan tentang perusahaan anda"
                    className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] p-3.5 text-[13px] placeholder:text-white/35 outline-none transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Kota <span className="text-[#F59E0B] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="kota"
                    required
                    className={`w-full bg-[#0C0C0E] text-white ${
                      errors.city ? 'border-red-500' : 'border-white/25 focus:border-[#9D34DA]'
                    } border rounded-[10px] py-2.5 px-4 text-[13px] placeholder:text-white/35 outline-none transition-colors`}
                  />
                  {errors.city && <p className="text-red-400 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Alamat <span className="text-[#F59E0B] ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Alamat lengkap"
                    required
                    className={`w-full bg-[#0C0C0E] text-white ${
                      errors.address ? 'border-red-500' : 'border-white/25 focus:border-[#9D34DA]'
                    } border rounded-[10px] py-2.5 px-4 text-[13px] placeholder:text-white/35 outline-none transition-colors`}
                  />
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            <div className="border-b border-white/15 pb-7">
              <h3 className="text-base md:text-[17px] font-semibold mb-5 bg-gradient-to-r from-[#2E6BFF] to-[#7B61FF] bg-clip-text text-transparent inline-block">
                Media Sosial
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/website.png`}
                      alt="Website"
                      className="w-4 h-4 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 brightness-0 invert opacity-70 pointer-events-none"
                    />
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https//.."
                      className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] py-2.5 pl-10 pr-3.5 text-[13px] placeholder:text-white/35 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Instagram
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/instagram.png`}
                      alt="Instagram"
                      className="w-4 h-4 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 brightness-0 invert opacity-70 pointer-events-none"
                    />
                    <input
                      type="text"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="@username"
                      className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] py-2.5 pl-10 pr-3.5 text-[13px] placeholder:text-white/35 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Youtube
                  </label>
                  <div className="relative">
                    <img
                      src={`${ICON_PATH}/youtube.png`}
                      alt="Youtube"
                      className="w-4 h-4 object-contain absolute left-3.5 top-1/2 -translate-y-1/2 brightness-0 invert opacity-70 pointer-events-none"
                    />
                    <input
                      type="text"
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleChange}
                      placeholder="Channer URL"
                      className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] py-2.5 pl-10 pr-3.5 text-[13px] placeholder:text-white/35 outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base md:text-[17px] font-semibold mb-5 bg-gradient-to-r from-[#2E6BFF] to-[#7B61FF] bg-clip-text text-transparent inline-block">
                Informasi Bank
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Nama Bank
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="contoh nama bank.."
                    className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] py-2.5 px-3.5 text-[13px] placeholder:text-white/35 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Nomor Rekening
                  </label>
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleChange}
                    placeholder="contoh: 129 00 072***"
                    className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] py-2.5 px-3.5 text-[13px] placeholder:text-white/35 outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-white mb-2">
                    Nama Pemilik Rekening
                  </label>
                  <input
                    type="text"
                    name="bankHolder"
                    value={formData.bankHolder}
                    onChange={handleChange}
                    placeholder="Masukan nama"
                    className="w-full bg-[#0C0C0E] text-white border border-white/25 focus:border-[#9D34DA] rounded-[10px] py-2.5 px-3.5 text-[13px] placeholder:text-white/35 outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-[10px] font-semibold text-white text-[15px] bg-gradient-to-r from-[#8E24AA] via-[#B4199B] to-[#D81B60] hover:opacity-95 transition-opacity flex items-center justify-center shadow-lg shadow-fuchsia-900/30 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mendaftar...
                  </span>
                ) : (
                  'Daftar'
                )}
              </motion.button>
            </div>
          </form>

          <p className="text-center text-white/85 text-[13px] mt-4">
            Sudah punya akun?{' '}
            <Link
              href="/login"
              className="bg-gradient-to-r from-[#9C27B0] to-[#E91E63] bg-clip-text text-transparent font-medium hover:opacity-80 transition-opacity"
            >
              Masuk di sini
            </Link>
          </p>
        </div>

        <div className="w-full bg-[#3A2E1A]/90 border border-[#8A6D3B]/60 rounded-[12px] py-3.5 px-6 flex items-center justify-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-[#FBBF24] shrink-0" />
          <p className="text-[#FBBF24] text-xs md:text-[13.5px] font-normal text-center">
            Setelah mendaftar, akun Anda akan menunggu verifikasi dari admin.
          </p>
        </div>
      </motion.div>
    </div>
  );
}