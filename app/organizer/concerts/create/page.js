// src/app/organizer/concerts/create/page.js
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import NavbarEO from '../../../../components/navbarEO';
import { 
  FaArrowLeft, 
  FaSpinner, 
  FaCheckCircle,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaStar,
  FaBolt,
  FaTrash,
  FaPlus,
  FaArrowRight,
  FaLayerGroup,
  FaCheck
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
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const normalizeRupiah = (rawValue) => {
  if (rawValue === '' || rawValue === null || rawValue === undefined) return 0;
  const cleaned = String(rawValue).replace(/[^\d.-]/g, '');
  const parsed = Number(cleaned);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  // Jika user mengetik angka satuan ribuan singkat seperti "175", konversi ke 175.000
  if (parsed > 0 && parsed < 1000) {
    return parsed * 1000;
  }
  return Math.round(parsed);
};

const formatRupiah = (amount) => {
  const numeric = normalizeRupiah(amount);
  return `Rp ${numeric.toLocaleString('id-ID')}`;
};

const VENUE_TYPES = {
  stadium: {
    id: 'stadium',
    name: 'Stadium',
    description: 'Melingkar/oval seperti stadion, tribun mengelilingi area panggung/lapangan',
    features: ['Tribun melingkar', 'Stage di salah satu sisi', 'Kapasitas besar', 'Akustik outdoor'],
    layout: 'stadium',
  },
  hall: {
    id: 'hall',
    name: 'Concert Hall',
    description: 'Persegi/persegi panjang seperti gedung konser indoor, kursi tersusun dalam barisan rapi menghadap panggung',
    features: ['Layout teratur', 'Stage di depan', 'Akustik terbaik', 'Kapasitas sedang-besar'],
    layout: 'hall',
  },
  outdoor: {
    id: 'outdoor',
    name: 'Outdoor Festival',
    description: 'Area terbuka fleksibel dengan kombinasi standing dan seating area, cocok untuk festival',
    features: ['Area terbuka', 'Standing & Seating', 'Fleksibel', 'Kapasitas besar'],
    layout: 'outdoor',
  },
  arena: {
    id: 'arena',
    name: 'Arena',
    description: 'Oval/bulat seperti arena indoor, seating area mengelilingi central stage atau stage di salah satu sisi',
    features: ['Seating mengelilingi', 'Stage tengah/samping', 'Intim', 'Kapasitas sedang'],
    layout: 'arena',
  }
};

export default function CreateConcertPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState({
    venueType: '',
    venueName: '',
    city: '',
    address: '',
    capacity: '',
    name: '',
    description: '',
    date: '',
    time: '',
    startSale: '',
    endSale: '',
    genre: '',
    minPrice: '',
    maxPrice: '',
    totalTickets: '',
    rules: '',
    youtubeTrailer: '',
    isFeatured: false,
    isFlashSale: false,
    flashSalePrice: '',
    flashSaleEnd: '',
    sections: []
  });
  
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [selectedVenueType, setSelectedVenueType] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user && user.role !== 'organizer') {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, router]);

  const handleVenueTypeSelect = (typeId) => {
    const venueType = VENUE_TYPES[typeId];
    setSelectedVenueType(venueType);
    setFormData((previous) => ({ ...previous, venueType: typeId, sections: [] }));
    setCurrentStep(2);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSectionChange = (index, field, value) => {
    const updatedSections = [...formData.sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setFormData({ ...formData, sections: updatedSections });
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      name: `Section ${String.fromCharCode(65 + formData.sections.length)}`,
      category: 'regular',
      type: 'seated',
      rows: '',
      seatsPerRow: '',
      capacity: '',
      price: ''
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
  };

  const removeSection = (index) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    setFormData({ ...formData, sections: updatedSections });
  };

  const calculatedTotalTickets = formData.sections.reduce((total, s) => {
    if (s.type === 'standing') return total + (parseInt(s.capacity, 10) || 0);
    return total + (parseInt(s.rows, 10) || 0) * (parseInt(s.seatsPerRow, 10) || 0);
  }, 0);

  const normalizedSectionPrices = formData.sections.map((section) =>
    normalizeRupiah(section.price)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      if (!formData.name || formData.name.trim() === '') {
        toast.error('Nama konser wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.date) {
        toast.error('Tanggal konser wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.time) {
        toast.error('Waktu konser wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.venueType) {
        toast.error('Venue type wajib dipilih');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.venueName || formData.venueName.trim() === '') {
        toast.error('Nama venue wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.city || formData.city.trim() === '') {
        toast.error('Kota venue wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.address || formData.address.trim() === '') {
        toast.error('Alamat venue wajib diisi');
        setLoadingSubmit(false);
        return;
      }
      if (!formData.sections.length) {
        toast.error('Tambahkan minimal satu section tiket');
        setLoadingSubmit(false);
        return;
      }

      let totalTickets = 0;
      const preparedSections = formData.sections.map((section) => {
        const price = normalizeRupiah(section.price);
        if (!section.name || !section.name.trim() || !Number.isFinite(price) || price < 0) {
          throw new Error('Nama, kategori, dan harga section harus valid');
        }

        if (section.type === 'standing') {
          const capacity = Number(section.capacity);
          if (!Number.isInteger(capacity) || capacity < 1) {
            throw new Error('Kapasitas standing harus lebih dari 0');
          }
          totalTickets += capacity;
          return {
            ...section,
            capacity,
            price,
          };
        }

        const rows = Number(section.rows);
        const seatsPerRow = Number(section.seatsPerRow);
        if (!Number.isInteger(rows) || rows < 1 || !Number.isInteger(seatsPerRow) || seatsPerRow < 1) {
          throw new Error('Rows dan seats per row harus lebih dari 0');
        }
        totalTickets += rows * seatsPerRow;
        return {
          ...section,
          rows,
          seatsPerRow,
          price,
        };
      });

      if (!totalTickets) throw new Error('Kapasitas tiket harus lebih dari 0');

      const sectionPrices = preparedSections.map((section) => section.price);
      const minPrice = sectionPrices.length > 0 ? Math.min(...sectionPrices) : 0;
      const maxPrice = sectionPrices.length > 0 ? Math.max(...sectionPrices) : 0;
      const flashSalePrice = formData.isFlashSale
        ? normalizeRupiah(formData.flashSalePrice)
        : null;

      const payload = {
        name: formData.name.trim(),
        description: formData.description || '',
        date: formData.date,
        time: formData.time,
        startSale: formData.startSale || null,
        endSale: formData.endSale || null,
        venueType: formData.venueType,
        venueName: formData.venueName.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        capacity: totalTickets,
        totalTickets,
        minPrice,
        maxPrice,
        genre: formData.genre || '',
        rules: formData.rules || '',
        youtubeTrailer: formData.youtubeTrailer || '',
        isFeatured: formData.isFeatured || false,
        isFlashSale: formData.isFlashSale || false,
        flashSalePrice,
        flashSaleEnd: formData.flashSaleEnd || null,
        sections: preparedSections,
        status: 'published'
      };

      const response = await api.post('/organizer/concerts', payload);
      
      if (response.data.success) {
        toast.success('Konser berhasil dibuat!');
        router.push('/organizer/dashboard');
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data?.message || 'Gagal membuat konser');
      } else if (error.request) {
        toast.error('Tidak ada response dari server');
      } else {
        toast.error(error.message || 'Gagal membuat konser');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <FaSpinner className="w-12 h-12 text-[#8B5CF6] animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const steps = [
    { number: 1, label: 'Venue Layout' },
    { number: 2, label: 'Venue & Tickets' },
    { number: 3, label: 'Concert Details' }
  ];

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="w-10 h-10 rounded-xl bg-[#120d1d] border border-white/15 hover:border-[#8B5CF6] flex items-center justify-center transition-colors"
            >
              <FaArrowLeft className="w-4 h-4 text-white" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Create New Concert</h1>
              <p className="text-xs text-white/60 mt-0.5">Konfigurasi venue, kategori tiket, dan publikasi konser Anda</p>
            </div>
          </div>

          {/* Step Pills */}
          <div className="flex items-center gap-2 bg-[#120d1d] border border-white/15 p-1.5 rounded-2xl">
            {steps.map((step) => {
              const isActive = currentStep === step.number;
              const isDone = currentStep > step.number;
              return (
                <div
                  key={step.number}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'text-white shadow-md'
                      : isDone
                      ? 'bg-[#6D19B0]/25 text-[#D8B4FE] border border-[#6D19B0]/40'
                      : 'text-white/40'
                  }`}
                  style={isActive ? { background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' } : {}}
                >
                  <span className="w-5 h-5 rounded-full bg-black/30 flex items-center justify-center text-[10px]">
                    {isDone ? <FaCheck className="text-white w-2.5 h-2.5" /> : step.number}
                  </span>
                  <span className="hidden md:inline">{step.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Kolom Kiri: Form Steps */}
          <div className="lg:col-span-8 bg-[#120d1d] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl">
            
            {currentStep === 1 && (
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Step 01 / 03</span>
                  <h2 className="text-xl font-bold text-white mt-1">Pilih Tipe Layout Venue</h2>
                  <p className="text-xs text-white/60 mt-1">
                    Bentuk layout akan menentukan visualisasi peta kursi untuk pembeli tiket.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.values(VENUE_TYPES).map((type) => {
                    const isSelected = formData.venueType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => handleVenueTypeSelect(type.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all relative overflow-hidden group ${
                          isSelected
                            ? 'border-[#A78BFA] bg-[#6D19B0]/20 shadow-lg'
                            : 'border-white/10 hover:border-[#8B5CF6]/60 bg-black/40'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#6D19B0]/30 border border-[#8B5CF6]/40 flex items-center justify-center">
                            <FaBuilding className="w-4 h-4 text-white" />
                          </div>
                          {isSelected && (
                            <span className="px-2.5 py-1 rounded-full bg-[#6D19B0] text-[10px] font-bold text-white flex items-center gap-1">
                              <FaCheckCircle className="text-white w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-[#D8B4FE] transition-colors">{type.name}</h3>
                        <p className="text-xs text-white/60 mt-1.5 leading-relaxed">{type.description}</p>
                        <div className="flex flex-wrap gap-1.5 mt-4">
                          {type.features.map((feature, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white/75">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-5 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.venueType) {
                        toast.error('Pilih tipe venue terlebih dahulu');
                        return;
                      }
                      setCurrentStep(2);
                    }}
                    className="rounded-xl px-6 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    <span>Lanjut ke Detail Venue</span>
                    <FaArrowRight className="text-white w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Step 02 / 03</span>
                  <h2 className="text-xl font-bold text-white mt-1">Detail Venue & Kategori Tiket</h2>
                  <p className="text-xs text-white/60 mt-1">
                    Layout terpilih: <span className="text-[#D8B4FE] font-semibold">{selectedVenueType?.name}</span>
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-white/80 mb-1.5">
                      Nama Venue <span className="text-[#A78BFA]">*</span>
                    </label>
                    <input
                      type="text"
                      name="venueName"
                      value={formData.venueName}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                      placeholder="Contoh: Jakarta International Stadium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-white/80 mb-1.5">
                        Kota <span className="text-[#A78BFA]">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                        placeholder="Contoh: Jakarta"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-white/80 mb-1.5">
                        Estimasi Kapasitas Venue
                      </label>
                      <input
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                        placeholder="Total kapasitas"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-white/80 mb-1.5">
                      Alamat Lengkap <span className="text-[#A78BFA]">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                      rows="2"
                      placeholder="Alamat lengkap lokasi konser"
                      required
                    />
                  </div>

                  <div className="border-t border-white/10 pt-5 mt-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <FaLayerGroup className="text-white" /> Kategori & Section Tiket
                        </h3>
                        <p className="text-[11px] text-white/50">Atur pembagian area penonton dan harga masing-masing tiket</p>
                      </div>
                      <button
                        type="button"
                        onClick={addSection}
                        className="rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:opacity-90 flex items-center gap-1.5"
                        style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                      >
                        <FaPlus className="text-white w-3 h-3" /> Tambah Section
                      </button>
                    </div>

                    {formData.sections.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/20 bg-black/30 p-6 text-center">
                        <p className="text-white/60 text-xs mb-2">Belum ada section tiket yang ditambahkan.</p>
                        <button
                          type="button"
                          onClick={addSection}
                          className="text-xs font-bold text-[#D8B4FE] hover:underline"
                        >
                          + Buat Section Pertama
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {formData.sections.map((section, index) => (
                          <div key={index} className="bg-black/40 border border-white/15 p-4 rounded-xl relative">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                              <div className="sm:col-span-3">
                                <label className="block text-[11px] text-white/60 mb-1">Nama Section</label>
                                <input
                                  type="text"
                                  value={section.name}
                                  onChange={(e) => handleSectionChange(index, 'name', e.target.value)}
                                  className="w-full rounded-lg border border-white/15 bg-[#120d1d] px-3 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                                  placeholder="Section A"
                                />
                              </div>
                              <div className="sm:col-span-3">
                                <label className="block text-[11px] text-white/60 mb-1">Kategori</label>
                                <select
                                  value={section.category}
                                  onChange={(e) => handleSectionChange(index, 'category', e.target.value)}
                                  className="w-full rounded-lg border border-white/15 bg-[#120d1d] px-3 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                                >
                                  <option value="vvip">VVIP</option>
                                  <option value="vip">VIP</option>
                                  <option value="regular">Regular</option>
                                  <option value="platinum">Platinum</option>
                                  <option value="diamond">Diamond</option>
                                </select>
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] text-white/60 mb-1">Tipe</label>
                                <select 
                                  value={section.type} 
                                  onChange={(e) => handleSectionChange(index, 'type', e.target.value)} 
                                  className="w-full rounded-lg border border-white/15 bg-[#120d1d] px-2.5 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                                >
                                  <option value="seated">Seated</option>
                                  <option value="standing">Standing</option>
                                </select>
                              </div>
                              <div className="sm:col-span-4">
                                <label className="block text-[11px] text-white/60 mb-1">
                                  Harga ({formatRupiah(section.price)})
                                </label>
                                <input
                                  type="number"
                                  value={section.price}
                                  onChange={(e) => handleSectionChange(index, 'price', e.target.value)}
                                  className="w-full rounded-lg border border-white/15 bg-[#120d1d] px-3 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                                  placeholder="175000"
                                  min="0"
                                />
                              </div>

                              {section.type === 'standing' ? (
                                <div className="sm:col-span-10">
                                  <label className="block text-[11px] text-white/60 mb-1">Kapasitas Standing</label>
                                  <input
                                    type="number"
                                    value={section.capacity}
                                    onChange={(e) => handleSectionChange(index, 'capacity', e.target.value)}
                                    className="w-full rounded-lg border border-white/15 bg-[#120d1d] px-3 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                                    placeholder="200"
                                    min="0"
                                  />
                                </div>
                              ) : (
                                <>
                                  <div className="sm:col-span-5">
                                    <label className="block text-[11px] text-white/60 mb-1">Jumlah Baris (Rows)</label>
                                    <input
                                      type="number"
                                      value={section.rows}
                                      onChange={(e) => handleSectionChange(index, 'rows', e.target.value)}
                                      className="w-full rounded-lg border border-white/15 bg-[#120d1d] px-3 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                                      placeholder="5"
                                      min="1"
                                    />
                                  </div>
                                  <div className="sm:col-span-5">
                                    <label className="block text-[11px] text-white/60 mb-1">Kursi per Baris</label>
                                    <input
                                      type="number"
                                      value={section.seatsPerRow}
                                      onChange={(e) => handleSectionChange(index, 'seatsPerRow', e.target.value)}
                                      className="w-full rounded-lg border border-white/15 bg-[#120d1d] px-3 py-2 text-xs text-white focus:border-[#8B5CF6] focus:outline-none"
                                      placeholder="10"
                                      min="1"
                                    />
                                  </div>
                                </>
                              )}

                              <div className="sm:col-span-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeSection(index)}
                                  className="w-full py-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 text-white flex items-center justify-center transition-colors"
                                  title="Hapus section"
                                >
                                  <FaTrash className="w-3 h-3 text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-8 pt-5 border-t border-white/10">
                  <button 
                    type="button"
                    onClick={goBack} 
                    className="rounded-xl border border-white/15 bg-black/40 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    ← Kembali
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.venueName || formData.venueName.trim() === '') {
                        toast.error('Nama venue wajib diisi');
                        return;
                      }
                      if (!formData.city || formData.city.trim() === '') {
                        toast.error('Kota venue wajib diisi');
                        return;
                      }
                      if (!formData.address || formData.address.trim() === '') {
                        toast.error('Alamat venue wajib diisi');
                        return;
                      }
                      setCurrentStep(3);
                    }}
                    className="rounded-xl px-6 py-2.5 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    <span>Lanjut ke Info Konser</span>
                    <FaArrowRight className="text-white w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#A78BFA]">Step 03 / 03</span>
                  <h2 className="text-xl font-bold text-white mt-1">Informasi & Jadwal Konser</h2>
                  <p className="text-xs text-white/60 mt-1">
                    Lengkapi detail acara sebelum mempublikasikan konser Anda.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold text-white/80 mb-1.5">
                      Nama Konser <span className="text-[#A78BFA]">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                      placeholder="Contoh: Summer Music Festival 2026"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-white/80 mb-1.5">Deskripsi</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                      rows="3"
                      placeholder="Ceritakan konsep konser, line-up artis, dll..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-white/80 mb-1.5">
                        Tanggal Konser <span className="text-[#A78BFA]">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-white/80 mb-1.5">
                        Waktu Mulai <span className="text-[#A78BFA]">*</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                    <h3 className="font-bold text-white mb-1">Periode Penjualan Tiket</h3>
                    <p className="mb-3 text-[11px] text-white/50">Kosongkan tanggal untuk membuka penjualan tanpa batas waktu.</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-white/70 mb-1">Mulai Penjualan</label>
                        <input
                          type="datetime-local"
                          name="startSale"
                          value={formData.startSale}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-white/15 bg-[#120d1d] px-3.5 py-2 text-white focus:border-[#8B5CF6] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 mb-1">Akhir Penjualan</label>
                        <input
                          type="datetime-local"
                          name="endSale"
                          value={formData.endSale}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-white/15 bg-[#120d1d] px-3.5 py-2 text-white focus:border-[#8B5CF6] focus:outline-none"
                          min={formData.startSale || undefined}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-white/80 mb-1.5">Genre Musik</label>
                      <input
                        type="text"
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                        placeholder="Pop, Rock, Indie, Jazz"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-white/80 mb-1.5">YouTube Trailer URL</label>
                      <input
                        type="url"
                        name="youtubeTrailer"
                        value={formData.youtubeTrailer}
                        onChange={handleInputChange}
                        className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-white/80 mb-1.5">Peraturan Konser (Rules)</label>
                    <textarea
                      name="rules"
                      value={formData.rules}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2.5 text-white focus:border-[#8B5CF6] focus:outline-none"
                      rows="2"
                      placeholder="Contoh: Dilarang membawa senjata tajam, kamera profesional..."
                    />
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2.5 text-white/80 cursor-pointer bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="rounded border-white/20 bg-[#120d1d]"
                      />
                      <FaStar className="text-white w-3.5 h-3.5" />
                      <span>Featured Concert</span>
                    </label>
                    <label className="flex items-center gap-2.5 text-white/80 cursor-pointer bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl">
                      <input
                        type="checkbox"
                        name="isFlashSale"
                        checked={formData.isFlashSale}
                        onChange={handleInputChange}
                        className="rounded border-white/20 bg-[#120d1d]"
                      />
                      <FaBolt className="text-white w-3.5 h-3.5" />
                      <span>Aktifkan Flash Sale</span>
                    </label>
                  </div>

                  {formData.isFlashSale && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border border-[#8B5CF6]/40 rounded-xl p-4 bg-[#6D19B0]/10">
                      <div>
                        <label className="block font-semibold text-white/80 mb-1.5">
                          Harga Flash Sale ({formatRupiah(formData.flashSalePrice)})
                        </label>
                        <input
                          type="number"
                          name="flashSalePrice"
                          value={formData.flashSalePrice}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2 text-white focus:outline-none"
                          placeholder="175000"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-white/80 mb-1.5">Batas Akhir Flash Sale</label>
                        <input
                          type="datetime-local"
                          name="flashSaleEnd"
                          value={formData.flashSaleEnd}
                          onChange={handleInputChange}
                          className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-2 text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8 pt-5 border-t border-white/10">
                    <button 
                      type="button" 
                      onClick={goBack} 
                      className="rounded-xl border border-white/15 bg-black/40 px-5 py-3 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={loadingSubmit}
                      className="rounded-xl px-7 py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center gap-2 disabled:opacity-50"
                      style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                    >
                      {loadingSubmit ? (
                        <>
                          <FaSpinner className="w-4 h-4 animate-spin text-white" />
                          <span>Membuat Konser...</span>
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="w-4 h-4 text-white" />
                          <span>Publikasikan Konser</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* Kolom Kanan: Live Ticket Preview */}
          <div className="lg:col-span-4 sticky top-28">
            <div className="rounded-2xl border border-white/15 bg-[#120d1d] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#D8B4FE]">Live Ticket Preview</span>
                <span className="px-2 py-0.5 rounded-md bg-[#6D19B0]/30 border border-[#6D19B0]/50 text-[10px] text-white font-semibold">
                  {selectedVenueType ? selectedVenueType.name : 'No Layout'}
                </span>
              </div>

              <div className="h-36 p-5 flex flex-col justify-between relative" style={{ background: 'linear-gradient(135deg, #2D0B59 0%, #6D19B0 60%, #B900A3 100%)' }}>
                <div className="flex justify-between items-start">
                  <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-[10px] font-semibold text-white">
                    {formData.genre || 'Music Concert'}
                  </span>
                  {formData.isFeatured && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1">
                      <FaStar className="text-white w-2.5 h-2.5" /> Featured
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white line-clamp-1">
                    {formData.name || 'Nama Konser Anda'}
                  </h3>
                  <p className="text-xs text-white/80 flex items-center gap-1.5 mt-0.5">
                    <FaMapMarkerAlt className="text-white w-3 h-3" />
                    <span className="line-clamp-1">{formData.venueName || 'Nama Venue'}{formData.city ? `, ${formData.city}` : ''}</span>
                  </p>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-4 border-b border-dashed border-white/15">
                  <div>
                    <span className="text-[10px] text-white/50 block">TANGGAL</span>
                    <span className="font-bold text-white flex items-center gap-1.5 mt-1">
                      <FaCalendarAlt className="text-white w-3 h-3" />
                      {formData.date || 'Belum diatur'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/50 block">WAKTU</span>
                    <span className="font-bold text-white flex items-center gap-1.5 mt-1">
                      <FaClock className="text-white w-3 h-3" />
                      {formData.time || '--:--'} WIB
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total Section</span>
                    <span className="font-bold text-white">{formData.sections.length} Kategori</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Total Tiket Tersedia</span>
                    <span className="font-bold text-[#D8B4FE]">{calculatedTotalTickets.toLocaleString('id-ID')} Tiket</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Harga Mulai Dari</span>
                    <span className="font-extrabold text-white text-sm">
                      {normalizedSectionPrices.length > 0
                        ? formatRupiah(Math.min(...normalizedSectionPrices))
                        : 'Rp 0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}