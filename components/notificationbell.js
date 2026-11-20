'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaCheck, FaSpinner, FaTimes, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const formatDate = (date) => new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'short',
  timeStyle: 'short'
}).format(new Date(date));

export default function NotificationBell() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const panelRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyIds, setBusyIds] = useState([]);
  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const fetchNotifications = useCallback(async (showError = false) => {
    if (authLoading || !user) return;

    try {
      setLoading(true);
      const response = await api.get('/users/notifications');
      if (response.data.success) setNotifications(response.data.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      if (showError) toast.error(error.response?.data?.message || 'Gagal memuat notifikasi');
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) return;

    const timeout = setTimeout(() => { void fetchNotifications(true); }, 0);
    const interval = setInterval(() => { void fetchNotifications(); }, 30000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [authLoading, fetchNotifications, user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (notification) => {
    if (notification.isRead) return true;
    try {
      await api.put(`/users/notifications/${notification.id}/read`);
      setNotifications((current) => current.map((item) => (
        item.id === notification.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
      )));
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui notifikasi');
      return false;
    }
  };

  const openNotification = async (notification) => {
    const marked = await markAsRead(notification);
    if (!marked) return;
    if (notification.link) {
      setIsOpen(false);
      router.push(notification.link);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setBusyIds((current) => [...current, notificationId]);
      await api.delete(`/users/notifications/${notificationId}`);
      setNotifications((current) => current.filter((item) => item.id !== notificationId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus notifikasi');
    } finally {
      setBusyIds((current) => current.filter((id) => id !== notificationId));
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button type="button" aria-label={`Notifikasi${unreadCount ? `, ${unreadCount} belum dibaca` : ''}`} aria-expanded={isOpen}
        onClick={() => {
          const nextIsOpen = !isOpen;
          setIsOpen(nextIsOpen);
          if (nextIsOpen) void fetchNotifications(true);
        }}
        className="relative rounded-full p-2.5 hover:bg-transparent flex items-center justify-center cursor-pointer focus:outline-none"
      >

        <Image src="/icons/notification.png" alt="Notification" width={23} height={23} className="object-contain transition cursor-pointer" />
        
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B900A3] px-1 text-[10px] font-bold text-white shadow-[0_0_8px_#B900A3]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section className="absolute right-0 z-[60] mt-3 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-zinc-900/95 backdrop-blur-xl shadow-2xl" style={{ border: '1px solid rgba(185, 0, 163, 0.4)', boxShadow: '0 10px 30px rgba(109, 25, 176, 0.2)' }} >
          <header className="flex items-center justify-between border-b border-[#B900A3]/20 px-4 py-3 bg-black/40">
            <div>
              <h2 className="font-semibold text-sm text-white">Notifikasi</h2>
              <p className="text-xs text-zinc-400">{unreadCount} belum dibaca</p>
            </div>
            <button
              type="button"
              aria-label="Tutup notifikasi"
              onClick={() => setIsOpen(false)}
              className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            >
              <FaTimes className="w-3.5 h-3.5" />
            </button>
          </header>

          <div className="max-h-[min(70vh,28rem)] overflow-y-auto divide-y divide-white/5">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center gap-2 p-8 text-xs text-zinc-400">
                <FaSpinner className="animate-spin text-[#B900A3]" /> Memuat notifikasi...
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-8 text-center text-xs text-zinc-500">Belum ada notifikasi.</p>
            ) : notifications.map((notification) => (
              <article
                key={notification.id}
                className={`flex gap-2 px-3 py-3 transition ${
                  notification.isRead ? 'hover:bg-white/[0.02]' : 'bg-[#6D19B0]/15 hover:bg-[#6D19B0]/25'
                }`}
              >
                <button
                  type="button"
                  onClick={() => void openNotification(notification)}
                  className="min-w-0 flex-1 text-left cursor-pointer"
                >
                  <span className="flex items-start gap-2">
                    {!notification.isRead && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#B900A3] shadow-[0_0_6px_#B900A3]" />
                    )}
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-white">{notification.title}</span>
                      <span className="mt-1 block whitespace-pre-wrap text-[11px] text-zinc-300">{notification.message}</span>
                      <span className="mt-2 block text-[10px] text-zinc-500">{formatDate(notification.createdAt)}</span>
                    </span>
                  </span>
                </button>
                <div className="flex shrink-0 flex-col gap-1 justify-center">
                  {!notification.isRead && (
                    <button
                      type="button"
                      aria-label="Tandai sudah dibaca"
                      title="Tandai sudah dibaca"
                      onClick={() => void markAsRead(notification)}
                      className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-emerald-400 transition cursor-pointer"
                    >
                      <FaCheck className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Hapus notifikasi"
                    title="Hapus notifikasi"
                    disabled={busyIds.includes(notification.id)}
                    onClick={() => void deleteNotification(notification.id)}
                    className="rounded p-1.5 text-zinc-400 hover:bg-white/10 hover:text-red-400 disabled:opacity-40 transition cursor-pointer"
                  >
                    {busyIds.includes(notification.id)
                      ? <FaSpinner className="h-3 w-3 animate-spin text-[#B900A3]" />
                      : <FaTrash className="h-3 w-3" />}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}