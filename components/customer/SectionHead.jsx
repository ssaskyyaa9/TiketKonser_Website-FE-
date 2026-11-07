import Link from "next/link";

/** Judul seksi: bar gradien + teks bergradien + subjudul + "Lihat semua →". */
export default function SectionHead({ id, title, subtitle, href, hrefLabel = "Lihat semua" }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 id={id} className="flex items-center gap-3 font-display text-[26px] font-bold sm:text-[32px]">
          <span aria-hidden="true" style={{ width: 5, height: 22, borderRadius: 2, background: "linear-gradient(180deg,#6D19B0,#B900A3)" }} />
          <span className="brand-text">{title}</span>
        </h2>
        {subtitle ? <p className="mt-1.5 text-base sm:text-2xl" style={{ color: "rgba(244,241,251,.88)" }}>{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="text-sm font-medium underline-offset-4 hover:underline" style={{ color: "#e04bd0" }}>
          {hrefLabel} &rarr;
        </Link>
      ) : null}
    </div>
  );
}
