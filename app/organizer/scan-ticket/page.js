// src/app/organizer/scanner/page.js
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import toast from 'react-hot-toast';
import NavbarEO from '../../../components/navbarEO';
import { 
  FaArrowLeft, 
  FaCamera, 
  FaCheckCircle, 
  FaSpinner, 
  FaTimesCircle, 
  FaUsers,
  FaQrcode,
  FaMusic
} from 'react-icons/fa';

const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api' });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default function TicketScannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const scannerRef = useRef(null);
  const cameraLifecycleRef = useRef(Promise.resolve());
  const selectedConcertRef = useRef('');
  const inFlightRef = useRef(false);
  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [selectedConcertId, setSelectedConcertId] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && !['organizer', 'admin', 'super_admin'].includes(user.role)) router.push('/dashboard');
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user || !['organizer', 'admin', 'super_admin'].includes(user.role)) return undefined;
    let active = true;
    const loadConcerts = async () => {
      try {
        const response = user.role === 'organizer'
          ? await api.get('/organizer/concerts')
          : await api.get('/concerts?limit=100');
        const rows = response.data?.data || [];
        if (!active) return;
        setConcerts(rows);
        const queryConcertId = new URLSearchParams(window.location.search).get('concertId');
        if (queryConcertId && rows.some((concert) => String(concert.id) === queryConcertId)) {
          selectedConcertRef.current = queryConcertId;
          setSelectedConcertId(queryConcertId);
        }
      } catch (error) {
        console.error('Failed to load concerts for scanner:', error);
        if (active) toast.error(error.response?.data?.message || 'Gagal memuat daftar konser');
      } finally {
        if (active) setLoadingConcerts(false);
      }
    };
    loadConcerts();
    return () => { active = false; };
  }, [loading, user]);

  const loadScans = useCallback(async (concertId) => {
    if (!concertId) return;
    try {
      setLoadingScans(true);
      const response = await api.get('/tickets/scans', { params: { concertId } });
      setScans(response.data?.data?.scans || []);
    } catch (error) {
      console.error('Failed to load check-in history:', error);
      toast.error(error.response?.data?.message || 'Gagal memuat riwayat check-in');
    } finally {
      setLoadingScans(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedConcertId) return;
    const timeoutId = window.setTimeout(() => loadScans(selectedConcertId), 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadScans, selectedConcertId]);

  const validateCode = useCallback(async (code) => {
    if (!code || !selectedConcertId || selectedConcertRef.current !== selectedConcertId || inFlightRef.current) return;
    inFlightRef.current = true;
    setChecking(true);
    try {
      const response = await api.post('/tickets/scan', { code, concertId: Number(selectedConcertId) });
      setResult({ success: true, message: response.data.message, data: response.data.data });
      toast.success('Tiket valid');
      await loadScans(selectedConcertId);
    } catch (error) {
      setResult({ success: false, message: error.response?.data?.message || 'QR tidak dapat divalidasi' });
      toast.error(error.response?.data?.message || 'QR tidak valid');
    } finally {
      setChecking(false);
      setManualCode('');
      window.setTimeout(() => { inFlightRef.current = false; }, 1500);
    }
  }, [selectedConcertId, loadScans]);

  useEffect(() => {
    if (loading || !user || !['organizer', 'admin', 'super_admin'].includes(user.role)) return undefined;
    if (!selectedConcertId) return undefined;
    let active = true;
    const stopScanner = async () => {
      const scanner = scannerRef.current;
      if (!scanner) return;
      if (scanner.isScanning) await scanner.stop();
      await scanner.clear();
      if (scannerRef.current === scanner) scannerRef.current = null;
    };

    cameraLifecycleRef.current = cameraLifecycleRef.current
      .catch((error) => console.error('Previous camera lifecycle failed:', error))
      .then(async () => {
        await stopScanner();
        if (!active) return;

        const { Html5Qrcode } = await import('html5-qrcode');
        if (!active) return;

        const scanner = new Html5Qrcode('ticket-qr-reader');
        scannerRef.current = scanner;
        try {
          await scanner.start(
            { facingMode: 'environment' },
            { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1 },
            (decodedText) => validateCode(decodedText),
            () => {}
          );
          if (!active) {
            await stopScanner();
            return;
          }
          setScannerReady(true);
        } catch (error) {
          console.error('Camera scanner unavailable:', error);
          await stopScanner();
          if (active) setScannerReady(false);
        }
      });

    return () => {
      active = false;
      cameraLifecycleRef.current = cameraLifecycleRef.current
        .catch((error) => console.error('Camera startup failed:', error))
        .then(stopScanner)
        .catch((error) => console.error('Failed to stop previous camera:', error));
    };
  }, [loading, user, selectedConcertId, validateCode]);

  const handleConcertChange = (event) => {
    const concertId = event.target.value;
    selectedConcertRef.current = concertId;
    setScannerReady(false);
    setSelectedConcertId(concertId);
    setResult(null);
    setManualCode('');
    setScans([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`::-webkit-scrollbar { display: none; } body { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        <div className="text-center">
          <FaSpinner className="h-12 w-12 animate-spin text-[#8B5CF6] mx-auto" />
          <p className="mt-3 text-xs text-white/60">Memuat scanner...</p>
        </div>
      </div>
    );
  }

  if (!user || !['organizer', 'admin', 'super_admin'].includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Navbar EO */}
      <NavbarEO />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Navigasi & Header Banner */}
        <div className="mb-8">
          <Link 
            href="/organizer/concerts" 
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors bg-[#120d1d] border border-white/15 px-3.5 py-2 rounded-xl shadow-sm mb-6"
          >
            <FaArrowLeft className="text-white" /> Kembali ke Konser Saya
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#6D19B0]/30 border border-[#8B5CF6]/40 text-[#D8B4FE] uppercase tracking-wider">
                  Gate Control
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">QR Code Check-In Scanner</h1>
              <p className="text-xs text-white/60 mt-1">Pilih konser terlebih dahulu. QR code hanya berlaku untuk konser yang sedang dipilih.</p>
            </div>
            
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/10" style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}>
              <FaCamera className="text-white text-xl" />
            </div>
          </div>
        </div>

        {/* Section Pilih Konser */}
        <section className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 shadow-xl mb-6">
          <label htmlFor="scanner-concert" className="block text-xs font-semibold text-white/80 mb-2">
            Pilih Konser yang Akan Menerima Check-In <span className="text-[#D8B4FE]">*</span>
          </label>
          <select
            id="scanner-concert"
            value={selectedConcertId}
            onChange={handleConcertChange}
            className="w-full py-2.5 px-4 bg-black/40 border border-white/15 rounded-xl text-xs text-white focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner cursor-pointer"
            disabled={loadingConcerts || checking}
          >
            <option value="">{loadingConcerts ? 'Memuat konser...' : '-- Pilih konser --'}</option>
            {concerts.map((concert) => (
              <option key={concert.id} value={concert.id}>{concert.name}</option>
            ))}
          </select>
          {!loadingConcerts && concerts.length === 0 && (
            <p className="mt-2 text-xs text-amber-300">Belum ada konser yang dapat dipilih.</p>
          )}
        </section>

        {selectedConcertId && (
          <>
            {/* Grid Kamera & Input Manual */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] mb-6">
              
              {/* Kamera Pemindai */}
              <section className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 shadow-xl flex flex-col">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#D8B4FE]">Kamera Pemindai</h2>
                  {scannerReady && (
                    <span className="rounded-full bg-green-500/20 border border-green-500/30 px-3 py-0.5 text-[10px] font-bold text-green-300">
                      Kamera Aktif
                    </span>
                  )}
                </div>
                
                <div id="ticket-qr-reader" className="min-h-[280px] overflow-hidden rounded-xl bg-black border border-white/10 flex-1" />
                
                {!scannerReady && (
                  <p className="mt-3 text-xs text-white/50">Kamera belum aktif atau izin belum diberikan. Gunakan input kode di samping jika diperlukan.</p>
                )}
              </section>

              {/* Form Input Manual & Hasil Scan */}
              <section className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <form onSubmit={(event) => { event.preventDefault(); validateCode(manualCode.trim()); }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 mb-1.5">Input Kode QR Manual</label>
                    <div className="relative">
                      <FaQrcode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-3.5 h-3.5" />
                      <input 
                        value={manualCode} 
                        onChange={(event) => setManualCode(event.target.value)} 
                        className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-white/30 focus:border-[#8B5CF6] focus:outline-none transition-all shadow-inner font-mono" 
                        placeholder="Masukkan kode tiket..."
                        autoComplete="off" 
                      />
                    </div>
                  </div>

                  <button 
                    disabled={!manualCode.trim() || checking || !selectedConcertId} 
                    className="w-full rounded-xl py-3 text-xs font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    {checking ? <FaSpinner className="animate-spin text-white w-3.5 h-3.5" /> : null} 
                    <span>Validasi Tiket</span>
                  </button>
                </form>

                {result && (
                  <div className={`mt-5 rounded-xl border p-4 text-xs ${result.success ? 'border-green-500/40 bg-green-500/10 text-green-200' : 'border-red-500/40 bg-red-500/10 text-red-200'}`}>
                    <div className="flex items-center gap-2 font-bold text-sm mb-2">
                      {result.success ? <FaCheckCircle className="text-green-300 w-4 h-4 shrink-0" /> : <FaTimesCircle className="text-red-300 w-4 h-4 shrink-0" />}
                      <span>{result.message}</span>
                    </div>
                    {result.data && (
                      <div className="mt-2 space-y-1 text-white/80 border-t border-white/10 pt-2">
                        <p><strong className="text-white">Konser:</strong> {result.data.concert}</p>
                        <p><strong className="text-white">Customer:</strong> {result.data.customerName || '-'}</p>
                        <p><strong className="text-white">No. Tiket:</strong> <span className="font-mono">{result.data.ticketNumber}</span></p>
                        <p><strong className="text-white">Waktu:</strong> {new Date(result.data.scannedAt).toLocaleString('id-ID')}</p>
                      </div>
                    )}
                  </div>
                )}
              </section>

            </div>

            {/* Riwayat Check-In */}
            <section className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-6">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-bold text-white">
                    <FaUsers className="text-[#D8B4FE]" /> Riwayat Check-In
                  </h2>
                  <p className="mt-1 text-xs text-white/60">
                    {concerts.find((concert) => String(concert.id) === selectedConcertId)?.name} · Daftar tiket yang berhasil dipindai
                  </p>
                </div>
                <span className="rounded-full bg-[#6D19B0]/30 border border-[#8B5CF6]/40 px-3.5 py-1 text-xs font-bold text-[#D8B4FE]">
                  {scans.length} Hadir
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-xs">
                  <thead className="bg-black/40 text-[11px] uppercase tracking-wider text-white/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-3.5 font-bold">Waktu Check-In</th>
                      <th className="px-6 py-3.5 font-bold">Customer</th>
                      <th className="px-6 py-3.5 font-bold">Nomor Tiket</th>
                      <th className="px-6 py-3.5 font-bold">Order</th>
                      <th className="px-6 py-3.5 font-bold">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loadingScans ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-white/50">
                          <FaSpinner className="mr-2 inline animate-spin text-[#8B5CF6]" /> Memuat riwayat...
                        </td>
                      </tr>
                    ) : scans.length ? (
                      scans.map((scan) => (
                        <tr key={scan.id} className="text-white/80 hover:bg-white/5 transition-colors">
                          <td className="whitespace-nowrap px-6 py-4">{new Date(scan.scannedAt).toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 font-medium text-white">{scan.ticket?.order?.customerName || 'Customer'}</td>
                          <td className="px-6 py-4 font-mono text-xs text-[#D8B4FE]">{scan.ticket?.ticketNumber || '-'}</td>
                          <td className="px-6 py-4 font-mono text-xs text-white/60">{scan.ticket?.order?.orderNumber || '-'}</td>
                          <td className="px-6 py-4">{scan.scanner?.name || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-white/40">
                          Belum ada tiket yang berhasil check-in untuk konser ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}