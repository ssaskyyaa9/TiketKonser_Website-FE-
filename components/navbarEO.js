'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import NotificationBell from './notificationbell';

const NavbarEO = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.navbar-profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const dashboardPath = user?.role === 'organizer'
    ? '/organizer/dashboard'
    : user?.role === 'admin'
      ? '/admin/dashboard'
      : user?.role === 'super_admin'
        ? '/super-admin/dashboard'
        : '/dashboard';

  const icons = {
    dashboard: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    concerts: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    ticket: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
      </svg>
    ),
    qrScan: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
      </svg>
    ),
    seatLayout: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gallery: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    promo: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
      </svg>
    ),
    orders: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    revenue: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    analytics: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    bookmark: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
    user: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    settings: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    logout: (
      <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
    ),

    chevronDown: (
      <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    )
  };

  const profileMenu = user?.role === 'organizer'
    ? [
        { href: '/organizer/dashboard', icon: icons.dashboard, label: 'Halaman Utama' },
        { href: '/organizer/concerts', icon: icons.concerts, label: 'Kelola Konser' },
        { href: '/organizer/tickets', icon: icons.ticket, label: 'Manajemen Tiket' },
        { href: '/organizer/scan-ticket', icon: icons.qrScan, label: 'Scan Check-in Tiket' },
        { href: '/organizer/seat-layout', icon: icons.seatLayout, label: 'Tata Letak Kursi' },
        { href: '/organizer/gallery', icon: icons.gallery, label: 'Galeri' },
        { href: '/organizer/promo', icon: icons.promo, label: 'Promo' },
        { href: '/organizer/orders', icon: icons.orders, label: 'Daftar Pesanan' },
        { href: '/organizer/revenue', icon: icons.revenue, label: 'Pendapatan' },
        { href: '/organizer/analytics', icon: icons.analytics, label: 'Analitik' },
        { href: '/organizer/profile', icon: icons.user, label: 'Profil Saya' },
      ]
    : user?.role === 'customer' || !user?.role
      ? [
          { href: dashboardPath, icon: icons.dashboard, label: 'Halaman Utama' },
          { href: '/my-tickets', icon: icons.ticket, label: 'Tiket Saya' },
          { href: '/wishlist', icon: icons.bookmark, label: 'Disimpan' },
          { href: '/orders', icon: icons.orders, label: 'Riwayat Pembelian' },
          { href: '/profile', icon: icons.user, label: 'Profil Saya' },
          { href: '/settings', icon: icons.settings, label: 'Pengaturan' },
        ]
      : [
          { href: dashboardPath, icon: icons.dashboard, label: 'Halaman Utama' },
          { href: '/profile', icon: icons.user, label: 'Profil Saya' },
          { href: '/settings', icon: icons.settings, label: 'Pengaturan' },
        ];

  const isLandingPage = pathname === '/' || pathname === '/landing';
  const displayName = user?.name ? user.name.split(' ')[0] : (user ? user.name : 'Pengguna');

  const getRoleLabel = () => {
    if (!user) return 'Penonton';
    switch (user.role) {
      case 'organizer': return 'Event Organizer';
      case 'admin': return 'Admin';
      case 'super_admin': return 'Super Admin';
      default: return 'Penonton';
    }
  };

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 flex items-center ${ isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-black' }`} >
      <div className="container mx-auto px-6 flex items-center justify-between w-full">
        <div className="flex items-center space-x-6">
          <Link href={isLandingPage ? '#top' : '/'} className="flex items-center">
            <div className="relative -top-4 -left-7 w-44 h-16 flex items-center overflow-visible">
              <Image src="/icons/showtime.png" alt="SHOWTIME Logo" width={210} height={70} style={{ objectFit: 'contain', cursor: 'pointer', maxWidth: 'none' }} className="absolute left-0 -top-3" priority />
            </div>
          </Link>

          <div className="hidden md:flex items-center mt-3 px-4 py-1 rounded-xl border border-[#B900A3]/60 bg-[#6D19B0]/10 text-[#e040fb] text-xs font-medium tracking-wide shadow-[0_0_15px_rgba(185,0,163,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#e040fb] mr-2 animate-pulse shadow-[0_0_6px_#e040fb]"></span>
            {getRoleLabel()}
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-5">

          {authLoading ? null : user ? (
            <div className="relative navbar-profile-dropdown">
              <button type="button" aria-label="Buka menu profil" aria-expanded={isProfileOpen} onClick={(event) => { event.stopPropagation(); setIsProfileOpen(!isProfileOpen); }} className="flex items-center gap-3.5 py-1 rounded-full transition-colors group focus:outline-none cursor-pointer" >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md overflow-hidden" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
                  {icons.user}
                </div>
                
                <span className="text-sm font-normal text-white"> {displayName} </span>

                <div className={`w-4 h-4 flex items-center justify-center transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`}>
                  {icons.chevronDown}
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-black/85 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-[#6F6D74] z-50">
                  <div className="px-4 py-3 border-b border-[#6F6D74]">
                    <p className="font-bold text-xs text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                  </div>

                  <div className="p-2 space-y-1 max-h-[75vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {profileMenu.map((item, idx) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link key={idx} href={item.href} onClick={() => setIsProfileOpen(false)} className={`relative flex items-center gap-3 px-3 py-2.5 text-xs transition-colors rounded-xl overflow-hidden ${ isActive ? 'bg-[#6D19B0]/40 text-white font-medium' : 'hover:bg-white/5 text-zinc-300 hover:text-white' }`} >
                          {isActive && (
                            <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full"
                              style={{ background: 'linear-gradient(to bottom, #8138E8, #F73BE1)' }}
                            />
                          )}
                          <span className={isActive ? 'ml-1.5' : ''}>{item.icon}</span>
                          <span className={isActive ? 'ml-0.5' : ''}>{item.label}</span>
                        </Link>
                      );
                    })}

                    <div className="border-t border-[#6F6D74] pt-1 mt-1">
                      <button type="button" onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/10 w-full transition-colors text-left font-medium rounded-xl" >
                        {icons.logout}
                        <span>Keluar Akun</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="px-4 py-1.5 text-sm text-white hover:text-[#e040fb] transition-colors">
                Login
              </Link>
              <Link href="/registrasi" className="px-4 py-1.5 text-sm rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }} >
                Register
              </Link>
            </div>
          )}
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Toggle mobile menu" >
          {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-black/95 border-t border-white/10 px-6 py-4 space-y-2 z-50 shadow-2xl max-h-[85vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="px-3 py-1 rounded-full border border-[#B900A3]/50 bg-[#6D19B0]/20 text-[#e040fb] text-xs font-medium">
              {getRoleLabel()}
            </span>
            {!authLoading && user && <NotificationBell />}
          </div>

          {!authLoading && user ? (
            <>
              {profileMenu.map((item, idx) => (
                <Link key={idx} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-zinc-300 hover:bg-white/10 hover:text-white" >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
              <button type="button" onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left" >
                {icons.logout}
                <span>Keluar Akun</span>
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link href="/login" className="text-center py-2.5 rounded-xl border border-white/20 text-white text-sm">
                Login
              </Link>
              <Link href="/registrasi" className="text-center py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }} >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.nav>
  );
};

export default NavbarEO;