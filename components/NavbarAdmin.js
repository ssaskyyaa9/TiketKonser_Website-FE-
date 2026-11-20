// src/components/NavbarAdmin.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

export default function NavbarAdmin() {
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

  const icons = {
    dashboard: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    users: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    verify: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    concerts: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
    payments: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    reports: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    analytics: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    settings: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    user: (
      <svg className="w-4 h-4 shrink-0 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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

  const profileMenu = [
    { href: '/admin/dashboard', icon: icons.dashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: icons.users, label: 'Manage Users' },
    { href: '/admin/organizers', icon: icons.verify, label: 'Verify Organizer' },
    { href: '/admin/concerts', icon: icons.concerts, label: 'Manage Konser' },
    { href: '/admin/payments', icon: icons.payments, label: 'Manage Payments' },
    { href: '/admin/reports', icon: icons.reports, label: 'Reports' },
    { href: '/admin/analytics', icon: icons.analytics, label: 'Analytics' },
    { href: '/admin/settings', icon: icons.settings, label: 'System Settings' },
  ];

  const displayName = user?.name ? user.name.split(' ')[0] : (user ? user.name : 'Super Admin');

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 h-16 flex items-center ${ isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-black' }`} >
      <div className="container mx-auto px-6 flex items-center justify-between w-full">
        <div className="flex items-center space-x-6">
          <Link href="/admin/dashboard" className="flex items-center">
            <div className="relative -top-4 -left-7 w-44 h-16 flex items-center overflow-visible">
              <Image src="/icons/showtime.png" alt="SHOWTIME Logo" width={210} height={70} style={{ objectFit: 'contain', cursor: 'pointer', maxWidth: 'none' }} className="absolute left-0 -top-3" priority />
            </div>
          </Link>

          <div className="hidden md:flex items-center mt-3 px-4 py-1 rounded-xl border border-[#B900A3]/60 bg-[#6D19B0]/10 text-[#e040fb] text-xs font-medium tracking-wide shadow-[0_0_15px_rgba(185,0,163,0.15)]">
            <span className="w-2 h-2 rounded-full bg-[#e040fb] mr-2 animate-pulse shadow-[0_0_6px_#e040fb]"></span>
            Super Admin
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
          ) : null}
        </div>

        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-full hover:bg-white/10 transition-colors text-white" aria-label="Toggle mobile menu" >
          {isMobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-black/95 border-t border-white/10 px-6 py-4 space-y-2 z-50 shadow-2xl max-h-[85vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-between pb-2">
            <span className="px-3 py-1 rounded-full border border-[#B900A3]/50 bg-[#6D19B0]/20 text-[#e040fb] text-xs font-medium">
              Super Admin
            </span>
            {!authLoading && user && <NotificationBell />}
          </div>

          {!authLoading && user && (
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
          )}
        </div>
      )}
    </motion.nav>
  );
}