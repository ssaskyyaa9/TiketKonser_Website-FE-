"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/ui/Logo";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { fetchSession } from "@/lib/api";

const LINKS = [
  { label: "Beranda", href: "/landing" },
  { label: "Konser", href: "#konser" },
  { label: "Trending", href: "#trending" },
  { label: "Tentang Kami", href: "#tentang" },
];

export default function SiteHeader() {
  const [user, setUser] = useState(null);

  // Sesi ada di cookie httpOnly: hanya server yang bisa membacanya, jadi tanya /api/auth/session.
  useEffect(() => {
    let alive = true;
    fetchSession().then((u) => alive && setUser(u));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ background: "var(--topbar-bg)", borderColor: "var(--line)", backdropFilter: "blur(12px)" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-4 px-5">
        <Logo height={26} />

        <nav className="hidden md:flex items-center gap-8 mx-auto" aria-label="Navigasi utama">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium transition-colors hover:text-white"
              style={{ color: "var(--fg-muted)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto md:ml-0 flex items-center gap-2">
          {user ? (
            <Link href="/akun" className={buttonClass({ variant: "primary", size: "sm" })}>
              Akun saya
            </Link>
          ) : (
            <>
              <span className="hidden sm:inline-flex">
                <Link href="/login" className={buttonClass({ variant: "secondary", size: "sm" })}>
                  Masuk
                </Link>
              </span>
              <Link href="/registrasi" className={buttonClass({ variant: "primary", size: "sm" })}>
                Bergabung
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
