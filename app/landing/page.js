'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function SkeletonCard() {
  return (
    <div style={{ position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#0c0a14', display: 'flex', flexDirection: 'column', alignItems: 'center', justify: 'center', padding: '16px' }} >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', margin: 'auto 0' }}>
        <div className="spinner" />
        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>Memuat...</span>
      </div>

      <style jsx>{`
        .spinner {
          width: 36px;
          height: 36px;
          border: 3px solid rgba(247, 59, 225, 0.15);
          border-top: 3px solid #F73BE1;
          border-right: 3px solid #8138E8;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const concerts = [];

  const [openFaq, setOpenFaq] = useState(null);

  const faqData = [
    {
      question: 'Apakah tiket di ShowTime resmi?',
      answer: 'Ya, seluruh tiket yang dijual di ShowTime 100% resmi dan bekerja sama langsung dengan promotor penyelenggara acara.'
    },
    {
      question: 'Bagaimana jika konser dibatalkan?',
      answer: 'Jika konser dibatalkan oleh pihak promotor, proses pengembalian dana (refund) akan dilakukan secara penuh sesuai dengan kebijakan pengembalian.'
    },
    {
      question: 'Apakah tiket bisa di ubah atau diberikan ke orang lain?',
      answer: 'Tiket dapat dipindahtangankan dengan melampirkan surat kuasa beserta salinan kartu identitas pemilik asli saat penukaran.'
    },
    {
      question: 'Bagaimana cara mendapatkan e-tiket?',
      answer: 'E-tiket akan dikirimkan secara otomatis ke alamat email yang Anda daftarkan serta dapat diakses melalui menu "Tiket Saya" di aplikasi.'
    },
    {
      question: 'Metode pembayaran apa saja yang tersedia?',
      answer: 'Kami menerima berbagai metode pembayaran seperti Transfer Bank (VA), Kartu Kredit/Debit, E-Wallet (Gopay, OVO, ShopeePay), dan Mini Market.'
    },
    {
      question: 'Bagaimana cara menukarkan e-tiket menjadi gelang fisik?',
      answer: 'Tunjukkan e-tiket beserta kartu identitas yang berlaku di booth penukaran tiket di lokasi acara pada hari H atau H-1.'
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#030205', color: '#ffffff', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflow: 'hidden' }}>
        
        <header style={{ position: 'relative', zIndex: 20, width: '100%', backgroundColor: '#030205', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '0px', paddingBottom: '0px', paddingLeft: '24px', paddingRight: '24px', height: '70px', display: 'flex', alignItems: 'center' }}>
          <div style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/icons/logo.png" alt="SHOWTIME Logo" width={250} height={250} style={{ objectFit: 'contain', cursor: 'pointer', height: 'auto', marginLeft: '-10px', marginTop: '6px' }} />
            </div>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '75px', fontSize: '16px', fontWeight: 500, color: '#e5e7eb', marginLeft: '-100px'}}>
              <Link href="#" style={{ color: '#e5e7eb', textDecoration: 'none' }}> Beranda </Link>
              <Link href="#" style={{ color: '#e5e7eb', textDecoration: 'none' }}> Konser </Link>
              <Link href="#" style={{ color: '#e5e7eb', textDecoration: 'none' }}> Trending </Link>
              <Link href="#" style={{ color: '#e5e7eb', textDecoration: 'none' }}> Tentang kami </Link>
            </nav>

            <Link href="/registrasi" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'linear-gradient(to right, #8138E8, #F73BE1)', paddingLeft: '35px', paddingRight: '35px', paddingTop: '5px', paddingBottom: '5px', borderRadius: '8px', fontWeight: 500, fontSize: '16px', color: '#ffffff', border: 'none', cursor: 'pointer' }}> 
                Bergabung 
              </button>
            </Link>
          </div>
        </header>

        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/icons/bg.png" alt="Background Konser" fill style={{ objectFit: 'cover', objectPosition: 'center', opacity: 1 }} priority />
        </div>

        <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '1280px', width: '100%', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '40px', paddingBottom: '20px' }}>
          <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', paddingTop: '20px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '50px', fontWeight: 800, lineHeight: 1.2, color: '#ffffff', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Malam Penuh Kenangan <br />
              Dimulai di Sini.
            </h1>

            <h2 style={{ fontSize: '36px', fontWeight: 800, marginTop: '12px', marginBottom: 0, color: '#ffffff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Amankan Tiketmu Sekarang!
            </h2>

            <p style={{ color: '#e5e7eb', fontSize: '22px', marginTop: '20px', marginBottom: 0, fontWeight: 400, whiteSpace: 'nowrap', overflowX: 'auto', textShadow: '0 1px 5px rgba(0,0,0,0.5)' }}>
              Temukan konser & festival musik terbaik. Pesan tiket resmi dengan mudah, cepat, dan aman.
            </p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'linear-gradient(to right, #8138E8, #F73BE1)', paddingLeft: '28px', paddingRight: '28px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '16px', fontWeight: 600, fontSize: '16px', color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                <Image src="/icons/tiket lp.png" alt="Tiket Icon" width={25} height={25} style={{ marginRight: '6px' }} />
                <span>Cari Konser</span>
              </button>

              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', border: '1px solid #6b7280', paddingLeft: '28px', paddingRight: '28px', paddingTop: '12px', paddingBottom: '12px', borderRadius: '16px', fontWeight: 600, fontSize: '16px', color: '#ffffff', cursor: 'pointer' }}>
                <Image src="/icons/kalender up.png" alt="Kalender Icon" width={20} height={20} style={{ marginRight: '6px' }} />
                <span>Lihat Jadwal</span>
              </button>
            </div>
          </section>

         <section style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '93px', paddingTop: '16px', paddingBottom: '16px', margin: '0 auto', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                <div style={{ content: '""', position: 'absolute', inset: 0, borderRadius: '50%', padding: '1px', border: '1px solid transparent', background: 'linear-gradient(to right, #6D19B0, #B900A3) border-box', WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', zIndex: -1 }}></div>               
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/icons/music.png" alt="Music Icon" width={24} height={24} style={{ objectFit: 'contain', position: 'relative', zIndex: 1 }} />
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontWeight: 600, color: '#ffffff', fontSize: '16px', lineHeight: 1.2, margin: 0 }}>Tiket Resmi</h3>
                <p style={{ fontSize: '15px', color: '#9ca3af', marginTop: '2px', margin: 0 }}>100% terpercaya</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                <div style={{ content: '""', position: 'absolute', inset: 0, borderRadius: '50%', padding: '1px', border: '1px solid transparent', background: 'linear-gradient(to right, #6D19B0, #B900A3) border-box', WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', zIndex: -1 }}></div>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/icons/security.png" alt="Security Icon" width={24} height={24} style={{ objectFit: 'contain', position: 'relative', zIndex: 1 }} />
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontWeight: 600, color: '#ffffff', fontSize: '16px', lineHeight: 1.2, margin: 0 }}>Pembayaran Aman</h3>
                <p style={{ fontSize: '15px', color: '#9ca3af', marginTop: '2px', margin: 0 }}>Terverifikasi</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative', width: '48px', height: '48px' }}>
                <div style={{ content: '""', position: 'absolute', inset: 0, borderRadius: '50%', padding: '1px', border: '1px solid transparent', background: 'linear-gradient(to right, #6D19B0, #B900A3) border-box', WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude', zIndex: -1 }}></div>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Image src="/icons/support.png" alt="Support Icon" width={24} height={24} style={{ objectFit: 'contain', position: 'relative', zIndex: 1 }} />
                </div>
              </div>

              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontWeight: 600, color: '#ffffff', fontSize: '16px', lineHeight: 1.2, margin: 0 }}>Layanan 24/7</h3>
                <p style={{ fontSize: '15px', color: '#9ca3af', marginTop: '2px', margin: 0 }}>Siap membantu</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div style={{ backgroundColor: '#030205', width: '100%', paddingTop: '10px', paddingBottom: '40px' }}>
        <section style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px' }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '5px', height: '20px', background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)', display: 'inline-block', borderRadius: '2px' }} />
                <span style={{ background: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}> Konser Rekomendasi </span>
              </h2>
              <p style={{ color: '#d1d5db', fontSize: '20px', marginTop: '6px', margin: 0 }}> Deretan konser megah siap memanjakan telinga kamu. </p>
            </div>

            <Link href="#" style={{ color: '#B003A4', fontSize: '14px', textDecoration: 'none', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Lihat semua &rarr;
            </Link>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', width: '100%' }}>

              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : (
                concerts.map((concert) => (
                  <div key={concert.id} style={{ position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: '#120f1d', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }} >
                    {concert.image && (
                      <Image src={concert.image} alt={concert.artist} fill style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }} />
                    )}

                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.98) 40%, rgba(10,10,15,0.3) 70%, rgba(10,10,15,0.5) 100%)', zIndex: 1 }} />

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', minWidth: '42px' }}>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#ffffff', lineHeight: 1 }}>{concert.date}</span>
                        <span style={{ display: 'block', fontSize: '9px', fontWeight: 600, color: '#9ca3af', marginTop: '2px' }}>{concert.month}</span>
                      </div>

                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <Image src="/icons/save.png" alt="Save" width={20} height={20} style={{ objectFit: 'contain' }} />
                      </button>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                        {concert.artist}
                      </h3>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 10px 0' }}>
                        {concert.opener}
                      </p>

                      <div style={{ fontSize: '10px', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Image src="/icons/kategori.png" alt="Kategori" width={12} height={12} style={{ objectFit: 'contain' }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{concert.genres}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Image src="/icons/loc.png" alt="Lokasi" width={12} height={12} style={{ objectFit: 'contain' }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{concert.location}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '9px', color: '#9ca3af' }}>Mulai dari</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{concert.price}</span>
                        </div>

                        <button style={{ background: 'linear-gradient(to right, #8138E8, #F73BE1)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                          Beli Tiket
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button style={{ position: 'absolute', right: '-18px', width: '38px', height: '38px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, background: 'transparent', padding: 0 }}>
              <Image src="/icons/next.png" alt="Next" width={38} height={38} style={{ objectFit: 'contain' }} />
            </button>
          </div>
        </section>

        <section style={{ maxWidth: '1280px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', marginTop: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '5px', height: '20px', background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)', display: 'inline-block', borderRadius: '2px' }} />
                <span style={{ background: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}> Trending Saat Ini </span>
              </h2>
              <p style={{ color: '#d1d5db', fontSize: '20px', marginTop: '6px', margin: 0 }}> Jangan lewatkan panggung musik terhangat saat ini! </p>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', width: '100%' }}>

              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : (
                concerts.map((concert) => (
                  <div key={concert.id} style={{ position: 'relative', height: '380px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.15)', backgroundColor: '#120f1d', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '16px' }} >
                    {concert.image && (
                      <Image src={concert.image} alt={concert.artist} fill style={{ objectFit: 'cover', objectPosition: 'center', zIndex: 0 }} />
                    )}

                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,15,0.98) 40%, rgba(10,10,15,0.3) 70%, rgba(10,10,15,0.5) 100%)', zIndex: 1 }} />

                    <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '10px', padding: '6px 10px', textAlign: 'center', minWidth: '42px' }}>
                        <span style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#ffffff', lineHeight: 1 }}>{concert.date}</span>
                        <span style={{ display: 'block', fontSize: '9px', fontWeight: 600, color: '#9ca3af', marginTop: '2px' }}>{concert.month}</span>
                      </div>

                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
                        <Image src="/icons/save.png" alt="Save" width={20} height={20} style={{ objectFit: 'contain' }} />
                      </button>
                    </div>

                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.2 }}>
                        {concert.artist}
                      </h3>
                      <p style={{ fontSize: '11px', color: '#9ca3af', margin: '2px 0 10px 0' }}>
                        {concert.opener}
                      </p>

                      <div style={{ fontSize: '10px', color: '#d1d5db', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Image src="/icons/kategori.png" alt="Kategori" width={12} height={12} style={{ objectFit: 'contain' }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{concert.genres}</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Image src="/icons/loc.png" alt="Lokasi" width={12} height={12} style={{ objectFit: 'contain' }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{concert.location}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '10px' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '9px', color: '#9ca3af' }}>Mulai dari</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>{concert.price}</span>
                        </div>

                        <button style={{ background: 'linear-gradient(to right, #8138E8, #F73BE1)', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, color: '#ffffff', border: 'none', cursor: 'pointer' }}>
                          Beli Tiket
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1280px', margin: '60px auto 0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
          <div style={{ position: 'relative', borderRadius: '20px', border: '1px solid #8138E8', backgroundColor: '#07050e', display: 'flex', alignItems: 'center', justify: 'space-between', padding: '36px 48px', overflow: 'hidden', boxShadow: '0 0 30px rgba(129, 56, 232, 0.15)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 2 }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#B900A3', letterSpacing: '1px', textTransform: 'uppercase' }}> PROMO SPESIAL </span>
              <h2 style={{ fontSize: '38px', fontWeight: 800, color: '#ffffff', margin: 0, lineHeight: 1.1 }}> Diskon Hingga </h2>
              <span style={{ fontSize: '56px', fontWeight: 900, background: 'linear-gradient(90deg, #8138E8 0%, #F73BE1 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}> 30% </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px', zIndex: 2, marginLeft: 'auto', marginRight: '60px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#ffffff', margin: 0, marginRight: 60 }}> Untuk pembelian tiket </h3>
                <p style={{ fontSize: '17px', color: '#F73BE1', margin: '4px 0 0 0', fontWeight: 600 }}> minimal 2 tiket </p>
              </div>

              <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}> Periode terbatas! </p>

              <button style={{ marginTop: '8px', background: 'linear-gradient(to right, #8138E8, #F73BE1)', border: 'none', borderRadius: '10px', padding: '10px 24px', color: '#ffffff', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}> Klaim Promo </button>
            </div>

            <div style={{ position: 'relative', width: '320px', height: '160px', flexShrink: 0, zIndex: 1 }}>
              <Image src="/icons/diskon.png" alt="Promo Diskon" fill style={{ objectFit: 'contain' }} />
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1280px', margin: '60px auto 0 auto', paddingLeft: '24px', paddingRight: '24px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '5px', height: '20px', background: 'linear-gradient(180deg, #6D19B0 0%, #B900A3 100%)', display: 'inline-block', borderRadius: '2px' }} />
              <span style={{ background: 'linear-gradient(90deg, #1E3DFF 0%, #FA2F84 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'inline-block' }}> Tentang Kami </span>
            </h2>
            <p style={{ color: '#d1d5db', fontSize: '20px', marginTop: '8px', margin: 0 }}> Kami hadir untuk pengalaman konser tanpa ribet dan tanpa khawatir. </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Image src="/icons/tiketresmi.png" alt="Tiket Resmi" width={100} height={100} style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Tiket Resmi</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Langsung dari penyelenggara</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Image src="/icons/eksklusif.png" alt="Promo Eksklusif" width={120} height={120} style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Promo Eksklusif</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Dapatkan harga spesial yang tidak tersedia ditempat lain</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Image src="/icons/pembayaran.png" alt="Pembayaran Aman" width={100} height={100} style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Pembayaran Aman</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Sistem pembayaran terenkripsi & terverifikasi</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Image src="/icons/tiketpraktis.png" alt="E-Tiket Praktis" width={100} height={100} style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E-Tiket Praktis</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Tiket digital langsung masuk ke email kamu tanpa antre</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Image src="/icons/pengembalian.png" alt="Pengembalian Mudah" width={100} height={100} style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Pengembalian Mudah</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Proses pengembalian cepat jika event dibatalkan</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Image src="/icons/pelayanan.png" alt="Pelayanan" width={100} height={100} style={{ objectFit: 'contain' }} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0', minHeight: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Pelayanan</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Tim kami siap membantu 24/7</p>
            </div>
          </div>
        </section>

        <section style={{ maxWidth: '1280px', margin: '60px auto 0 auto', paddingLeft: '24px', paddingRight: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', borderRadius: '16px', padding: '12px 32px', marginBottom: '50px', backgroundColor: '#030205' }}>
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <defs>
                <linearGradient id="dashed-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6D19B0" />
                  <stop offset="100%" stopColor="#B900A3" />
                </linearGradient>
              </defs>
              <rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="15" fill="none" stroke="url(#dashed-gradient)" strokeWidth="2" strokeDasharray="6, 6" />
            </svg>

            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#ffffff', margin: 0, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              Dengan cara kerja mudah di pahami
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '82px', height: '82px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#07050e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/icons/mencari.png" alt="Mencari Konser" width={46} height={46} style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ position: 'absolute', bottom: '-10px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DEB4E6', color: '#1a092b', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 1 </span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: '22px 0 0 0', textAlign: 'center' }}> Mencari Konser </p>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <Image src="/icons/arrows.png" alt="Arrow" width={65} height={24} style={{ objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '82px', height: '82px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#07050e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/icons/memilih.png" alt="Memilih Tiket" width={46} height={46} style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ position: 'absolute', bottom: '-10px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DEB4E6', color: '#1a092b', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 2 </span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: '22px 0 0 0', textAlign: 'center' }}> Memilih Tiket </p>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <Image src="/icons/arrows.png" alt="Arrow" width={65} height={24} style={{ objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '82px', height: '82px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#07050e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/icons/bayar.png" alt="Lakukan Pembayaran" width={46} height={46} style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ position: 'absolute', bottom: '-10px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DEB4E6', color: '#1a092b', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 3 </span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: '22px 0 0 0', textAlign: 'center' }}> Lakukan Pembayaran </p>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <Image src="/icons/arrows.png" alt="Arrow" width={65} height={24} style={{ objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '82px', height: '82px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#07050e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/icons/e-tik.png" alt="Dapatkan E-Tiket" width={46} height={46} style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ position: 'absolute', bottom: '-10px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DEB4E6', color: '#1a092b', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 4 </span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: '22px 0 0 0', textAlign: 'center' }}> Dapatkan E-Tiket </p>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <Image src="/icons/arrows.png" alt="Arrow" width={65} height={24} style={{ objectFit: 'contain' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '82px', height: '82px', borderRadius: '50%', padding: '2px', background: 'linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#07050e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src="/icons/nikmati.png" alt="Nikmati Konser!" width={46} height={46} style={{ objectFit: 'contain' }} />
                </div>
                <span style={{ position: 'absolute', bottom: '-10px', width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#DEB4E6', color: '#1a092b', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}> 5 </span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: '22px 0 0 0', textAlign: 'center' }}> Nikmati Konser! </p>
            </div>
          </div>
        </section>

        <div style={{ maxWidth: '1100px', margin: '75px' }}>
        <div style={{ position: 'relative', borderRadius: '16px', border: '1px solid #231238', background: 'linear-gradient(135deg, #130321 0%, #08010f 100%)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '80px', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ width: '64px', height: '64px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image src="/icons/mic.png" alt="Mic Icon" width={64} height={64} style={{ objectFit: 'contain' }} />
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 6px 0', color: '#ffffff' }}>
                Jangan lewatkan konser favoritmu!
              </h3>

              <p style={{ fontSize: '13px', color: '#a0a0a0', margin: 0 }}>
                Dapatkan info konser terbaru & promo menarik langsung ke emailmu.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', width: '380px', flexShrink: 0 }}>
            <input type="email" placeholder="Masukan email kamu" style={{ width: '100%', backgroundColor: '#07030d', border: '1px solid #331d4a', borderRight: 'none', borderRadius: '8px 0 0 8px', padding: '12px 16px', color: '#ffffff', fontSize: '13px', outline: 'none' }} />
            <button style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)', border: 'none', borderRadius: '0 8px 8px 0', padding: '12px 24px', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}> Kirim </button>
          </div>
        </div>

          <div style={{ position: 'relative', marginBottom: '100px' }}>
            <div style={{ position: 'absolute', left: '-62px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6 }}>
              <Image src="/icons/bintang.png" alt="Decoration Left" width={230} height={230} style={{ objectFit: 'contain' }} />
            </div>

            <div style={{ position: 'absolute', right: '-60px', top: '70%', transform: 'translateY(-50%)', opacity: 0.6 }}>
              <Image src="/icons/bintang.png" alt="Decoration Right" width={230} height={230} style={{ objectFit: 'contain' }} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 8px 0' }}>
                <span style={{ color: '#B900A3', marginRight: '8px' }}>|</span>
                <span style={{ background: 'linear-gradient(90deg, #6D19B0 0%, #B900A3 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Klik untuk menjawab pertanyaan anda
                </span>
              </h2>
              <p style={{ fontSize: '22px', color: '#cccccc', margin: 0 }}> Beberapa informasi yang mungkin dapat membantu anda </p>
            </div>

            <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {faqData.map((item, index) => (
                <div key={index} onClick={() => toggleFaq(index)} style={{ backgroundColor: '#05020a', border: '1px solid #8138E8', borderRadius: '8px', padding: '16px 20px', cursor: 'pointer', transition: 'all 0.3s ease' }} >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '16px', fontWeight: 500, color: '#e0e0e0' }}>
                      {item.question}
                    </span>
                    <span style={{ fontSize: '16px', color: '#8138E8', fontWeight: 'bold', transition: 'transform 0.2s', transform: openFaq === index ? 'rotate(45deg)' : 'rotate(0deg)' }}> + </span>
                  </div>

                  {openFaq === index && (
                    <p style={{ fontSize: '13px', color: '#a0a0a0', marginTop: '12px', margin: '12px 0 0 0', lineHeight: '1.6', borderTop: '1px solid #140a21', paddingTop: '10px' }}>
                      {item.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', paddingLeft: '5%', paddingRight: '5%', backgroundColor: '#000000', boxSizing: 'border-box' }}>
            <style>{` @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr !important; gap: 32px !important; } } `}</style>

            <footer className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1.2fr', gap: '150px', alignItems: 'start', backgroundColor: '#000000', color: '#ffffff', paddingTop: '5px', paddingBottom: '0px', margin:'0px' }}> <div>
              <div style={{ marginBottom: '-25px', marginLeft: '-50px', marginTop: '-74px' }}>
                <Image src="/icons/logo.png" alt="ShowTime Logo" width={300} height={300} style={{ objectFit: 'contain', display: 'block' }} />
              </div>

                <p style={{ fontSize: '16px', color: '#ffffff', lineHeight: '1.4', margin: 0, maxWidth: '210px', marginTop: '-50px', marginLeft: '-20px'}}>
                  Tiket anda menuju <br />
                  moment tak terlupakan
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: '#ffffff', lineHeight: '1.2' }}> Navigasi </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px' }}>Beranda</a></li>
                  <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px' }}>Konser</a></li>
                  <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px' }}>Trending</a></li>
                  <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px' }}>Tentang Kami</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: '#ffffff', lineHeight: '1.2' }}> Bantuan </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px' }}>Cara Kerja</a></li>
                  <li><a href="#" style={{ color: '#ffffff', textDecoration: 'none', fontSize: '15px' }}>FAQ</a></li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 20px 0', color: '#ffffff', lineHeight: '1.2' }}> Hubungi Kami </h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <li style={{ color: '#ffffff', fontSize: '15px' }}>help@showtime.id</li>
                  <li style={{ color: '#ffffff', fontSize: '15px' }}>+62 812-3456-7890</li>
                  <li style={{ color: '#ffffff', fontSize: '15px' }}>Jakarta, Indonesia</li>
                </ul>
              </div>
            </footer>
          </div>
      </div>
      </div>
    </main>
  );
}