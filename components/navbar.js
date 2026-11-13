'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';
import NotificationBell from './notificationbell';

const Navbar = () => {
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

  const profileMenu = user?.role === 'customer' || !user?.role
    ? [
        { href: dashboardPath, icon: '/icons/dashboard.png', label: 'Halaman Utama' },
        { href: '/my-tickets', icon: '/icons/ticket.png', label: 'Tiket Saya' },
        { href: '/wishlist', icon: '/icons/bookmark.png', label: 'Disimpan' },
        { href: '/orders', icon: '/icons/agreement.png', label: 'Riwayat Pembelian' },
        { href: '/profile', icon: '/icons/user.png', label: 'Profil Saya' },
        { href: '/settings', icon: '/icons/setting.png', label: 'Pengaturan' },
      ]
    : [
        { href: dashboardPath, icon: '/icons/dashboard.png', label: 'Halaman Utama' },
        { href: '/profile', icon: '/icons/user.png', label: 'Profil Saya' },
        { href: '/settings', icon: '/icons/setting.png', label: 'Pengaturan' },
      ];

  const isLandingPage = pathname === '/';
  const displayName = user?.name ? user.name.split(' ')[0] : (user ? user.name : 'Pengguna');

  const getRoleLabel = () => {
    if (!user) return 'Penonton';
    switch (user.role) {
      case 'organizer': return 'Organizer';
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
          <Link href="/help" className="rounded-full hover:bg-white/10 transition-colors flex items-center justify-center p-1">
            <Image src="/icons/question.png" alt="Help" width={22} height={22} className="object-contain" />
          </Link>

          <div className="flex items-center justify-center text-white">
            <NotificationBell />
          </div>

          {authLoading ? null : user ? (
            <>
              <div className="relative navbar-profile-dropdown">
                <button type="button" aria-label="Open profile menu" aria-expanded={isProfileOpen} onClick={(event) => { event.stopPropagation(); setIsProfileOpen(!isProfileOpen); }} className="flex items-center gap-5 py-1 rounded-full transition-colors group focus:outline-none cursor-pointer" >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-md overflow-hidden" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
                    <Image src="/icons/user.png" alt="User Icon" width={16} height={16} className="object-contain filter brightness-200" />
                  </div>
                  
                  <span className="text-sm font-normal text-white"> {displayName} </span>

                  <div className="w-4 h-4 flex items-center justify-center ml-0.5">
                    <Image src="/icons/down.png" alt="Toggle Dropdown" width={14} height={14} className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-60 bg-black/75 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border border-[#6F6D74] z-50">
                    <div className="px-4 py-3 border-b border-[#6F6D74]">
                      <p className="font-bold text-xs text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="p-2 space-y-1">
                      {profileMenu.map((item, idx) => {
                        const isActive = pathname === item.href;
                        return (
                          <Link key={idx} href={item.href} onClick={() => setIsProfileOpen(false)} className={`relative flex items-center gap-3 px-3 py-2.5 text-xs transition-colors rounded-xl overflow-hidden ${ isActive ? 'bg-[#6D19B0]/40 text-white font-medium' : 'hover:bg-white/5 text-zinc-300 hover:text-white' }`} >
                            {isActive && (
                              <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full"
                                style={{ background: 'linear-gradient(to bottom, #8138E8, #F73BE1)' }}
                              />
                            )}
                            <Image src={item.icon} alt={item.label} width={16} height={16} className={`object-contain shrink-0 opacity-85 ${isActive ? 'ml-1.5' : ''}`} />
                            <span className={isActive ? 'ml-0.5' : ''}>{item.label}</span>
                          </Link>
                        );
                      })}

                      <div className="border-t border-[#6F6D74] pt-1 mt-1">
                        <button type="button" onClick={logout} className="flex items-center gap-3 px-3 py-2.5 text-xs text-red-500 hover:bg-red-500/10 w-full transition-colors text-left font-medium rounded-xl" >
                          <Image src="/icons/logout.png" alt="Logout" width={16} height={16} className="object-contain shrink-0" />
                          <span>Keluar Akun</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-3">
              <Link href="/login" className="px-4 py-1.5 text-sm text-white hover:text-[#e040fb] transition-colors">
                Login
              </Link>
              <Link href="/register" className="px-4 py-1.5 text-sm rounded-full text-white font-medium shadow-lg hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }} >
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
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-black/95 border-t border-white/10 px-6 py-4 space-y-3 z-50 shadow-2xl">
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
                  <Image src={item.icon} alt={item.label} width={16} height={16} className="object-contain opacity-80" />
                  {item.label}
                </Link>
              ))}
              <button type="button" onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left" >
                <Image src="/icons/logout.png" alt="Logout" width={16} height={16} className="object-contain" />
                Keluar Akun
              </button>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <Link href="/login" className="text-center py-2.5 rounded-xl border border-white/20 text-white text-sm">
                Login
              </Link>
              
              <Link href="/register" className="text-center py-2.5 rounded-xl text-white text-sm font-medium" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }} >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </motion.nav>
  );
};

export default Navbar;