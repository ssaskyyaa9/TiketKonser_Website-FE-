"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Bookmark, ChevronDown, CircleHelp, FileText, LayoutDashboard, LogOut, Settings, Ticket, UserRound, X } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { logout } from "@/lib/api";

const ITEMS = [
  { href: "/beranda", label: "Halaman Utama", icon: LayoutDashboard },
  { href: "/tiket-disimpan", label: "Tiket Disimpan", icon: Bookmark },
  { href: "/tiket-saya", label: "Tiket Saya", icon: Ticket },
  { href: "/riwayat", label: "Riwayat Pembelian", icon: FileText },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

const FAQ = [
  ["Apakah tiket di ShowTime resmi?", "Ya. Semua tiket dijual bekerja sama langsung dengan penyelenggara acara."],
  ["Di mana e-tiket saya?", "Di menu Tiket Saya. Tiket juga dikirim ke email yang kamu daftarkan."],
  ["Bagaimana jika konser dibatalkan?", "Dana dikembalikan penuh sesuai kebijakan pengembalian dana."],
  ["Metode pembayaran apa yang tersedia?", "Virtual account, e-wallet, QRIS, dan kartu kredit/debit."],
];

function relTime(iso) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

const iconBtn = "relative grid h-10 w-10 place-items-center rounded-full transition-colors hover:bg-white/10";
const panel = "absolute right-0 top-[calc(100%+8px)] z-50 rounded-xl border shadow-2xl";
const panelStyle = { background: "var(--ink-800)", borderColor: "var(--line-strong)", boxShadow: "var(--shadow-1)" };

export default function CustomerHeader({ user }) {
  const router = useRouter();
  const pathname = usePathname();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(null); // "account" | "help" | "notif" | null
  const [scrolled, setScrolled] = useState(false);
  const [notifs, setNotifs] = useState(null); // null = belum dimuat
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Tutup semua popover saat pindah halaman (pola 'state turunan', bukan effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(null);
  }

  // Buka menu akun → fokus ke item pertama (keyboard).
  useEffect(() => {
    if (open === "account") rootRef.current?.querySelector('[role="menu"] [role="menuitem"]')?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(null); };
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      setOpen(null);
      rootRef.current?.querySelector(`[data-trigger="${open}"]`)?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  useEffect(() => {
    let alive = true;
    fetch("/api/customer/notifications", { credentials: "same-origin", cache: "no-store" })
      .then((r) => r.json().then((j) => (r.ok ? j.data || [] : [])))
      .catch(() => [])
      .then((list) => alive && setNotifs(list));
    return () => { alive = false; };
  }, []);

  const unread = (notifs || []).filter((n) => !n.isRead).length;

  const markRead = async (n) => {
    if (n.isRead) return;
    setNotifs((list) => list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    fetch(`/api/customer/notifications/${n.id}/read`, { method: "PUT", credentials: "same-origin" }).catch(() => {});
  };
  const markAll = () => (notifs || []).filter((n) => !n.isRead).forEach(markRead);

  const menuKeys = (e) => {
    const items = [...e.currentTarget.querySelectorAll('[role="menuitem"]')];
    const i = items.indexOf(document.activeElement);
    const to = { ArrowDown: (i + 1) % items.length, ArrowUp: (i - 1 + items.length) % items.length, Home: 0, End: items.length - 1 }[e.key];
    if (to !== undefined) { e.preventDefault(); items[to]?.focus(); }
  };

  const toggle = (name) => (e) => { e.stopPropagation(); setOpen((v) => (v === name ? null : name)); };

  const doLogout = async () => {
    setLoggingOut(true);
    try { await logout(); } finally { router.replace("/login"); router.refresh(); }
  };

  return (
    <header
      ref={rootRef}
      className="fixed inset-x-0 top-0 z-40 transition-colors duration-200"
      style={{ background: scrolled ? "rgba(8,6,15,.92)" : "linear-gradient(180deg, rgba(5,3,9,.75), rgba(5,3,9,0))", backdropFilter: scrolled ? "blur(12px)" : "none", borderBottom: scrolled ? "1px solid var(--line)" : "1px solid transparent" }}
    >
      <a href="#konten" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-black">Lewati ke konten</a>
      <div className="mx-auto flex h-[76px] w-full max-w-[1320px] items-center gap-3 px-4 sm:px-6">
        <Logo height={32} href="/beranda" />

        <div className="ml-auto flex items-center gap-1 sm:gap-3">
          <span className="hidden rounded-md border px-3.5 py-1.5 text-sm md:inline-block" style={{ borderColor: "var(--violet-500)", color: "var(--violet-500)" }} aria-label="Peran: Penonton">Penonton</span>

          <div className="relative">
            <button type="button" data-trigger="help" className={iconBtn} aria-label="Bantuan" aria-haspopup="dialog" aria-expanded={open === "help"} onClick={toggle("help")}>
              <CircleHelp size={24} strokeWidth={1.75} aria-hidden="true" />
            </button>
            {open === "help" ? (
              <div role="dialog" aria-label="Bantuan" className={`${panel} w-[min(340px,calc(100vw-32px))] p-4`} style={panelStyle}>
                <div className="mb-2 flex items-center justify-between"><h2 className="text-sm font-semibold">Bantuan</h2>
                  <button type="button" className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10" aria-label="Tutup bantuan" onClick={() => setOpen(null)}><X size={16} aria-hidden="true" /></button></div>
                {FAQ.map(([q, a]) => (
                  <details key={q} className="border-t py-2 text-sm" style={{ borderColor: "var(--line)" }}>
                    <summary className="cursor-pointer font-medium">{q}</summary>
                    <p className="mt-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>{a}</p>
                  </details>
                ))}
                <p className="mt-3 text-xs" style={{ color: "var(--fg-muted)" }}>Masih butuh bantuan? <a className="underline" href="mailto:help@showtime.id" style={{ color: "var(--fg)" }}>help@showtime.id</a></p>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button type="button" data-trigger="notif" className={iconBtn} aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : "Notifikasi"} aria-haspopup="dialog" aria-expanded={open === "notif"} onClick={toggle("notif")}>
              <Bell size={24} strokeWidth={1.75} aria-hidden="true" />
              {unread ? <span aria-hidden="true" className="absolute right-2 top-2 h-2 w-2 rounded-full" style={{ background: "var(--danger)" }} /> : null}
            </button>
            {open === "notif" ? (
              <div role="dialog" aria-label="Notifikasi" className={`${panel} w-[min(360px,calc(100vw-32px))]`} style={panelStyle}>
                <div className="flex items-center justify-between px-4 py-3">
                  <h2 className="text-sm font-semibold">Notifikasi</h2>
                  {unread ? <button type="button" onClick={markAll} className="text-xs underline" style={{ color: "var(--fg-muted)" }}>Tandai semua dibaca</button> : null}
                </div>
                <ul className="m-0 max-h-[360px] list-none overflow-auto border-t p-0" style={{ borderColor: "var(--line)" }}>
                  {notifs === null ? <li className="px-4 py-6 text-center text-sm" style={{ color: "var(--fg-muted)" }}>Memuat…</li> : null}
                  {notifs && !notifs.length ? <li className="px-4 py-6 text-center text-sm" style={{ color: "var(--fg-muted)" }}>Belum ada notifikasi.</li> : null}
                  {(notifs || []).map((n) => (
                    <li key={n.id} className="border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
                      <button type="button" onClick={() => markRead(n)} className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/5">
                        <span aria-hidden="true" className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: n.isRead ? "transparent" : "var(--magenta-500)", border: n.isRead ? "1px solid var(--line-strong)" : "none" }} />
                        <span className="min-w-0"><span className="block text-sm font-semibold">{n.title}{n.isRead ? "" : <span className="sr-only"> (belum dibaca)</span>}</span>
                          <span className="block text-xs" style={{ color: "var(--fg-muted)" }}>{n.message}</span>
                          <span className="mt-1 block text-[11px]" style={{ color: "var(--fg-dim)" }}>{relTime(n.createdAt)}</span></span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="relative">
            <button type="button" data-trigger="account" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/10" aria-haspopup="menu" aria-expanded={open === "account"} onClick={toggle("account")}>
              <span className="grid h-[38px] w-[38px] place-items-center rounded-full" style={{ background: "var(--violet-600)" }}><UserRound size={20} strokeWidth={1.75} aria-hidden="true" /></span>
              <span className="hidden max-w-[14ch] truncate text-[20px] font-medium sm:inline">{user.name}</span>
              <ChevronDown size={20} aria-hidden="true" className="transition-transform duration-150" style={{ transform: open === "account" ? "rotate(180deg)" : "none" }} />
              <span className="sr-only sm:hidden">{user.name}</span>
            </button>
            {open === "account" ? (
              <div role="menu" aria-label="Menu akun" onKeyDown={menuKeys} className={`${panel} w-[236px] p-2`} style={panelStyle}>
                <div className="flex items-center gap-3 px-2 pb-3 pt-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black"><UserRound size={20} aria-hidden="true" /></span>
                  <span className="min-w-0"><span className="block truncate text-xs font-semibold">{user.name}</span><span className="block truncate text-[11px]" style={{ color: "var(--fg-muted)" }}>{user.email}</span></span>
                </div>
                <div className="border-t pt-2" style={{ borderColor: "var(--line)" }}>
                  {ITEMS.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href;
                    return (
                      <Link key={href} href={href} role="menuitem" aria-current={active ? "page" : undefined}
                        className="relative flex h-[38px] items-center gap-3 rounded-lg px-3 text-xs font-medium transition-colors hover:bg-white/10"
                        style={{ background: active ? "rgba(129,56,232,.22)" : undefined }}>
                        {active ? <span aria-hidden="true" className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full brand-bg" /> : null}
                        <Icon size={16} strokeWidth={1.9} aria-hidden="true" />{label}
                      </Link>
                    );
                  })}
                </div>
                <div className="mt-2 border-t pt-2" style={{ borderColor: "var(--line)" }}>
                  <button type="button" role="menuitem" onClick={doLogout} disabled={loggingOut} className="flex h-[38px] w-full items-center gap-3 rounded-lg px-3 text-xs font-medium transition-colors hover:bg-white/10 disabled:opacity-60" style={{ color: "var(--danger)" }}>
                    <LogOut size={16} strokeWidth={1.9} aria-hidden="true" />{loggingOut ? "Keluar…" : "Keluar Akun"}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
