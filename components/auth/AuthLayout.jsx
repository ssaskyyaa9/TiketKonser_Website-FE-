import Image from "next/image";
import Logo from "@/components/ui/Logo";
import Link from "next/link";
import { ArrowLeft, QrCode, ShieldCheck, Wallet } from "lucide-react";

const FACTS = [
  { icon: Wallet, text: "Bayar lewat Midtrans: virtual account, e-wallet, kartu." },
  { icon: QrCode, text: "E-tiket berkode QR, dikirim ke email dan tersimpan di akunmu." },
  { icon: ShieldCheck, text: "Sesi masuk dilindungi cookie aman, bukan disimpan di browser." },
];

/** Kerangka login/registrasi: foto panggung di kiri (desktop), form polos di kanan. */
export default function AuthLayout({ title, subtitle, children, footer, backHref = "/landing", backLabel = "Beranda" }) {
  return (
    <div className="auth">
      <aside className="auth__aside on-dark" aria-hidden={undefined}>
        <Image src="/icons/bg.png" alt="" fill priority sizes="55vw" style={{ objectFit: "cover" }} />
        <div className="auth__aside-veil" />
        <div className="auth__aside-body">
          <Logo height={36} />
          <div className="max-w-md">
            <p className="font-display" style={{ fontSize: "2.25rem", lineHeight: 1.1, fontWeight: 800 }}>
              Dari antrean ke barisan depan.
            </p>
            <ul className="mt-8 flex flex-col gap-4 list-none p-0 m-0">
              {FACTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm" style={{ color: "var(--fg-muted)" }}>
                  <Icon size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--fg)", flexShrink: 0, marginTop: 1 }} />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <main className="auth__main">
        <div className="flex items-center justify-between">
          <Link href={backHref} className="auth__quiet inline-flex items-center gap-2">
            <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
            {backLabel}
          </Link>
          <span className="lg:hidden">
            <Logo height={26} />
          </span>
        </div>

        <div className="auth__col">
          <header className="mb-7">
            <h1 className="auth__title font-display">{title}</h1>
            {subtitle ? <p className="auth__sub">{subtitle}</p> : null}
          </header>
          {children}
          {footer ? <p className="auth__foot">{footer}</p> : null}
        </div>
      </main>
    </div>
  );
}
