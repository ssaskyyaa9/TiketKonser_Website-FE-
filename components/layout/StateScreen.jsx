import Image from "next/image";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

/**
 * Layar status penuh (404 / error) dengan latar & identitas yang sama
 * seperti landing/auth agar perpindahan tetap terasa satu aplikasi.
 */
export default function StateScreen({ code, title, description, actions, children }) {
  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center px-5 py-12" style={{ background: "var(--ink-950)" }}>
      <div className="absolute inset-0" aria-hidden="true">
        <Image src="/icons/bg.png" alt="" fill priority sizes="100vw" style={{ objectFit: "cover" }} />
        <div
          className="absolute inset-0"
          style={{ background: "var(--auth-veil)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-[520px] text-center">
        <Link href="/landing" className="inline-flex items-center mb-6" aria-label="ShowTime — beranda">
          <Image src="/icons/logo.png" alt="" width={130} height={130} style={{ height: 42, width: "auto" }} priority />
        </Link>

        <div className="card card--ticket p-7 md:p-9" style={{ ["--notch-top"]: "78%", background: "var(--auth-card)" }}>
          {code ? (
            <p className="font-display text-5xl font-extrabold brand-text mb-2">{code}</p>
          ) : null}
          <h1 className="font-display text-2xl font-extrabold">{title}</h1>
          {description ? (
            <p className="text-sm mt-3" style={{ color: "var(--fg-muted)" }}>
              {description}
            </p>
          ) : null}

          {children ? <div className="mt-5 text-left">{children}</div> : null}

          {actions ? (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">{actions}</div>
          ) : (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <Link href="/landing" className={buttonClass({ variant: "primary" })}>
                Kembali ke beranda
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
