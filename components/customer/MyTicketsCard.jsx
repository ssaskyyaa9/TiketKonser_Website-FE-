import Link from "next/link";
import { Ticket } from "lucide-react";
import { dayBadge, jamWib, splitName } from "@/lib/concert";

/** Kartu "Tiket Saya": kosong → ajakan; terisi → maks 2 tiket mendatang. */
export default function MyTicketsCard({ tickets = [] }) {
  return (
    <section aria-label="Tiket Saya" style={{ borderRadius: 14, border: "1px solid var(--violet-500)", background: "rgba(15,11,28,.82)", backdropFilter: "blur(6px)" }}>
      <div className="flex items-center justify-between border-b px-5 py-3.5" style={{ borderColor: "var(--line-strong)" }}>
        <h2 className="flex items-center gap-3 text-base font-medium"><Ticket size={22} strokeWidth={1.75} aria-hidden="true" />Tiket Saya</h2>
        <Link href="/tiket-saya" className="inline-flex items-center py-1.5 text-sm underline-offset-4 hover:underline" style={{ color: "#e04bd0" }}>Lihat semua &rarr;</Link>
      </div>
      {tickets.length ? (
        <ul className="m-0 list-none p-0">
          {tickets.slice(0, 2).map((t) => {
            const c = t.concert || {};
            const { day, mon } = dayBadge(c.date);
            return (
              <li key={t.id} className="flex items-center gap-3 border-b px-5 py-3 last:border-b-0" style={{ borderColor: "var(--line)" }}>
                <span className="grid w-11 place-items-center text-center leading-none"><span className="text-lg font-extrabold">{day}</span><span className="text-[10px] font-semibold">{mon}</span></span>
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{splitName(c.name).title || "Konser"}</span><span className="block truncate text-xs" style={{ color: "var(--fg-muted)" }}>{[jamWib(c.time), c.venue?.name || c.venueName].filter(Boolean).join(" · ") || t.ticketNumber}</span></span>
                <Link href="/tiket-saya" className="btn btn--secondary" style={{ height: 32, padding: "0 12px", fontSize: 12 }}>Lihat QR</Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-5 py-5">
          <p className="text-[15px] font-bold">Belum ada tiket?</p>
          <p className="mt-1 text-xs" style={{ color: "var(--fg-muted)" }}>Yuk, cari konser favoritmu dan pesan sekarang</p>
          <Link href="/konser" className="btn btn--primary mt-4" style={{ height: 38, padding: "0 28px", borderRadius: 6 }}>Cari Konser</Link>
        </div>
      )}
    </section>
  );
}
