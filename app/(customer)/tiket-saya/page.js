import Link from "next/link";
import { Download, QrCode } from "lucide-react";
import { dayBadge, jamWib, placeLabel, splitName } from "@/lib/concert";
import { rupiah } from "@/lib/format";
import { getData } from "@/lib/server/api";

export const metadata = { title: "Tiket Saya — ShowTime" };

const STATUS = { active: ["Aktif", "chip--ok"], used: ["Sudah dipakai", "chip--neutral"], expired: ["Kedaluwarsa", "chip--warn"], refunded: ["Dikembalikan", "chip--info"], cancelled: ["Dibatalkan", "chip--danger"] };

export default async function MyTicketsPage() {
  const { data, status } = await getData("/api/customer/tickets");
  const tickets = data || [];
  // Endpoint QR mengembalikan JSON {data:{qrCode: dataURL}} → ambil di server per tiket aktif.
  const qr = Object.fromEntries(await Promise.all(tickets.filter((t) => t.status === "active").map(async (t) => [t.id, (await getData(`/api/customer/tickets/${t.id}/qr`)).data?.qrCode || null])));
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-[110px] sm:px-6">
      <h1 className="brand-text font-display text-[32px] font-extrabold sm:text-[40px]">Tiket Saya</h1>
      <p className="mt-1" style={{ color: "var(--fg-muted)" }}>Tunjukkan kode QR di pintu masuk.</p>
      <ul className="mt-8 flex list-none flex-col gap-5 p-0">
        {tickets.map((t) => {
          const c = t.concert || {};
          const { title } = splitName(c.name);
          const { day, mon } = dayBadge(c.date);
          const [label, tone] = STATUS[t.status] || [t.status, "chip--neutral"];
          return (
            <li key={t.id} className="card card--ticket grid gap-5 p-5 sm:grid-cols-[1fr_auto]" style={{ ["--notch-top"]: "50%" }}>
              <div>
                <div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-2xl font-bold">{title || "Konser"}</h2><span className={`chip ${tone}`}>{label}</span></div>
                <p className="mt-2 text-sm" style={{ color: "var(--fg-muted)" }}>{day} {mon} · {jamWib(c.time)} · {placeLabel(c) || c.venue?.name}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <div><dt style={{ color: "var(--fg-dim)" }}>Kategori</dt><dd className="font-semibold">{t.category}</dd></div>
                  <div><dt style={{ color: "var(--fg-dim)" }}>Nomor tiket</dt><dd className="font-semibold">{t.ticketNumber}</dd></div>
                  <div><dt style={{ color: "var(--fg-dim)" }}>Harga</dt><dd className="font-semibold">{rupiah(t.price)}</dd></div>
                </dl>
                <a href={`/api/customer/tickets/${t.id}/pdf`} target="_blank" rel="noopener" className="btn btn--secondary mt-5"><Download size={16} aria-hidden="true" />Unduh PDF</a>
              </div>
              <div className="grid place-items-center">
                {qr[t.id] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qr[t.id]} alt={`Kode QR tiket ${t.ticketNumber}`} width={160} height={160} className="rounded-lg bg-white p-2" />
                ) : <QrCode size={64} aria-hidden="true" style={{ color: "var(--fg-dim)" }} />}
              </div>
            </li>
          );
        })}
      </ul>
      {!tickets.length ? (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "var(--line-strong)" }}>
          <p className="text-lg font-semibold">{status === 200 ? "Belum ada tiket." : "Tiket belum bisa dimuat."}</p>
          <Link href="/konser" className="btn btn--primary mt-5">Cari Konser</Link>
        </div>
      ) : null}
    </div>
  );
}
