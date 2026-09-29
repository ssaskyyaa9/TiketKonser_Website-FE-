import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#030205', color: '#ffffff', position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
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

          <button style={{ background: 'linear-gradient(to right, #8138E8, #F73BE1)', paddingLeft: '35px', paddingRight: '35px', paddingTop: '5px', paddingBottom: '5px', borderRadius: '8px', fontWeight: 500, fontSize: '16px', color: '#ffffff', border: 'none', cursor: 'pointer' }}> Bergabung </button>
        </div>
      </header>

      <div style={{ position: 'relative', zIndex: 10, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', maxWidth: '1280px', width: '100%', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', paddingTop: '24px', paddingBottom: '24px' }}>
        
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image src="/icons/bg.png" alt="Background Konser" fill style={{ objectFit: 'cover', objectPosition: 'center', opacity: 0.85 }} priority />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(129,56,232,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(3,2,5,0.4), transparent, #030205)' }} />
        </div>

        <section style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginTop: 'auto', marginBottom: 'auto', paddingTop: '24px', paddingBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{ fontSize: '50px', fontWeight: 800, lineHeight: 1.2, color: '#ffffff', margin: 0 }}>
            Malam Penuh Kenangan <br />
            Dimulai di Sini.
          </h1>

          <h2 style={{ fontSize: '36px', fontWeight: 800, marginTop: '12px', marginBottom: 0, color: '#ffffff' }}>
            Amankan Tiketmu Sekarang!
          </h2>

          <p style={{ color: '#e5e7eb', fontSize: '22px', marginTop: '20px', marginBottom: 0, fontWeight: 400, whiteSpace: 'nowrap', overflowX: 'auto' }}>
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
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #6D19B0', backgroundColor: 'rgba(109, 25, 176, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', flexShrink: 0 }}>
              <Image src="/icons/music.png" alt="Music Icon" width={24} height={24} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontWeight: 600, color: '#ffffff', fontSize: '16px', lineHeight: 1.2, margin: 0 }}>Tiket Resmi</h3>
              <p style={{ fontSize: '15px', color: '#9ca3af', marginTop: '2px', margin: 0 }}>100% terpercaya</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #6D19B0', backgroundColor: 'rgba(109, 25, 176, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', flexShrink: 0 }}>
              <Image src="/icons/security.png" alt="Security Icon" width={24} height={24} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontWeight: 600, color: '#ffffff', fontSize: '16px', lineHeight: 1.2, margin: 0 }}>Pembayaran Aman</h3>
              <p style={{ fontSize: '15px', color: '#9ca3af', marginTop: '2px', margin: 0 }}>Terverifikasi</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '1px solid #6D19B0', backgroundColor: 'rgba(109, 25, 176, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', flexShrink: 0 }}>
              <Image src="/icons/support.png" alt="Support Icon" width={24} height={24} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ fontWeight: 600, color: '#ffffff', fontSize: '16px', lineHeight: 1.2, margin: 0 }}>Layanan 24/7</h3>
              <p style={{ fontSize: '15px', color: '#9ca3af', marginTop: '2px', margin: 0 }}>Siap membantu</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
