import { Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { formatDate } from "@/lib/format";
import { getData } from "@/lib/server/api";

export const metadata = { title: "Pengaturan — ShowTime" };

export default async function SettingsPage() {
  const { data } = await getData("/api/customer/profile");
  const u = data?.user || data || {};
  const rows = [
    [UserRound, "Nama", u.name], [Mail, "Email", u.email], [Phone, "Telepon", u.phone || "Belum diisi"],
    [ShieldCheck, "Status akun", u.status === "active" ? "Aktif" : u.status], [UserRound, "Bergabung", u.createdAt ? formatDate(u.createdAt) : "—"],
  ];
  return (
    <div className="mx-auto w-full max-w-[720px] px-4 pb-10 pt-[110px] sm:px-6">
      <h1 className="brand-text font-display text-[32px] font-extrabold sm:text-[40px]">Pengaturan</h1>
      <dl className="mt-8 flex flex-col gap-3">
        {rows.map(([Icon, k, v]) => (
          <div key={k} className="flex items-center gap-4 rounded-xl border p-4" style={{ borderColor: "var(--line-strong)", background: "var(--ink-800)" }}>
            <Icon size={20} aria-hidden="true" style={{ color: "var(--magenta-500)" }} />
            <dt className="w-32 text-sm" style={{ color: "var(--fg-muted)" }}>{k}</dt>
            <dd className="min-w-0 flex-1 truncate font-medium">{v || "—"}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-6 text-sm" style={{ color: "var(--fg-muted)" }}>Ubah profil, kata sandi, dan preferensi notifikasi sedang disiapkan.</p>
    </div>
  );
}
