// src/app/admin/organizers/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEye, 
  FaSpinner
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function AdminOrganizersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [organizers, setOrganizers] = useState([]);
  const [loadingOrganizers, setLoadingOrganizers] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'super_admin') {
      fetchOrganizers();
    }
  }, [user, loading, router]);

  const fetchOrganizers = async () => {
    try {
      setLoadingOrganizers(true);
      const response = await api.get('/super-admin/organizers');
      if (response.data.success) {
        setOrganizers(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data organizer');
    } finally {
      setLoadingOrganizers(false);
    }
  };

  const handleVerifyOrganizer = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin memverifikasi organizer ini?')) return;
    try {
      const response = await api.put(`/super-admin/organizers/${userId}/verify`);
      if (response.data.success) {
        toast.success('Organizer berhasil diverifikasi!');
        fetchOrganizers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memverifikasi organizer');
    }
  };

  const handleRejectOrganizer = async (userId) => {
    const reason = prompt('Masukkan alasan penolakan:');
    if (reason === null) return;
    if (!reason.trim()) {
      toast.error('Alasan penolakan wajib diisi');
      return;
    }
    try {
      const response = await api.put(`/super-admin/organizers/${userId}/reject`, {
        reason: reason.trim()
      });
      if (response.data.success) {
        toast.success('Organizer ditolak');
        fetchOrganizers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menolak organizer');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return { color: 'text-green-300 bg-green-500/20 border-green-500/30', icon: FaCheckCircle };
      case 'pending':
        return { color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30', icon: FaClock };
      default:
        return { color: 'text-red-300 bg-red-500/20 border-red-500/30', icon: FaTimesCircle };
    }
  };

  if (loading || loadingOrganizers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat verifikasi organizer...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <NavbarAdmin />

      <main className="ml-64 p-8 max-w-7xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-8 bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Verification Center</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Verify Organizers</h1>
            <p className="text-xs text-white/60 mt-0.5">Tinjau dan setujui pendaftaran Event Organizer baru.</p>
          </div>
        </div>

        <div className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl text-xs">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b border-white/10 text-white/60">
                <tr className="text-left font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {organizers.map((organizer) => {
                  const statusBadge = getStatusBadge(organizer.verificationStatus);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={organizer.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{organizer.companyName}</td>
                      <td className="px-6 py-4 text-white/70">{organizer.user?.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wider w-max ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 text-white" />
                          <span>{organizer.verificationStatus}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {organizer.verificationStatus === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleVerifyOrganizer(organizer.userId)}
                                className="px-3 py-1.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-xl text-[11px] font-bold hover:bg-green-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <FaCheckCircle className="w-3 h-3 text-white" />
                                <span>Approve</span>
                              </button>
                              <button 
                                onClick={() => handleRejectOrganizer(organizer.userId)}
                                className="px-3 py-1.5 bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-[11px] font-bold hover:bg-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <FaTimesCircle className="w-3 h-3 text-white" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!organizers.length && (
                  <tr><td colSpan="4" className="px-6 py-12 text-center text-white/50">Belum ada organizer yang memerlukan verifikasi.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}