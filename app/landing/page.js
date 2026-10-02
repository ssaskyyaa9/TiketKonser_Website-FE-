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
              <Image src="/icons/tiketresmi.png" alt="Tiket Resmi" width={50} height={50} style={{ objectFit: 'contain', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Tiket Resmi</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Langsung dari penyelenggara</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Image src="/icons/mic.png" alt="Promo Eksklusif" width={50} height={50} style={{ objectFit: 'contain', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Promo Eksklusif</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Dapatkan harga spesial yang tidak tersedia ditempat lain</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Image src="/icons/security.png" alt="Pembayaran Aman" width={50} height={50} style={{ objectFit: 'contain', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Pembayaran Aman</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Sistem pembayaran terenkripsi & terverifikasi</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Image src="/icons/tiketpraktis.png" alt="E-Tiket Praktis" width={50} height={50} style={{ objectFit: 'contain', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>E-Tiket Praktis</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Tiket digital langsung masuk ke email kamu tanpa antre</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Image src="/icons/pengembalian.png" alt="Pengembalian Mudah" width={50} height={50} style={{ objectFit: 'contain', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Pengembalian Mudah</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Proses pengembalian cepat jika event dibatalkan</p>
            </div>

            <div style={{ backgroundColor: '#080612', border: '1px solid rgba(129, 56, 232, 0.4)', borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Image src="/icons/pelayanan.png" alt="Pelayanan" width={50} height={50} style={{ objectFit: 'contain', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', margin: '0 0 8px 0' }}>Pelayanan</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0, lineHeight: 1.4 }}>Tim kami siap membantu 24/7</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}