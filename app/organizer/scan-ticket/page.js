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
  FaSyncAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUpload,
} from 'react-icons/fa';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('accessToken')
      : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const getCameraStatusMessage = (error) => {
  const name = error?.name || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Izin kamera belum diberikan atau dibatalkan. Klik "Aktifkan Kamera" lalu izinkan akses kamera di browser, atau gunakan upload gambar QR / input kode manual.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'Kamera tidak ditemukan pada perangkat ini. Gunakan upload gambar QR atau input kode manual di samping untuk validasi tiket.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return 'Kamera sedang digunakan aplikasi lain. Tutup aplikasi kamera lain lalu coba lagi atau gunakan input manual.';
  }
  return 'Kamera pemindai belum aktif. Klik "Aktifkan Kamera", unggah gambar QR, atau masukkan kode tiket manual.';
};

const extractDecodedCode = (decodedText) => {
  if (!decodedText) return '';
  const trimmed = String(decodedText).trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === 'object') {
      return String(parsed.code || parsed.ticketCode || parsed.ticketNumber || trimmed).trim();
    }
  } catch {
    // Bukan format JSON, lanjutkan pakai teks aslinya
  }
  return trimmed;
};

export default function TicketScannerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraLifecycleRef = useRef(Promise.resolve());
  const selectedConcertRef = useRef('');
  const inFlightRef = useRef(false);

  const [concerts, setConcerts] = useState([]);
  const [loadingConcerts, setLoadingConcerts] = useState(true);
  const [selectedConcertId, setSelectedConcertId] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const [startingCamera, setStartingCamera] = useState(false);
  const [cameraNotice, setCameraNotice] = useState('');
  const [cameraRetryKey, setCameraRetryKey] = useState(0);
  const [manualCode, setManualCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState([]);
  const [loadingScans, setLoadingScans] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (user && !['organizer', 'admin', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (loading || !user || !['organizer', 'admin', 'super_admin'].includes(user.role)) {
      return undefined;
    }

    let active = true;
    const loadConcerts = async () => {
      try {
        setLoadingConcerts(true);
        const response =
          user.role === 'organizer'
            ? await api.get('/organizer/concerts')
            : await api.get('/concerts?limit=100');
        const rows = Array.isArray(response.data?.data) ? response.data.data : [];
        if (!active) return;
        setConcerts(rows);

        const queryConcertId = new URLSearchParams(window.location.search).get('concertId');
        if (queryConcertId && rows.some((concert) => String(concert.id) === queryConcertId)) {
          selectedConcertRef.current = queryConcertId;
          setSelectedConcertId(queryConcertId);
        }
      } catch (error) {
        if (active) {
          toast.error(error.response?.data?.message || 'Gagal memuat daftar konser');
        }
      } finally {
        if (active) setLoadingConcerts(false);
      }
    };

    void loadConcerts();
    return () => {
      active = false;
    };
  }, [loading, user]);

  const loadScans = useCallback(async (concertId) => {
    if (!concertId) return;
    try {
      setLoadingScans(true);
      const response = await api.get('/tickets/scans', { params: { concertId } });
      const list =
        response.data?.data?.scans ||
        response.data?.scans ||
        (Array.isArray(response.data?.data) ? response.data.data : []);
      setScans(Array.isArray(list) ? list : []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal memuat riwayat check-in');
    } finally {
      setLoadingScans(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedConcertId) return;
    void loadScans(selectedConcertId);
  }, [loadScans, selectedConcertId]);

  const validateCode = useCallback(
    async (rawCode) => {
      const code = extractDecodedCode(rawCode);
      if (
        !code ||
        !selectedConcertId ||
        selectedConcertRef.current !== selectedConcertId ||
        inFlightRef.current
      ) {
        return;
      }

      inFlightRef.current = true;
      setChecking(true);
      try {
        const response = await api.post('/tickets/scan', {
          code,
          concertId: Number(selectedConcertId),
        });

        const payloadData = response.data?.data || {};
        const messageText = response.data?.message || 'Tiket valid dan berhasil check-in';

        setResult({
          success: true,
          message: messageText,
          data: payloadData,
        });

        const instantScanItem = {
          id: payloadData.scanId || payloadData.id || `scan-${Date.now()}`,
          scannedAt: payloadData.scannedAt || new Date().toISOString(),
          ticket: {
            ticketNumber: payloadData.ticketNumber || code,
            order: {
              customerName: payloadData.customerName || 'Pengunjung',
              orderNumber: payloadData.orderNumber || '-',
            },
          },
          scanner: {
            name: payloadData.scannerName || user?.name || 'Petugas',
          },
        };

        setScans((prev) => [instantScanItem, ...prev]);
        toast.success('Tiket valid & check-in berhasil');
        await loadScans(selectedConcertId);
      } catch (error) {
        const errMsg = error.response?.data?.message || 'QR tidak dapat divalidasi';
        setResult({ success: false, message: errMsg });
        toast.error(errMsg);
      } finally {
        setChecking(false);
        setManualCode('');
        window.setTimeout(() => {
          inFlightRef.current = false;
        }, 1200);
      }
    },
    [selectedConcertId, loadScans, user?.name]
  );

  useEffect(() => {
    if (loading || !user || !['organizer', 'admin', 'super_admin'].includes(user.role)) {
      return undefined;
    }
    if (!selectedConcertId) return undefined;

    let active = true;
    const stopScanner = async () => {
      const scanner = scannerRef.current;
      if (!scanner) return;
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch {
        // Abaikan jika kamera sudah berhenti
      }
      try {
        await scanner.clear();
      } catch {
        // Abaikan jika elemen sudah dibersihkan
      }
      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }
    };

    cameraLifecycleRef.current = cameraLifecycleRef.current
      .catch(() => undefined)
      .then(async () => {
        await stopScanner();
        if (!active) return;

        setStartingCamera(true);
        setCameraNotice('');

        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          if (!active) return;

          const scanner = new Html5Qrcode('ticket-qr-reader', { verbose: false });
          scannerRef.current = scanner;

          const scanConfig = {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              const size = Math.max(180, Math.min(260, Math.floor(minEdge * 0.72)));
              return { width: size, height: size };
            },
          };

          const onScanSuccess = (decodedText) => {
            void validateCode(decodedText);
          };

          try {
            await scanner.start(
              { facingMode: 'environment' },
              scanConfig,
              onScanSuccess,
              () => {}
            );
          } catch {
            if (!active) return;
            await scanner.start({ facingMode: 'user' }, scanConfig, onScanSuccess, () => {});
          }

          if (!active) {
            await stopScanner();
            return;
          }
          setScannerReady(true);
          setCameraNotice('');
        } catch (error) {
          await stopScanner();
          if (active) {
            setScannerReady(false);
            setCameraNotice(getCameraStatusMessage(error));
          }
        } finally {
          if (active) {
            setStartingCamera(false);
          }
        }
      });

    return () => {
      active = false;
      cameraLifecycleRef.current = cameraLifecycleRef.current
        .catch(() => undefined)
        .then(stopScanner)
        .catch(() => undefined);
    };
  }, [loading, user, selectedConcertId, cameraRetryKey, validateCode]);

  const handleFileScan = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !selectedConcertId) return;

    try {
      setChecking(true);
      const { Html5Qrcode } = await import('html5-qrcode');
      const tempScanner = new Html5Qrcode('ticket-qr-file-reader', { verbose: false });
      try {
        const decodedText = await tempScanner.scanFile(file, true);
        await validateCode(decodedText);
      } finally {
        try {
          await tempScanner.clear();
        } catch {
          // Abaikan
        }
      }
    } catch {
      setResult({
        success: false,
        message: 'Kode QR tidak terbaca pada gambar. Coba gambar lain atau masukkan kode manual.',
      });
      toast.error('QR pada gambar tidak terbaca');
    } finally {
      setChecking(false);
    }
  };

  const handleConcertChange = (event) => {
    const concertId = event.target.value;
    selectedConcertRef.current = concertId;
    setScannerReady(false);
    setCameraNotice('');
    setSelectedConcertId(concertId);
    setResult(null);
    setManualCode('');
    setScans([]);
  };

  const handleRetryCamera = () => {
    setScannerReady(false);
    setCameraNotice('');
    setCameraRetryKey((prev) => prev + 1);
  };

  const activeConcert = concerts.find((concert) => String(concert.id) === String(selectedConcertId));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07050c] text-white">
        <style jsx global>{`
          ::-webkit-scrollbar {
            display: none;
          }
          body {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="text-center">
          <FaSpinner className="h-12 w-12 animate-spin text-white mx-auto" />
          <p className="mt-4 text-sm text-white/70">Memuat scanner...</p>
        </div>
      </div>
    );
  }

  if (!user || !['organizer', 'admin', 'super_admin'].includes(user.role)) return null;

  return (
    <div className="min-h-screen bg-[#07050c] text-white selection:bg-[#6D19B0]/40">
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
        body {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <NavbarEO />

      <div id="ticket-qr-file-reader" className="hidden" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Navigasi & Header Banner */}
        <div className="mb-7">
          <Link
            href="/organizer/concerts"
            className="inline-flex items-center gap-2.5 text-sm font-semibold text-white/80 hover:text-white transition-colors bg-[#120d1d] border border-white/15 hover:border-white/30 px-4 py-2.5 rounded-xl shadow-sm mb-6"
          >
            <FaArrowLeft className="text-white w-3.5 h-3.5" />
            <span>Kembali ke Konser Saya</span>
          </Link>

          <div
            className="flex flex-col md:flex-row md:items-center justify-between gap-5 bg-[#120d1d] border border-white/15 p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden"
            style={{
              backgroundImage:
                'radial-gradient(circle at top right, rgba(185, 0, 163, 0.18), transparent 55%)',
            }}
          >
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#6D19B0]/35 border border-white/15 text-white uppercase tracking-wider">
                  Kontrol Pintu Masuk
                </span>
                {selectedConcertId && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-white">
                    {scans.length} Tiket Tervalidasi
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Pemindai QR Check-In Tiket
              </h1>
              <p className="text-sm sm:text-base text-white/65 mt-1.5 max-w-2xl">
                Pilih konser aktif terlebih dahulu. Setiap tiket yang berhasil dipindai langsung
                muncul di riwayat check-in.
              </p>
            </div>

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/15"
              style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
            >
              <FaQrcode className="text-white text-2xl" />
            </div>
          </div>
        </div>

        {/* Pilihan Konser Lebar Penuh */}
        <section className="bg-[#120d1d] border border-white/15 rounded-2xl p-6 shadow-xl mb-7">
          <div className="w-full">
            <label
              htmlFor="scanner-concert"
              className="block text-sm font-bold text-white mb-2.5"
            >
              Pilih Konser untuk Check-In
            </label>
            <select
              id="scanner-concert"
              value={selectedConcertId}
              onChange={handleConcertChange}
              className="w-full py-3.5 px-4 bg-black/45 border border-white/15 rounded-xl text-sm sm:text-base font-medium text-white focus:border-[#8B5CF6] focus:outline-none transition-all cursor-pointer [&>option]:bg-[#120d1d] [&>option]:text-white"
              disabled={loadingConcerts || checking}
            >
              <option value="">
                {loadingConcerts ? 'Memuat daftar konser...' : '-- Pilih konser yang ingin di-scan --'}
              </option>
              {concerts.map((concert) => (
                <option key={concert.id} value={concert.id}>
                  {concert.name}
                </option>
              ))}
            </select>
          </div>

          {activeConcert && (
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-sm text-white/80">
              <div className="font-semibold text-white">{activeConcert.name}</div>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/70">
                {activeConcert.date && (
                  <span className="inline-flex items-center gap-2">
                    <FaCalendarAlt className="text-white w-3.5 h-3.5" />
                    {new Date(activeConcert.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {(activeConcert.venueName || activeConcert.venue?.name) && (
                  <span className="inline-flex items-center gap-2">
                    <FaMapMarkerAlt className="text-white w-3.5 h-3.5" />
                    {activeConcert.venueName || activeConcert.venue?.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {!loadingConcerts && concerts.length === 0 && (
            <p className="mt-3 text-sm text-white/70">
              Belum ada konser yang tersedia untuk check-in.
            </p>
          )}
        </section>

        {selectedConcertId ? (
          <>
            {/* Grid Kamera & Validasi Manual */}
            <div className="grid gap-6 lg:grid-cols-12 mb-7 items-stretch">
              {/* Kamera Pemindai */}
              <section className="lg:col-span-7 bg-[#120d1d] border border-white/15 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <FaCamera className="text-white w-4 h-4" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                        Kamera Pemindai QR
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {startingCamera ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#6D19B0]/30 border border-white/15 px-3.5 py-1 text-xs font-bold text-white">
                          <FaSpinner className="animate-spin w-3.5 h-3.5 text-white" /> Menyiapkan...
                        </span>
                      ) : scannerReady ? (
                        <span className="rounded-full bg-[#6D19B0]/40 border border-white/15 px-3.5 py-1 text-xs font-bold text-white">
                          Kamera Aktif
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleRetryCamera}
                          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow transition hover:opacity-90 cursor-pointer"
                          style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                        >
                          <FaSyncAlt className="w-3.5 h-3.5 text-white" />
                          <span>Aktifkan Kamera</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative min-h-[310px] overflow-hidden rounded-2xl bg-black border border-white/15 flex items-center justify-center">
                    <div
                      id="ticket-qr-reader"
                      className="w-full h-full min-h-[310px] flex items-center justify-center"
                    />

                    {!scannerReady && !startingCamera && (
                      <div className="absolute inset-0 bg-[#07050c]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border border-white/15"
                          style={{ background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)' }}
                        >
                          <FaCamera className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-sm sm:text-base font-bold text-white mb-1.5">
                          Kamera Belum Aktif
                        </p>
                        <p className="text-xs sm:text-sm text-white/65 max-w-md leading-relaxed mb-4">
                          {cameraNotice ||
                            'Izinkan akses kamera pada browser, unggah gambar QR, atau masukkan kode tiket secara manual.'}
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-2.5">
                          <button
                            type="button"
                            onClick={handleRetryCamera}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:opacity-90 cursor-pointer"
                            style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                          >
                            <FaSyncAlt className="w-3.5 h-3.5 text-white" />
                            <span>Coba Nyalakan Kamera</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-black/50 border border-white/15 hover:border-white/30 transition cursor-pointer"
                          >
                            <FaUpload className="w-3.5 h-3.5 text-white" />
                            <span>Upload Gambar QR</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-white/65">
                  <span>Arahkan kode QR tiket ke area kamera untuk check-in otomatis.</span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={checking}
                    className="inline-flex items-center gap-2 text-xs font-bold text-white hover:underline cursor-pointer"
                  >
                    <FaUpload className="w-3.5 h-3.5 text-white" />
                    <span>Scan dari Gambar</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileScan}
                    className="hidden"
                  />
                </div>
              </section>

              {/* Input Manual & Hasil Validasi */}
              <section className="lg:col-span-5 bg-[#120d1d] border border-white/15 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void validateCode(manualCode.trim());
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="manual-ticket-code"
                      className="block text-sm font-bold text-white mb-2"
                    >
                      Input Kode Tiket / QR Manual
                    </label>
                    <div className="relative">
                      <FaQrcode className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60 w-4 h-4" />
                      <input
                        id="manual-ticket-code"
                        value={manualCode}
                        onChange={(event) => setManualCode(event.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-black/45 border border-white/15 rounded-xl text-sm text-white placeholder-white/40 focus:border-[#8B5CF6] focus:outline-none transition-all font-mono"
                        placeholder="Masukkan kode QR atau nomor tiket..."
                        autoComplete="off"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!manualCode.trim() || checking || !selectedConcertId}
                    className="w-full rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition hover:opacity-90 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)' }}
                  >
                    {checking && <FaSpinner className="animate-spin text-white w-4 h-4" />}
                    <span>{checking ? 'Memvalidasi...' : 'Validasi Tiket'}</span>
                  </button>
                </form>

                {result ? (
                  <div
                    className={`mt-5 rounded-2xl border p-4 text-xs sm:text-sm ${
                      result.success
                        ? 'border-white/20 bg-[#6D19B0]/25 text-white'
                        : 'border-white/20 bg-black/55 text-white/90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 font-bold text-sm sm:text-base mb-2">
                      {result.success ? (
                        <FaCheckCircle className="text-white w-4 h-4 shrink-0" />
                      ) : (
                        <FaTimesCircle className="text-white w-4 h-4 shrink-0" />
                      )}
                      <span>{result.message}</span>
                    </div>

                    {result.data && (
                      <div className="mt-2.5 space-y-1.5 text-white/85 border-t border-white/10 pt-3">
                        {result.data.concert && (
                          <p>
                            <strong className="text-white">Konser:</strong> {result.data.concert}
                          </p>
                        )}
                        <p>
                          <strong className="text-white">Pengunjung:</strong>{' '}
                          {result.data.customerName || '-'}
                        </p>
                        <p>
                          <strong className="text-white">No. Tiket:</strong>{' '}
                          <span className="font-mono text-white">
                            {result.data.ticketNumber || '-'}
                          </span>
                        </p>
                        <p>
                          <strong className="text-white">Waktu:</strong>{' '}
                          {new Date(result.data.scannedAt || Date.now()).toLocaleString('id-ID')}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4 text-xs sm:text-sm text-white/60">
                    Hasil validasi tiket akan tampil di sini dan otomatis masuk ke daftar riwayat
                    check-in di bawah.
                  </div>
                )}
              </section>
            </div>

            {/* Riwayat Check-In */}
            <section className="bg-[#120d1d] border border-white/15 rounded-2xl overflow-hidden shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-6">
                <div>
                  <h2 className="flex items-center gap-2.5 text-base sm:text-lg font-bold text-white">
                    <FaUsers className="text-white w-4 h-4" />
                    <span>Riwayat Check-In</span>
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-white/65">
                    {activeConcert?.name} · Daftar tiket yang berhasil dipindai
                  </p>
                </div>
                <span className="rounded-full bg-[#6D19B0]/35 border border-white/15 px-4 py-1.5 text-xs sm:text-sm font-bold text-white">
                  {scans.length} Hadir
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs sm:text-sm">
                  <thead className="bg-black/40 text-xs uppercase tracking-wider text-white/60 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-bold">Waktu Check-In</th>
                      <th className="px-6 py-4 font-bold">Pengunjung</th>
                      <th className="px-6 py-4 font-bold">Nomor Tiket</th>
                      <th className="px-6 py-4 font-bold">Order</th>
                      <th className="px-6 py-4 font-bold">Petugas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loadingScans && scans.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-white/60">
                          <FaSpinner className="mr-2 inline animate-spin text-white" />
                          Memuat riwayat...
                        </td>
                      </tr>
                    ) : scans.length ? (
                      scans.map((scan) => (
                        <tr
                          key={scan.id}
                          className="text-white/85 hover:bg-white/[0.04] transition-colors"
                        >
                          <td className="whitespace-nowrap px-6 py-4">
                            {new Date(scan.scannedAt).toLocaleString('id-ID')}
                          </td>
                          <td className="px-6 py-4 font-semibold text-white">
                            {scan.ticket?.order?.customerName || 'Pengunjung'}
                          </td>
                          <td className="px-6 py-4 font-mono text-white">
                            {scan.ticket?.ticketNumber || '-'}
                          </td>
                          <td className="px-6 py-4 font-mono text-white/65">
                            {scan.ticket?.order?.orderNumber || '-'}
                          </td>
                          <td className="px-6 py-4">{scan.scanner?.name || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-white/50">
                          Belum ada tiket yang berhasil check-in untuk konser ini.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <div className="bg-[#120d1d] border border-white/15 rounded-2xl p-10 text-center shadow-xl">
            <p className="text-base font-bold text-white mb-1">
              Silakan Pilih Konser Terlebih Dahulu
            </p>
            <p className="text-sm text-white/65">
              Setelah konser dipilih, kamera pemindai QR, input manual, dan riwayat check-in akan
              muncul di halaman ini.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}