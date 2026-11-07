import Image from "next/image";
import Link from "next/link";
import { AtSign, Mail, MapPin, Phone } from "lucide-react";

const NAVIGASI = [
  { label: "Beranda", href: "/landing" },
  { label: "Konser", href: "#konser" },
  { label: "Trending", href: "#trending" },
  { label: "Tentang Kami", href: "#tentang" },
];

const BANTUAN = [
  { label: "Cara Beli Tiket", href: "#cara-kerja" },
  { label: "Pertanyaan Umum", href: "#faq" },
  { label: "Masuk", href: "/login" },
  { label: "Daftar", href: "/registrasi" },
];

export default function SiteFooter() {
  return (
    <footer className="on-dark border-t mt-20" style={{ borderColor: "var(--line)", background: "#050309" }}>
      <div className="mx-auto w-full max-w-[1280px] px-5 py-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Image src="/icons/logo.png" alt="ShowTime" width={150} height={150} style={{ height: 44, width: "auto" }} />
          <p className="text-sm mt-4 max-w-[240px]" style={{ color: "var(--fg-muted)" }}>
            Tiket Anda menuju momen tak terlupakan. Resmi, aman, dan tanpa ribet.
          </p>
        </div>

        <nav aria-label="Navigasi footer">
          <h2 className="font-display text-base font-bold mb-4">Navigasi</h2>
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {NAVIGASI.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm transition-colors hover:text-white" style={{ color: "var(--fg-muted)" }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Bantuan footer">
          <h2 className="font-display text-base font-bold mb-4">Bantuan</h2>
          <ul className="flex flex-col gap-3 list-none p-0 m-0">
            {BANTUAN.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-sm transition-colors hover:text-white" style={{ color: "var(--fg-muted)" }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base font-bold mb-4">Hubungi Kami</h2>
          <ul className="flex flex-col gap-3 list-none p-0 m-0 text-sm" style={{ color: "var(--fg-muted)" }}>
            <li className="flex items-center gap-2">
              <Mail size={16} strokeWidth={1.75} aria-hidden="true" />
              <a href="mailto:help@showtime.id" className="hover:text-white transition-colors">
                help@showtime.id
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} strokeWidth={1.75} aria-hidden="true" />
              <a href="tel:+6281234567890" className="hover:text-white transition-colors">
                +62 812-3456-7890
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} strokeWidth={1.75} aria-hidden="true" />
              Jakarta, Indonesia
            </li>
            <li className="flex items-center gap-2">
              <AtSign size={16} strokeWidth={1.75} aria-hidden="true" />
              <span>@showtime.id</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t" style={{ borderColor: "var(--line)" }}>
        <p className="mx-auto max-w-[1280px] px-5 py-5 text-xs" style={{ color: "var(--fg-dim)" }}>
          © {new Date().getFullYear()} ShowTime. Seluruh tiket dijual resmi bekerja sama dengan penyelenggara.
        </p>
      </div>
    </footer>
  );
}
