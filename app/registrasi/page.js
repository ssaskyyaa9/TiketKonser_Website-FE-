'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getSafeRedirectPath } from '../../lib/redirect-url';

export default function RegisterCustomerPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(formData);

      if (!result.success) {
        setError(result.error || 'Registration failed');
        setLoading(false);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  const handleLoginClick = (event) => {
    const redirectTo = getSafeRedirectPath(
      new URLSearchParams(window.location.search).get('redirect')
    );
    if (!redirectTo) return;

    event.preventDefault();
    router.push(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#07050A] text-white flex items-center justify-center p-4 lg:px-12 relative overflow-x-hidden select-none">
      <button type="button" onClick={handleBack} className="absolute top-4 left-4 lg:top-6 lg:left-6 cursor-pointer hover:opacity-80 transition-opacity z-20" >
        <img src="/icons/previous.png" alt="Kembali" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
      </button>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center pt-12 lg:pt-0">
        <div className="lg:col-span-6 space-y-2 lg:space-y-5 mt-9">
          <div>
            <h1 className="text-2xl lg:text-4xl font-bold leading-tight">
              Malam penuh kenangan <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3DFF] to-[#FA2F84]">
                dimulai di sini
              </span>
            </h1>

            <p className="text-gray-400 mt-2 text-xs lg:text-sm leading-relaxed">
              Satu akun untuk membeli tiket, menyimpan tiket, dan mengelola konser kamu.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#120B20] flex items-center justify-center shrink-0">
                <img src="/icons/tiketresmi.png" alt="Tiket Resmi" className="w-4 h-4 lg:w-5 lg:h-5 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-xs lg:text-sm">Tiket resmi</h3>
                <p className="text-gray-400 text-xs">Dijual langsung bekerja sama dengan penyelenggara</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#120B20] flex items-center justify-center shrink-0">
                <img src="/icons/pembayaran.png" alt="Bayar Aman" className="w-4 h-4 lg:w-5 lg:h-5 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-xs lg:text-sm">Bayar dengan aman</h3>
                <p className="text-gray-400 text-xs">Virtual account, e-wallet,dan kartu kredit/debit.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-[#120B20] flex items-center justify-center shrink-0">
                <img src="/icons/pelayanan.png" alt="Layanan 24/7" className="w-4 h-4 lg:w-5 lg:h-5 object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-xs lg:text-sm">Layanan selalu 24/7</h3>
                <p className="text-gray-400 text-xs">Dengan langkah kerja mudah di pahami & user friendly</p>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <div className="p-[1px] rounded-2xl bg-gradient-to-r from-[#1E3DFF] to-[#F73BE1] w-120">
              <Link href="/registrasi/organizer" className="block w-full py-3 px-4 rounded-2xl bg-[#07050A] text-center text-xs lg:text-sm font-medium cursor-pointer hover:bg-opacity-80 transition-all" > Ingin menjadi Organizer?{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6D19B0] to-[#B900A3] font-bold"> Daftar sebagai organizer </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-[#0B0813] border border-gray-800/80 rounded-2xl lg:rounded-3xl p-5 lg:p-7 shadow-2xl">
          <div className="mb-4">
            <h2 className="text-xl lg:text-2xl font-bold">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3DFF] to-[#FA2F84]"> Daftarkan akun mu </span>
            </h2>
            <p className="text-gray-400 text-xs mt-1"> Masukan data untuk melengkapi syarat berikut. </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="role" value="customer" />

            <div>
              <label className="block text-xs font-medium mb-1.5">
                Nama lengkap <span className="text-amber-500">*</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src="/icons/user.png" alt="User Icon" className="w-4 h-4 object-contain opacity-60" />
                </div>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Masukan nama lengkap" required disabled={loading} className="w-full bg-transparent border border-gray-800 rounded-xl py-3.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B900A3] disabled:opacity-50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">
                Email <span className="text-amber-500">*</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src="/icons/email.png" alt="Email Icon" className="w-4 h-4 object-contain opacity-60" />
                </div>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="nama@gmail.com" required disabled={loading} className="w-full bg-transparent border border-gray-800 rounded-xl py-3.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B900A3] disabled:opacity-50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">
                No telp <span className="text-amber-500">*</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src="/icons/telephone.png" alt="Phone Icon" className="w-4 h-4 object-contain opacity-60" />
                </div>
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Masukan no telp aktif" disabled={loading} className="w-full bg-transparent border border-gray-800 rounded-xl py-3.5 pl-10 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B900A3] disabled:opacity-50" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5">
                Kata sandi <span className="text-amber-500">*</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src="/icons/padlock.png" alt="Password Icon" className="w-4 h-4 object-contain opacity-60" />
                </div>
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder="Minimal 6 karakter" required minLength={6} disabled={loading} className="w-full bg-transparent border border-gray-800 rounded-xl py-3.5 pl-10 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#B900A3] disabled:opacity-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={loading} className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer text-gray-400 hover:text-white transition-colors" >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.349-3.938 5.064-7 9.544-7s8.195 3.062 9.544 7c-1.349 3.938-5.064 7-9.544 7s-8.195-3.062-9.544-7Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>


            <button type="submit" disabled={loading} className="w-full mt-3 py-3 px-4 rounded-xl font-medium text-xs lg:text-sm text-white bg-gradient-to-r from-[#6D19B0] to-[#B900A3] hover:opacity-95 transition-opacity cursor-pointer shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 disabled:opacity-60" >
              {loading ? (
                <> <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Mendaftar... </>
              ) : (
                'Daftarkan sebagai customer'
              )}
            </button>

            <p className="text-center text-1x1 text-gray-400 pt-1"> Sudah punya akun?{' '}
              <Link href="/login" onClick={handleLoginClick} className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E3DFF] to-[#FA2F84] font-medium hover:underline cursor-pointer"> Masuk di sini </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}