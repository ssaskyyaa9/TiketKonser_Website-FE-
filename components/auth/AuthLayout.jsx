import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Ticket, Wallet } from "lucide-react";
import Logo from "@/components/ui/Logo";

const BENEFITS = [
  { icon: Ticket, title: "Tiket resmi", text: "Dijual langsung bekerja sama dengan penyelenggara." },
  { icon: Wallet, title: "Bayar dengan aman", text: "Virtual account, e-wallet, dan kartu kredit/debit." },
  { icon: ShieldCheck, title: "E-tiket langsung", text: "Tersimpan di email dan akun kamu." },
];

/** Kerangka login/registrasi: latar panggung, kolom merek di kiri, kartu bermotif tiket di kanan. */
export default function AuthLayout({ title, subtitle, children, footer, backHref = "/landing", backLabel = "Kembali ke beranda" }) {
  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--ink-950)" }}>
      <div className="absolute inset-0" aria-hidden="true">
        <Image src="/icons/bg.png" alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        <div className="absolute inset-0" style={{ background: "var(--auth-veil)" }} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1180px] flex-col gap-10 px-5 py-8 lg:flex-row lg:items-center">
        <section className="hidden flex-1 flex-col gap-7 pr-8 lg:flex">
          <Logo height={40} />
          <h2 className="font-display font-extrabold" style={{ fontSize: "2.6rem", lineHeight: 1.08 }}>
            Malam penuh kenangan <br />
            <span className="brand-text">dimulai di sini.</span>
          </h2>
          <p className="max-w-md text-base" style={{ color: "var(--fg-muted)" }}>
            Satu akun untuk membeli tiket, menyimpan favorit, dan mengelola konser kamu.
          </p>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {BENEFITS.map(({ icon: Icon, title: t, text }) => (
              <li key={t} className="flex items-start gap-3">
                <span
                  className="grid shrink-0 place-items-center"
                  style={{ width: 38, height: 38, borderRadius: "var(--r-sm)", background: "rgba(129,56,232,0.16)", color: "var(--violet-500)" }}
                >
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t}</span>
                  <span className="block text-sm" style={{ color: "var(--fg-muted)" }}>{text}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <main className="mx-auto w-full shrink-0 lg:w-[470px]">
          <Link href={backHref} className="auth__quiet mb-4 inline-flex items-center gap-2">
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
            {backLabel}
          </Link>

          <div
            className="card card--ticket p-6 md:p-8"
            style={{ ["--notch-top"]: "82%", background: "var(--auth-card)", backdropFilter: "blur(10px)", borderColor: "var(--line-strong)", boxShadow: "var(--shadow-1)" }}
          >
            <div className="mb-5 flex justify-center lg:hidden">
              <Logo height={30} />
            </div>
            <header className="mb-6">
              <h1 className="font-display text-2xl font-extrabold">
                <span className="brand-text">{title}</span>
              </h1>
              {subtitle ? <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>{subtitle}</p> : null}
            </header>
            {children}
            {footer ? <p className="auth__foot">{footer}</p> : null}
          </div>

          <p className="mt-4 text-center text-xs" style={{ color: "var(--fg-dim)" }}>
            Data kamu dipakai hanya untuk keperluan transaksi tiket dan tidak dibagikan ke pihak lain.
          </p>
        </main>
      </div>
    </div>
  );
}
