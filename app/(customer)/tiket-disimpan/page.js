import Link from "next/link";
import ConcertRow from "@/components/customer/ConcertRow";
import { getData } from "@/lib/server/api";

export const metadata = { title: "Tiket Disimpan — ShowTime" };

export default async function SavedPage() {
  const { data, status } = await getData("/api/customer/favorites");
  const rows = (data || []).filter((f) => f.concert);
  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 pb-10 pt-[110px] sm:px-6">
      <h1 className="brand-text font-display text-[32px] font-extrabold sm:text-[40px]">Tiket Disimpan</h1>
      <p className="mt-1" style={{ color: "var(--fg-muted)" }}>Konser yang kamu tandai. Ikon simpan di sebelah kanan menghapusnya dari daftar.</p>
      <div className="mt-8 flex flex-col gap-4">
        {rows.map((f) => <ConcertRow key={f.id} concert={f.concert} saved />)}
        {!rows.length ? (
          <div className="rounded-2xl border p-10 text-center" style={{ borderColor: "var(--line-strong)" }}>
            <p className="text-lg font-semibold">{status === 200 ? "Belum ada konser tersimpan." : "Daftar belum bisa dimuat."}</p>
            <p className="mt-1 text-sm" style={{ color: "var(--fg-muted)" }}>Tekan ikon simpan di kartu konser untuk menyimpannya di sini.</p>
            <Link href="/konser" className="btn btn--primary mt-5">Cari Konser</Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
