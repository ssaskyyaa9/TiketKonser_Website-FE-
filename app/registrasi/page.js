'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerCustomer } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const name = formData.get('name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');

    try {
      const data = await registerCustomer(name, email, password, phone);

      console.log('Register berhasil:', data);

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      router.push('/login');
    } catch (error) {
      console.error('Register gagal:', error);
      alert(error.message);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-[#030205] text-white flex items-center justify-center p-4 overflow-hidden font-sans select-none">
      <div className="absolute inset-0 z-0">
        <Image src="/icons/bg.png" alt="Concert Background" fill priority className="object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/60 pointer-events-none"></div>
      </div>

      <div className="absolute top-6 left-6 z-20">
        <Link href="/landing" className="block transition-transform hover:scale-105 active:scale-95 focus:outline-none" >
          <Image src="/icons/previous.png" alt="Kembali ke Landing" width={48} height={48} className="w-10 h-10 md:w-12 md:h-12 object-contain" />
        </Link>
      </div>

      <div className="relative z-10 w-[92%] max-w-[440px] bg-black/85 rounded-2xl border border-white/60 p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold inline-block bg-gradient-to-r from-[#1E3DFF] to-[#FA2F84] bg-clip-text text-transparent mb-2">
            Daftar Akun
          </h1>

          <p className="text-sm text-gray-300">
            Sudah punya akun?{' '}
            <button type="button" onClick={() => router.push('/login')}
              className="inline-block bg-gradient-to-r from-[#1E3DFF] to-[#FA2F84] bg-clip-text text-transparent hover:opacity-80 font-medium transition-opacity cursor-pointer border-none p-0"
            >
              Masuk di sini
            </button>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleRegister}>
          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center justify-center w-5 h-5">
              <Image src="/icons/user.png" alt="User Icon" width={20} height={20} className="object-contain" />
            </div>

            <input type="text" name="name" placeholder="Nama Lengkap"
              className="w-full bg-transparent border border-white/60 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F73BE1] transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center justify-center w-5 h-5">
              <Image src="/icons/email.png" alt="Email Icon" width={20} height={20} className="object-contain" />
            </div>

            <input type="email" name="email" placeholder="Email"
              className="w-full bg-transparent border border-white/60 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F73BE1] transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center justify-center w-5 h-5">
              <Image src="/icons/telephone.png" alt="Telephone Icon" width={20} height={20} className="object-contain" />
            </div>

            <input type="tel" name="phone" placeholder="Nomor Telepon"
              className="w-full bg-transparent border border-white/60 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F73BE1] transition-all"
            />
          </div>

          <div className="relative flex items-center">
            <div className="absolute left-4 flex items-center justify-center w-5 h-5">
              <Image src="/icons/padlock.png" alt="Password Icon" width={20} height={20} className="object-contain" />
            </div>

            <input type={showPassword ? "text" : "password"} name="password" placeholder="Kata Sandi"
              className="w-full bg-transparent border border-white/60 rounded-xl py-3 pl-12 pr-11 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-[#F73BE1] transition-all"
            />

            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-gray-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.274 4.057 5.065 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.064-7-9.542-7-4.477 0-8.268 2.943-9.542 7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>

          <div className="pt-2">
            <button type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#8138E8] to-[#F73BE1] text-white font-semibold text-sm md:text-base shadow-lg hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer" >
              Daftar Sekarang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}