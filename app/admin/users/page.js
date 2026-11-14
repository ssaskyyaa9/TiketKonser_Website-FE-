// src/app/admin/users/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarAdmin from '../../../components/NavbarAdmin';
import { 
  FaUsers, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEye, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
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

export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');

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
      fetchUsers();
    }
  }, [user, loading, router]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/super-admin/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal memuat data pengguna');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleToggleUserStatus = async (userItem) => {
    const status = userItem.status === 'blocked' ? 'active' : 'blocked';
    try {
      const response = await api.put(`/super-admin/users/${userItem.id}`, {
        name: userItem.name,
        email: userItem.email,
        phone: userItem.phone,
        role: userItem.role,
        status,
      });
      if (response.data.success) {
        toast.success(status === 'blocked' ? 'Akun berhasil diblokir' : 'Blokir akun dibuka');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memperbarui akun');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Hapus akun pengguna ini?')) return;
    try {
      const response = await api.delete(`/super-admin/users/${userId}`);
      if (response.data.success) {
        toast.success('Akun pengguna berhasil dihapus');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal menghapus akun');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { color: 'text-green-300 bg-green-500/20 border-green-500/30', icon: FaCheckCircle };
      case 'pending':
        return { color: 'text-yellow-300 bg-yellow-500/20 border-yellow-500/30', icon: FaClock };
      default:
        return { color: 'text-red-300 bg-red-500/20 border-red-500/30', icon: FaTimesCircle };
    }
  };

  const filteredUsers = users.filter((userItem) => {
    const query = userSearch.trim().toLowerCase();
    return !query || [userItem.name, userItem.email, userItem.role, userItem.status]
      .some((value) => String(value || '').toLowerCase().includes(query));
  });

  if (loading || loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat pengguna...</p>
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-[#120d1d] border border-white/15 p-6 rounded-2xl shadow-xl">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">User Management</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Manage Users</h1>
            <p className="text-xs text-white/60 mt-0.5">Kelola seluruh akun pengguna terdaftar pada platform.</p>
          </div>
          
          <div className="relative w-full md:w-72">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-3.5 h-3.5" />
            <input
              type="text" 
              placeholder="Cari nama, email, role..." 
              className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner"
              value={userSearch}
              onChange={(event) => setUserSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl text-xs">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black/40 border-b border-white/10 text-white/60">
                <tr className="text-left font-bold uppercase tracking-wider text-[10px]">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((userItem) => {
                  const statusBadge = getStatusBadge(userItem.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <tr key={userItem.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{userItem.name}</td>
                      <td className="px-6 py-4 text-white/70">{userItem.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/40 border border-white/15 text-[#D8B4FE]">
                          {userItem.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 uppercase tracking-wider w-max ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 text-white" />
                          <span>{userItem.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserStatus(userItem)}
                            title={userItem.status === 'blocked' ? 'Unblock user' : 'Block user'}
                            disabled={userItem.role === 'super_admin'}
                            className="p-2 bg-black/40 border border-white/15 rounded-xl hover:border-[#8B5CF6] text-white transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <FaEdit className="w-3.5 h-3.5 text-white" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            title="Delete user"
                            disabled={userItem.role === 'super_admin'}
                            className="p-2 bg-black/40 border border-white/15 rounded-xl hover:border-red-500/50 text-white transition-colors disabled:opacity-40 cursor-pointer"
                          >
                            <FaTrash className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filteredUsers.length && (
                  <tr><td colSpan="5" className="px-6 py-12 text-center text-white/50">Tidak ada pengguna yang ditemukan.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}