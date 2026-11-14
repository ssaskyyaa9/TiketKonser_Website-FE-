// src/app/organizer/gallery/page.js
'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../components/navbarEO';
import { 
  FaImage, 
  FaUpload, 
  FaTrash, 
  FaEye, 
  FaSpinner, 
  FaSearch, 
  FaPhotoVideo,
  FaTimes
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getMediaUrl } from '../../../lib/media-url';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
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

export default function OrganizerGalleryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [galleryImages, setGalleryImages] = useState([]);
  const [concerts, setConcerts] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [selectedConcertFilter, setSelectedConcertFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal & Upload Form State
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryForm, setGalleryForm] = useState({
    concertId: '',
    caption: '',
    type: 'photo',
    image: null
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
      fetchConcerts();
      fetchGallery();
    }
  }, [user, loading, router]);

  const fetchConcerts = async () => {
    try {
      const response = await api.get('/organizer/concerts');
      if (response.data.success) {
        setConcerts(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching concerts:', error);
    }
  };

  const fetchGallery = async () => {
    try {
      setLoadingGallery(true);
      const response = await api.get('/organizer/gallery');
      if (response.data.success) {
        setGalleryImages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      toast.error('Gagal memuat galeri');
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    
    if (!galleryForm.concertId || galleryForm.concertId === '' || galleryForm.concertId === 'undefined') {
      toast.error('Pilih konser terlebih dahulu');
      return;
    }
    
    if (!galleryForm.image) {
      toast.error('Pilih gambar terlebih dahulu');
      return;
    }

    setUploadingGallery(true);
    try {
      const formData = new FormData();
      formData.append('concertId', galleryForm.concertId);
      formData.append('caption', galleryForm.caption || '');
      formData.append('type', galleryForm.type || 'photo');
      formData.append('image', galleryForm.image);

      const response = await api.post('/organizer/gallery', formData);

      if (response.data.success) {
        toast.success('Gambar berhasil diupload!');
        setShowGalleryModal(false);
        setGalleryForm({ concertId: '', caption: '', type: 'photo', image: null });
        fetchGallery();
      }
    } catch (error) {
      console.error('Error uploading gallery:', error);
      toast.error(error.response?.data?.message || 'Gagal upload gambar');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return;
    try {
      await api.delete(`/organizer/gallery/${id}`);
      toast.success('Gambar berhasil dihapus!');
      fetchGallery();
    } catch (error) {
      console.error('Error deleting gallery:', error);
      toast.error('Gagal menghapus gambar');
    }
  };

  // Filter galeri berdasarkan teks pencarian & dropdown konser
  const filteredGallery = galleryImages.filter(img => {
    const caption = img.caption?.toLowerCase() || '';
    const type = img.type?.toLowerCase() || '';
    const concertName = img.concert?.name?.toLowerCase() || '';
    
    const matchesSearch = caption.includes(searchTerm.toLowerCase()) || 
                          type.includes(searchTerm.toLowerCase()) ||
                          concertName.includes(searchTerm.toLowerCase());
    
    const imgConcertId = img.concertId || img.concert?.id;
    const matchesConcert = !selectedConcertFilter || String(imgConcertId) === String(selectedConcertFilter);

    return matchesSearch && matchesConcert;
  });

  if (loading || (loadingGallery && concerts.length === 0)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin mx-auto" />
          <p className="mt-4 text-xs text-white/60">Memuat galeri...</p>
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
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Media & Asset</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">Concert Gallery</h1>
            <p className="text-xs text-white/60 mt-1">Upload dan kelola poster, banner, serta dokumentasi foto konser Anda.</p>
          </div>
          
          <button 
            onClick={() => {
              setGalleryForm({ concertId: concerts[0]?.id || '', caption: '', type: 'photo', image: null });
              setShowGalleryModal(true);
            }}
            className="rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 shrink-0 cursor-pointer"
            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
          >
            <FaUpload className="w-3.5 h-3.5 text-white" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white w-3.5 h-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari caption, tipe (photo/poster/banner), atau konser..."
              className="w-full pl-11 pr-4 py-2.5 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner"
            />
          </div>

          <div className="w-full sm:w-72">
            <select
              value={selectedConcertFilter}
              onChange={(e) => setSelectedConcertFilter(e.target.value)}
              className="w-full py-2.5 px-4 bg-[#120d1d] border border-white/15 rounded-xl text-xs text-white focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner cursor-pointer"
            >
              <option value="">Semua Konser (All Concerts)</option>
              {concerts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Gallery Grid */}
        {loadingGallery ? (
          <div className="flex justify-center py-16">
            <FaSpinner className="w-8 h-8 text-[#8B5CF6] animate-spin" />
          </div>
        ) : filteredGallery.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGallery.map((image) => (
              <div key={image.id} className="bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6]/60 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group">
                <div>
                  <div className="relative aspect-square bg-black/40 overflow-hidden border-b border-white/10">
                    <Image
                      src={getMediaUrl(image.image)}
                      alt={image.caption || `${image.type} konser`}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white">
                        {image.type || 'photo'}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="font-bold text-sm text-white truncate mb-1">{image.caption || 'No caption'}</p>
                    <p className="text-xs text-[#D8B4FE] truncate flex items-center gap-1.5">
                      <span>🎵</span> {image.concert?.name || 'Konser Umum'}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex gap-2.5 pt-3 border-t border-white/10">
                    <a 
                      href={getMediaUrl(image.image)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-black/40 border border-white/15 hover:border-[#8B5CF6] text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <FaEye className="w-3.5 h-3.5 text-white" />
                      <span>View</span>
                    </a>
                    <button 
                      onClick={() => handleDeleteGallery(image.id)}
                      className="py-2 px-3.5 rounded-xl bg-black/40 border border-white/15 hover:border-red-500/50 text-xs font-semibold text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Hapus Gambar"
                    >
                      <FaTrash className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
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
              <FaImage className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Belum Ada Gambar di Galeri</h3>
            <p className="text-xs text-white/60 mb-6 max-w-md mx-auto">
              Upload poster promosi, banner event, atau dokumentasi foto konser Anda sekarang.
            </p>
            <button 
              onClick={() => {
                setGalleryForm({ concertId: concerts[0]?.id || '', caption: '', type: 'photo', image: null });
                setShowGalleryModal(true);
              }}
              className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 inline-flex items-center gap-2 cursor-pointer"
              style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaUpload className="w-3.5 h-3.5 text-white" />
              <span>Upload Image</span>
            </button>
          </div>
        )}

      </main>

      {/* Modal Upload Gallery */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-[#120d1d] border border-white/20 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl text-xs max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#6D19B0]/30 border border-[#8B5CF6]/40 flex items-center justify-center text-white">
                  <FaPhotoVideo className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">Upload Gallery Image</h2>
              </div>
              <button 
                onClick={() => setShowGalleryModal(false)} 
                className="w-7 h-7 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>

            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-white/80 mb-1.5">
                  Concert <span className="text-[#D8B4FE]">*</span>
                </label>
                <select
                  value={galleryForm.concertId}
                  onChange={(e) => setGalleryForm({...galleryForm, concertId: e.target.value})}
                  className={`w-full rounded-xl border bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer ${!galleryForm.concertId ? 'border-red-500/50' : 'border-white/15'}`}
                  required
                >
                  <option value="">-- Pilih Konser --</option>
                  {concerts && concerts.length > 0 ? (
                    concerts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  ) : (
                    <option value="" disabled>Belum ada konser</option>
                  )}
                </select>
                {!galleryForm.concertId && (
                  <p className="text-red-400 text-[10px] mt-1">⚠️ Silakan pilih konser terlebih dahulu</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">
                  Image File <span className="text-[#D8B4FE]">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setGalleryForm({...galleryForm, image: file});
                    }
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-white file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#6D19B0] file:text-white hover:file:bg-[#5119B0] cursor-pointer"
                  required
                />
                {!galleryForm.image && (
                  <p className="text-red-400 text-[10px] mt-1">⚠️ Silakan pilih file gambar</p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Caption</label>
                <input
                  type="text"
                  value={galleryForm.caption}
                  onChange={(e) => setGalleryForm({...galleryForm, caption: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all"
                  placeholder="Deskripsi atau judul gambar..."
                />
              </div>

              <div>
                <label className="block font-semibold text-white/80 mb-1.5">Type</label>
                <select
                  value={galleryForm.type}
                  onChange={(e) => setGalleryForm({...galleryForm, type: e.target.value})}
                  className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer"
                >
                  <option value="photo">Photo</option>
                  <option value="poster">Poster</option>
                  <option value="banner">Banner</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-white/10 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowGalleryModal(false)} 
                  className="flex-1 rounded-xl border border-white/15 bg-black/40 py-3 text-center font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={uploadingGallery || !galleryForm.concertId || !galleryForm.image} 
                  className={`flex-1 rounded-xl py-3 font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer ${(!galleryForm.concertId || !galleryForm.image) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                >
                  {uploadingGallery ? (
                    <>
                      <FaSpinner className="w-3.5 h-3.5 animate-spin text-white" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Upload Image</span>
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