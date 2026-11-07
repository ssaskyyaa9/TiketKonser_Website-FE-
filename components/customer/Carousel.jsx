"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Baris geser: 5 kolom di desktop, snap, panah muncul hanya bila ada isi tersembunyi. */
export default function Carousel({ label, children }) {
  const ref = useRef(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const go = (dir) => ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.85, behavior: "smooth" });
  const arrow = "absolute top-1/2 z-20 grid h-[38px] w-[38px] -translate-y-1/2 place-items-center rounded-full border transition-colors hover:bg-[rgba(129,56,232,.3)]";

  return (
    <div className="relative" role="region" aria-roledescription="karusel" aria-label={label}>
      <div
        ref={ref}
        onScroll={measure}
        onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}
        tabIndex={0}
        className="row-scroll grid gap-4 overflow-x-auto pb-1 focus-visible:outline-offset-4 [grid-auto-flow:column] [grid-auto-columns:78%] sm:[grid-auto-columns:calc((100%-16px)/2)] md:[grid-auto-columns:calc((100%-32px)/3)] lg:[grid-auto-columns:calc((100%-48px)/4)] xl:[grid-auto-columns:calc((100%-64px)/5)]"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>
      {!edge.start ? (
        <button type="button" onClick={() => go(-1)} aria-label={`Geser ${label} ke kiri`} className={`${arrow} -left-3`} style={{ background: "var(--ink-900)", borderColor: "var(--violet-500)", color: "var(--violet-500)" }}>
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
      ) : null}
      {!edge.end ? (
        <button type="button" onClick={() => go(1)} aria-label={`Geser ${label} ke kanan`} className={`${arrow} -right-3`} style={{ background: "var(--ink-900)", borderColor: "var(--violet-500)", color: "var(--violet-500)" }}>
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
