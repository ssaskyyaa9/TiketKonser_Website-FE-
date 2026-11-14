// src/app/organizer/promos/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSpinner, 
  FaSearch, 
  FaGift,
  FaCheckCircle,
  FaTimesCircle,
  FaTag,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default function PromoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [promos, setPromos] = useState([]);
  const [loadingPromos, setLoadingPromos] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Form State
  const [showModal, setShowModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'voucher',
    value: '',
    discountType: 'percentage',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    maxUses: '',
    perUserLimit: '1'
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }
    if (user && user.role === 'organizer') {
      fetchPromos();
    }
  }, [user, loading, router]);

  const fetchPromos = async () => {
    try {
      setLoadingPromos(true);
      const response = await api.get('/organizer/promos');
      if (response.data.success) {
        setPromos(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching promos:', error);
      toast.error('Gagal memuat promo');
    } finally {
      setLoadingPromos(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        perUserLimit: parseInt(formData.perUserLimit)
      };

      let response;
      if (editingPromo) {
        response = await api.put(`/organizer/promos/${editingPromo.id}`, payload);
      } else {
        response = await api.post('/organizer/promos', payload);
      }

      if (response.data.success) {
        toast.success(editingPromo ? 'Promo berhasil diupdate!' : 'Promo berhasil dibuat!');
        setShowModal(false);
        setEditingPromo(null);
        setFormData({ 
          code: '', 
          name: '', 
          description: '', 
          type: 'voucher', 
          value: '', 
          discountType: 'percentage', 
          minPurchase: '', 
          maxDiscount: '', 
          startDate: '', 
          endDate: '', 
          maxUses: '', 
          perUserLimit: '1' 
        });
        fetchPromos();
      }
    } catch (error) {
      console.error('Error saving promo:', error);
      toast.error(error.response?.data?.message || 'Gagal menyimpan promo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus promo ini?')) return;
    try {
      await api.delete(`/organizer/promos/${id}`);
      toast.success('Promo berhasil dihapus!');
      fetchPromos();
    } catch (error) {
      console.error('Error deleting promo:', error);
      toast.error('Gagal menghapus promo');
    }
  };

  // Filter promo berdasarkan pencarian kode atau nama
  const filteredPromos = promos.filter(promo => {
    const code = promo.code?.toLowerCase() || '';
    const name = promo.name?.toLowerCase() || '';
    return code.includes(searchTerm.toLowerCase()) || name.includes(searchTerm.toLowerCase());
  });

  if (loading || loadingPromos) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat promo...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'organizer') return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Marketing & Discounts</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Promo & Vouchers</h1>
            <p className="text-xs text-white/60 mt-1">Buat kode voucher, atur batas penggunaan, dan kelola periode promosi tiket konser.</p>
          </div>
          
          <button 
            onClick={() => {
              setEditingPromo(null);
              setFormData({ 
                code: '', 
                name: '', 
                description: '', 
                type: 'voucher', 
                value: '', 
                discountType: 'percentage', 
                minPurchase: '', 
                maxDiscount: '', 
                startDate: '', 
                endDate: '', 
                maxUses: '', 
                perUserLimit: '1' 
              });
              setShowModal(true);
            }}
            className="rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaPlus className="w-3.5 h-3.5 text-white" />
            <span>Create Promo</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-md">
          <div className="relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan kode promo atau nama..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Promos Grid */}
        {filteredPromos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPromos.map((promo) => (
              <div key={promo.id} className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 rounded-2xl p-6 transition-all shadow-xl flex flex-col justify-between group">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-[#D8B4FE] tracking-wide font-mono">{promo.code}</h3>
                      <p className="text-xs text-white/70 font-semibold mt-0.5">{promo.name}</p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      promo.status === 'active' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {promo.status === 'active' ? (
                        <span className="flex items-center gap-1"><FaCheckCircle className="w-3 h-3 text-white" /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1"><FaTimesCircle className="w-3 h-3 text-white" /> Inactive</span>
                      )}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-xs pt-3 border-t border-white/10">
                    <div className="flex justify-between">
                      <span className="text-white/60">Type</span>
                      <span className="capitalize font-semibold text-white">{promo.type} · {promo.discountType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Value</span>
                      <span className="font-extrabold text-[#D8B4FE]">
                        {promo.discountType === 'percentage' ? `${promo.value}%` : `Rp ${Number(promo.value || 0).toLocaleString('id-ID')}`}
                      </span>
                    </div>
                    {promo.minPurchase && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Min. Pembelian</span>
                        <span className="text-white">Rp {Number(promo.minPurchase).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/60">Periode</span>
                      <span className="text-white/80">{promo.startDate?.split('T')[0]} s/d {promo.endDate?.split('T')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Penggunaan</span>
                      <span className="text-yellow-300 font-bold">{promo.usedCount || 0} / {promo.maxUses || '∞'}</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 bg-black/40 rounded-full mt-4 overflow-hidden border border-white/10">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)',
                        width: `${promo.maxUses ? Math.min(100, ((promo.usedCount || 0) / promo.maxUses) * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/10">
                  <button 
                    onClick={() => {
                      setEditingPromo(promo);
                      setFormData({
                        code: promo.code || '',
                        name: promo.name || '',
                        description: promo.description || '',
                        type: promo.type || 'voucher',
                        value: promo.value || '',
                        discountType: promo.discountType || 'percentage',
                        minPurchase: promo.minPurchase || '',
                        maxDiscount: promo.maxDiscount || '',
                        startDate: promo.startDate?.split('T')[0] || '',
                        endDate: promo.endDate?.split('T')[0] || '',
                        maxUses: promo.maxUses || '',
                        perUserLimit: promo.perUserLimit || '1'
                      });
                      setShowModal(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <FaEdit className="w-3.5 h-3.5 text-white" />
                    <span>Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(promo.id)}
                    className="py-2.5 px-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-red-500/50 text-xs font-semibold text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Hapus Promo"
                  >
                    <FaTrash className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#120d1d] border border-white/15 p-14 rounded-2xl text-center shadow-xl">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/10"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaGift className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Belum Ada Promo</h3>
            <p className="text-xs text-white/60 mb-6 max-w-md mx-auto">
              Buat kode promo atau voucher diskon untuk menarik lebih banyak pembeli tiket konser Anda.
            </p>
            <button 
              onClick={() => {
                setEditingPromo(null);
                setFormData({ 
                  code: '', 
                  name: '', 
                  description: '', 
                  type: 'voucher', 
                  value: '', 
                  discountType: 'percentage', 
                  minPurchase: '', 
                  maxDiscount: '', 
                  startDate: '', 
                  endDate: '', 
                  maxUses: '', 
                  perUserLimit: '1' 
                });
                setShowModal(true);
              }}
              className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaPlus className="w-3.5 h-3.5 text-white" />
              <span>Create Promo</span>
            </button>
          </div>
        )}

      </main>

      {/* Modal Create / Edit Promo */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d1d] border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-2xl shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6D19B0]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-white">
                  <FaTag className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">
                  {editingPromo ? 'Edit Promo / Voucher' : 'Create New Promo'}
                </h2>
              </div>
              <button 
                onClick={() => setShowModal(false)} 
                className="w-7 h-7 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Promo Code <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all font-mono uppercase"
                    placeholder="Contoh: SUMMER20"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Promo Name <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    placeholder="Contoh: Diskon Musim Panas"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                  rows="2"
                  placeholder="Deskripsi atau ketentuan promo..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Type <span className="text-[#D8B4FE]">*</span></label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="voucher">Voucher</option>
                    <option value="discount">Discount</option>
                    <option value="flash_sale">Flash Sale</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Calculation <span className="text-[#D8B4FE]">*</span></label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                    required
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rp)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Value <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    placeholder={formData.discountType === 'percentage' ? 'Contoh: 20' : 'Contoh: 50000'}
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Min. Purchase (Rp)</label>
                  <input
                    type="number"
                    value={formData.minPurchase || ''}
                    onChange={(e) => setFormData({...formData, minPurchase: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    placeholder="Contoh: 100000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Max. Discount (Rp)</label>
                  <input
                    type="number"
                    value={formData.maxDiscount || ''}
                    onChange={(e) => setFormData({...formData, maxDiscount: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    placeholder="Contoh: 50000"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Start Date <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">End Date <span className="text-[#D8B4FE]">*</span></label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Max. Uses (Batas Kuota)</label>
                  <input
                    type="number"
                    value={formData.maxUses || ''}
                    onChange={(e) => setFormData({...formData, maxUses: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                    placeholder="Kosongkan jika tanpa batas"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-white/80 mb-1.5">Per User Limit</label>
                  <input
                    type="number"
                    value={formData.perUserLimit || 1}
                    onChange={(e) => setFormData({...formData, perUserLimit: e.target.value})}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading} 
                  className="flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {formLoading ? (
                    <>
                      <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingPromo ? 'Update Promo' : 'Create Promo'}</span>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}