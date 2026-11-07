import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { redirect } from "next/navigation";
import { Hammer, Mail, ShieldCheck } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import Alert from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";
import { callBackend, readToken } from "@/lib/server/bff";
import { ROLE_LABEL } from "@/lib/session";

export const metadata = { title: "Akun saya — ShowTime", robots: { index: false } };

export default async function AccountPage() {
  const token = await readToken();
  if (!token) redirect("/login?next=/akun");

  const { status, data } = await callBackend("/api/auth/me", { token });
  if (status === 401 || status === 403) redirect("/api/auth/expired");
  const user = status === 200 ? data?.user : null;

  return (
    <main className="mx-auto w-full max-w-[640px] px-5 py-10">
      <div className="flex items-center justify-between mb-10">
        <Logo height={30} />
        {user ? <LogoutButton /> : null}
      </div>

      {!user ? (
        <Alert tone="danger" title="Server belum bisa dihubungi">
          Sesimu masih tersimpan. Muat ulang halaman ini beberapa saat lagi.
        </Alert>
      ) : (
        <>
          <p className="text-sm" style={{ color: "var(--fg-muted)" }}>Kamu masuk sebagai</p>
          <h1 className="font-display text-3xl font-extrabold mt-1">{user.name}</h1>

          <dl className="mt-6 grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Mail size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--fg-muted)" }} />
              <dt className="sr-only">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--fg-muted)" }} />
              <dt className="sr-only">Peran</dt>
              <dd>{ROLE_LABEL[user.role] || user.role}</dd>
            </div>
          </dl>

          <hr className="tear-line my-8" />

          <div className="flex items-start gap-3">
            <Hammer size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--warn)", flexShrink: 0, marginTop: 2 }} />
            <p className="text-sm" style={{ color: "var(--fg-muted)" }}>
              Dashboard sedang dibangun ulang. Sementara itu, jelajahi konser yang tersedia.
            </p>
          </div>
          <Link href="/landing" className={`${buttonClass({ variant: "primary", size: "md" })} mt-5`}>
            Lihat konser
          </Link>
        </>
      )}
    </main>
  );
}
