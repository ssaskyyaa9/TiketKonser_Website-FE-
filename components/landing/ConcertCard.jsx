import Image from "next/image";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import Progress from "@/components/ui/Progress";
import { buttonClass } from "@/components/ui/Button";
import { formatDate, rupiah, number } from "@/lib/format";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function dateParts(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { day: "—", month: "" };
  return { day: String(d.getDate()).padStart(2, "0"), month: MONTHS[d.getMonth()] };
}

/**
 * Kartu konser untuk landing. Satu sumber untuk seksi Rekomendasi & Trending
 * (sebelumnya markup-nya terduplikasi dua kali).
 */
export default function ConcertCard({ concert }) {
  const { day, month } = dateParts(concert.date);
  const sold = Number(concert.soldTickets) || 0;
  const total = Number(concert.totalTickets) || 0;
  const pct = total ? Math.round((sold / total) * 100) : 0;
  const almostGone = pct >= 80;

  return (
    <article className="group relative overflow-hidden card flex flex-col" style={{ background: "var(--ink-800)" }}>
      <div className="on-dark relative aspect-[4/3] w-full">
        <Image
          src={concert.image}
          alt={`Poster konser ${concert.name}`}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 300px"
          style={{ objectFit: "cover" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(10,10,15,0.96) 12%, rgba(10,10,15,0.25) 60%, rgba(10,10,15,0.45) 100%)" }}
        />

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className="text-center"
            style={{
              background: "rgba(5,3,9,0.78)",
              border: "1px solid var(--line-strong)",
              borderRadius: "var(--r-sm)",
              padding: "5px 9px",
              backdropFilter: "blur(6px)",
            }}
          >
            <span className="block font-display text-sm font-extrabold leading-none">{day}</span>
            <span className="block text-[10px] font-semibold mt-0.5" style={{ color: "var(--fg-muted)" }}>
              {month}
            </span>
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <Badge domain="concert" value={concert.status} />
        </div>

        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="font-display text-lg font-extrabold leading-tight">{concert.artist}</h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--fg-muted)" }}>
            {concert.name}
          </p>
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <dl className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center gap-2">
            <dt className="sr-only">Genre</dt>
            <dd className="truncate" style={{ color: "var(--fg-muted)" }}>
              {concert.genre}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Lokasi</dt>
            <dd className="truncate" style={{ color: "var(--fg-muted)" }}>
              {concert.venueName} · {concert.city}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="sr-only">Jadwal</dt>
            <dd style={{ color: "var(--fg-dim)" }}>
              {formatDate(concert.date)} · {concert.time} WIB
            </dd>
          </div>
        </dl>

        <div className="mt-auto">
          {total ? (
            <Progress
              value={pct}
              tone={almostGone ? "warn" : "brand"}
              label={`${number(sold)} / ${number(total)} tiket terjual`}
            />
          ) : null}

          <div className="flex items-end justify-between gap-3 mt-4 pt-3 border-t" style={{ borderColor: "var(--line)" }}>
            <div>
              <p className="text-[11px]" style={{ color: "var(--fg-dim)" }}>
                Mulai dari
              </p>
              <p className="font-display text-sm font-extrabold">{rupiah(concert.minPrice)}</p>
            </div>
            <Link href="/login" className={buttonClass({ variant: "primary", size: "sm" })}>
              Beli Tiket
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
