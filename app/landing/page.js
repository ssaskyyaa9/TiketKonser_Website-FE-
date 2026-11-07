"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Ticket } from "lucide-react";
import SiteHeader from "@/components/landing/SiteHeader";
import SiteFooter from "@/components/landing/SiteFooter";
import ConcertCard from "@/components/landing/ConcertCard";
import { SectionTitle } from "@/components/ui/Card";
import { buttonClass } from "@/components/ui/Button";
import { concerts } from "@/lib/mock";

const TRUST = [
  { icon: "/icons/music.png", title: "Tiket Resmi", text: "100% terpercaya" },
  { icon: "/icons/security.png", title: "Pembayaran Aman", text: "Terverifikasi" },
  { icon: "/icons/support.png", title: "Layanan 24/7", text: "Siap membantu" },
];

const FEATURES = [
  { icon: "/icons/tiketresmi.png", title: "Tiket Resmi", text: "Langsung dari penyelenggara" },
  { icon: "/icons/eksklusif.png", title: "Promo Eksklusif", text: "Harga spesial yang tidak ada di tempat lain" },
  { icon: "/icons/pembayaran.png", title: "Pembayaran Aman", text: "Transaksi terenkripsi & terverifikasi" },
  { icon: "/icons/tiketpraktis.png", title: "E-Tiket Praktis", text: "Tiket digital langsung masuk ke email kamu" },
  { icon: "/icons/pengembalian.png", title: "Pengembalian Mudah", text: "Dana kembali cepat bila acara dibatalkan" },
  { icon: "/icons/pelayanan.png", title: "Pelayanan", text: "Tim kami siap membantu 24/7" },
];

const STEPS = [
  { icon: "/icons/mencari.png", title: "Cari Konser", text: "Pilih konser atau festival favoritmu" },
  { icon: "/icons/memilih.png", title: "Pilih Tiket", text: "Tentukan kategori dan jumlah tiket" },
  { icon: "/icons/bayar.png", title: "Bayar", text: "Selesaikan pembayaran dengan aman" },
  { icon: "/icons/e-tik.png", title: "Terima E-Tiket", text: "Tiket dikirim ke email dan menu Tiket Saya" },
  { icon: "/icons/nikmati.png", title: "Nikmati Konser", text: "Tunjukkan e-tiket di pintu masuk" },
];

const FAQ = [
  {
    question: "Apakah tiket di ShowTime resmi?",
    answer:
      "Ya. Seluruh tiket yang dijual di ShowTime 100% resmi dan bekerja sama langsung dengan penyelenggara acara.",
  },
  {
    question: "Bagaimana jika konser dibatalkan?",
    answer:
      "Jika penyelenggara membatalkan acara, dana kamu dikembalikan penuh sesuai kebijakan pengembalian dana.",
  },
  {
    question: "Apakah tiket bisa diubah atau diberikan ke orang lain?",
    answer:
      "Tiket dapat dipindahtangankan dengan melampirkan surat kuasa dan salinan kartu identitas pemilik asli saat penukaran di lokasi.",
  },
  {
    question: "Bagaimana cara mendapatkan e-tiket?",
    answer:
      "E-tiket dikirim otomatis ke email yang kamu daftarkan dan juga tersedia di menu “Tiket Saya” pada dashboard.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menerima transfer bank (virtual account), kartu kredit/debit, e-wallet (GoPay, OVO, ShopeePay), dan gerai retail.",
  },
  {
    question: "Bagaimana cara menukarkan e-tiket menjadi gelang fisik?",
    answer:
      "Tunjukkan e-tiket beserta kartu identitas yang berlaku di booth penukaran tiket pada hari acara (H) atau sehari sebelumnya (H-1).",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const recommended = concerts.slice(0, 5);
  const trending = [...concerts].sort((a, b) => b.soldTickets / b.totalTickets - a.soldTickets / a.totalTickets).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--ink-900)" }}>
      <SiteHeader />

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0" aria-hidden="true">
            <Image src="/icons/bg.png" alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(3,2,5,0.92) 0%, rgba(3,2,5,0.6) 45%, var(--ink-900) 100%)",
              }}
            />
          </div>

          <div className="on-dark relative mx-auto max-w-[1280px] px-5 pt-16 pb-14 md:pt-24 md:pb-20 flex flex-col items-center text-center">
            <span className="chip chip--neutral mb-5">
              <span className="chip__dot" aria-hidden="true" />
              Tiket resmi dari penyelenggara
            </span>

            <h1
              className="font-display font-extrabold max-w-4xl"
              style={{ fontSize: "clamp(2rem, 6vw, 3.6rem)", lineHeight: 1.06 }}
            >
              Malam Penuh Kenangan <br />
              <span className="brand-text">Dimulai di Sini.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base md:text-lg" style={{ color: "var(--fg-muted)" }}>
              Temukan konser & festival musik terbaik di Indonesia. Pesan tiket resmi dengan mudah, cepat, dan aman.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href="#konser" className={buttonClass({ variant: "primary", size: "lg" })}>
                <Ticket size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>Cari Konser</span>
              </a>
              <a href="#cara-kerja" className={buttonClass({ variant: "secondary", size: "lg" })}>
                <CalendarDays size={18} strokeWidth={1.75} aria-hidden="true" />
                <span>Cara Beli Tiket</span>
              </a>
            </div>

            <ul className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 list-none p-0 m-0">
              {TRUST.map((item) => (
                <li key={item.title} className="flex items-center gap-3">
                  <span
                    className="grid place-items-center shrink-0"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)",
                      padding: 1,
                    }}
                  >
                    <span className="grid place-items-center" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#0a0714" }}>
                      <Image src={item.icon} alt="" width={24} height={24} style={{ objectFit: "contain" }} aria-hidden="true" />
                    </span>
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-semibold">{item.title}</span>
                    <span className="block text-sm" style={{ color: "var(--fg-muted)" }}>
                      {item.text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Konser Rekomendasi ---------- */}
        <section id="konser" className="mx-auto w-full max-w-[1280px] px-5 pt-4 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <SectionTitle className="text-xl md:text-2xl">Konser Rekomendasi</SectionTitle>
              <p className="text-sm mt-2" style={{ color: "var(--fg-muted)" }}>
                Deretan konser pilihan yang siap memanjakan telinga kamu.
              </p>
            </div>
            <p className="text-sm" style={{ color: "var(--fg-dim)" }}>
              {recommended.length} konser akan datang
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recommended.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        </section>

        {/* ---------- Trending ---------- */}
        <section id="trending" className="mx-auto w-full max-w-[1280px] px-5 pt-16 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
            <div>
              <SectionTitle className="text-xl md:text-2xl">Trending Saat Ini</SectionTitle>
              <p className="text-sm mt-2" style={{ color: "var(--fg-muted)" }}>
                Paling cepat terjual minggu ini. Jangan sampai kehabisan.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {trending.map((concert) => (
              <ConcertCard key={concert.id} concert={concert} />
            ))}
          </div>
        </section>

        {/* ---------- Promo ---------- */}
        <section className="mx-auto w-full max-w-[1280px] px-5 pt-16">
          <div
            className="on-dark relative overflow-hidden grid gap-8 md:grid-cols-[1.4fr_1fr] items-center p-7 md:p-9"
            style={{
              borderRadius: "var(--r-xl)",
              border: "1px solid var(--line-strong)",
              background: "linear-gradient(135deg, #170628 0%, #08010f 70%)",
              boxShadow: "0 0 40px rgba(129,56,232,0.18)",
            }}
          >
            <div>
              <p className="text-xs font-bold uppercase mb-2" style={{ color: "var(--magenta-500)", letterSpacing: "0.1em" }}>
                Promo Spesial
              </p>
              <h2 className="font-display font-extrabold" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", lineHeight: 1.05 }}>
                Diskon hingga <span className="brand-text">30%</span>
              </h2>
              <p className="mt-3 text-sm md:text-base" style={{ color: "var(--fg-muted)" }}>
                Untuk pembelian minimal 2 tiket pada konser peserta promo. Periode terbatas.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/registrasi" className={buttonClass({ variant: "primary", size: "md" })}>
                  Klaim Promo
                </Link>
                <a href="#faq" className={buttonClass({ variant: "ghost", size: "md" })}>
                  Lihat syarat
                </a>
              </div>
            </div>

            <div className="relative w-full max-w-[320px] mx-auto aspect-[2/1]">
              <Image src="/icons/diskon.png" alt="" fill sizes="320px" style={{ objectFit: "contain" }} aria-hidden="true" />
            </div>
          </div>
        </section>

        {/* ---------- Tentang Kami ---------- */}
        <section id="tentang" className="mx-auto w-full max-w-[1280px] px-5 pt-16 scroll-mt-20">
          <SectionTitle className="text-xl md:text-2xl">Tentang Kami</SectionTitle>
          <p className="text-sm mt-2 mb-6" style={{ color: "var(--fg-muted)" }}>
            Kami hadir supaya pengalaman konser kamu tanpa ribet dan tanpa khawatir.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="card p-5 flex flex-col items-center text-center gap-3"
                style={{ borderColor: "var(--line-strong)" }}
              >
                <Image src={feature.icon} alt="" width={72} height={72} style={{ objectFit: "contain", height: 64, width: "auto" }} aria-hidden="true" />
                <h3 className="font-display text-sm font-bold">{feature.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "var(--fg-muted)" }}>
                  {feature.text}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Cara Kerja ---------- */}
        <section id="cara-kerja" className="mx-auto w-full max-w-[1280px] px-5 pt-16 scroll-mt-20">
          <div className="flex justify-center mb-10">
            <span
              className="px-8 py-3 text-center"
              style={{
                borderRadius: "var(--r-md)",
                border: "1px dashed var(--line-strong)",
                background: "var(--ink-950)",
              }}
            >
              <span className="font-display text-base font-bold">Cara beli tiket, mudah dipahami</span>
            </span>
          </div>

          <ol className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5 list-none p-0 m-0">
            {STEPS.map((step, index) => (
              <li key={step.title} className="flex flex-col items-center text-center">
                <span className="relative grid place-items-center" style={{ width: 82, height: 82 }}>
                  <span
                    className="absolute inset-0 grid place-items-center"
                    style={{ borderRadius: "50%", background: "linear-gradient(135deg, #6D19B0 0%, #B900A3 100%)", padding: 2 }}
                  >
                    <span className="grid place-items-center" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#07050e" }}>
                      <Image src={step.icon} alt="" width={44} height={44} style={{ objectFit: "contain" }} aria-hidden="true" />
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute grid place-items-center font-display"
                    style={{
                      bottom: -8,
                      width: 26,
                      height: 26,
                      borderRadius: "50%",
                      background: "#DEB4E6",
                      color: "#1a092b",
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </span>
                </span>
                <h3 className="font-display text-sm font-bold mt-5">{step.title}</h3>
                <p className="text-xs mt-1.5" style={{ color: "var(--fg-muted)" }}>
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Newsletter ---------- */}
        <section className="mx-auto w-full max-w-[1100px] px-5 pt-16">
          <div
            className="on-dark grid gap-6 md:grid-cols-[1fr_auto] md:items-center p-7"
            style={{
              borderRadius: "var(--r-lg)",
              border: "1px solid var(--line)",
              background: "linear-gradient(135deg, #130321 0%, #08010f 100%)",
            }}
          >
            <div className="flex items-center gap-5">
              <Image src="/icons/mic.png" alt="" width={56} height={56} style={{ objectFit: "contain", flexShrink: 0 }} aria-hidden="true" />
              <div>
                <h2 className="font-display text-lg font-bold">Jangan lewatkan konser favoritmu!</h2>
                <p className="text-sm mt-1" style={{ color: "var(--fg-muted)" }}>
                  Dapatkan info konser terbaru & promo menarik langsung ke emailmu.
                </p>
              </div>
            </div>

            {subscribed ? (
              <p className="text-sm font-semibold" style={{ color: "var(--ok)" }} role="status">
                Terima kasih! Email kamu sudah kami catat.
              </p>
            ) : (
              <form
                className="flex w-full md:w-[380px]"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (email.trim()) setSubscribed(true);
                }}
              >
                <label htmlFor="newsletter-email" className="sr-only">
                  Alamat email
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Masukkan email kamu"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    background: "var(--control-bg)",
                    border: "1px solid var(--line-strong)",
                    borderRight: "none",
                    borderRadius: "var(--r-sm) 0 0 var(--r-sm)",
                    padding: "12px 16px",
                    color: "var(--fg)",
                    fontSize: 14,
                  }}
                />
                <button
                  type="submit"
                  className="btn btn--primary"
                  style={{ borderRadius: "0 var(--r-sm) var(--r-sm) 0", padding: "0 22px" }}
                >
                  Kirim
                </button>
              </form>
            )}
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="mx-auto w-full max-w-[820px] px-5 pt-16 scroll-mt-20">
          <div className="text-center mb-8">
            <SectionTitle className="text-xl md:text-2xl justify-center">Pertanyaan yang Sering Ditanya</SectionTitle>
            <p className="text-sm mt-2" style={{ color: "var(--fg-muted)" }}>
              Klik pertanyaan untuk melihat jawabannya.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {FAQ.map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={item.question}
                  className="card overflow-hidden"
                  style={{ borderColor: isOpen ? "var(--line-strong)" : "var(--line)" }}
                >
                  <h3 className="m-0">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
                      aria-expanded={isOpen}
                      aria-controls={`faq-${index}`}
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                    >
                      <span className="text-sm md:text-base font-semibold">{item.question}</span>
                      <span
                        aria-hidden="true"
                        className="font-display text-lg shrink-0 transition-transform"
                        style={{ color: "var(--violet-500)", transform: isOpen ? "rotate(45deg)" : "none" }}
                      >
                        +
                      </span>
                    </button>
                  </h3>
                  {isOpen ? (
                    <p
                      id={`faq-${index}`}
                      className="px-5 pb-5 text-sm leading-relaxed m-0"
                      style={{ color: "var(--fg-muted)" }}
                    >
                      {item.answer}
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
