import Link from "next/link";
import { Download } from "lucide-react";
import { formatDateTime, rupiah } from "@/lib/format";
import { getData } from "@/lib/server/api";

export const metadata = { title: "Riwayat Pembelian — ShowTime" };

const STATUS = { paid: ["Lunas", "chip--ok"], pending: ["Menunggu bayar", "chip--warn"], expired: ["Kedaluwarsa", "chip--neutral"], cancelled: ["Dibatalkan", "chip--danger"], refunded: ["Dikembalikan", "chip--info"] };

export default async function HistoryPage() {
  const { data, status } = await getData("/api/customer/orders");
  const orders = data || [];
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 pb-10 pt-[110px] sm:px-6">
      <h1 className="brand-text font-display text-[32px] font-extrabold sm:text-[40px]">Riwayat Pembelian</h1>
      <ul className="mt-8 flex list-none flex-col gap-4 p-0">
        {orders.map((o) => {
          const [label, tone] = STATUS[o.status] || [o.status, "chip--neutral"];
          return (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-5" style={{ borderColor: "var(--line-strong)", background: "var(--ink-800)" }}>
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>{formatDateTime(o.paymentDate || o.createdAt)}{o.paymentMethod ? ` · ${String(o.paymentMethod).toUpperCase()}` : ""}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`chip ${tone}`}>{label}</span>
                <span className="text-lg font-bold">{rupiah(o.totalAmount)}</span>
                {o.status === "paid" ? <a href={`/api/customer/orders/${o.id}/pdf`} target="_blank" rel="noopener" className="btn btn--secondary btn--sm"><Download size={16} aria-hidden="true" />Tiket PDF</a> : null}
              </div>
            </li>
          );
        })}
      </ul>
      {!orders.length ? (
        <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "var(--line-strong)" }}>
          <p className="text-lg font-semibold">{status === 200 ? "Belum ada pembelian." : "Riwayat belum bisa dimuat."}</p>
          <Link href="/konser" className="btn btn--primary mt-5">Cari Konser</Link>
        </div>
      ) : null}
    </div>
  );
}
