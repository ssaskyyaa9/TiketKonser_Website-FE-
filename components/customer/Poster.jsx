import Image from "next/image";
import { imageUrl } from "@/lib/server/api";

// Poster konser. Bila `thumbnail` ada → foto; bila tidak → poster bergaya (gradien dari
// hash nama + inisial) sehingga tidak perlu foto berhak cipta.
const PALETTES = [
  ["#3b0a6b", "#d946ef"], ["#1b1860", "#8b5cf6"], ["#4a0d4f", "#f73be1"],
  ["#0b2a6b", "#8138e8"], ["#5b0f3a", "#fa2f84"], ["#24104f", "#6d5bff"],
];

function hash(s = "") {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
const initials = (s = "") => s.split(" — ")[0].split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function Poster({ name, thumbnail, sizes = "240px", priority = false, className = "" }) {
  const src = imageUrl(thumbnail);
  if (src) {
    return (
      <span className={`absolute inset-0 block ${className}`}>
        <Image src={src} alt="" fill unoptimized sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />
      </span>
    );
  }
  const [c1, c2] = PALETTES[hash(name) % PALETTES.length];
  const angle = 20 + (hash(name) % 50);
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-0 grid place-items-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 70% at ${30 + (hash(name) % 40)}% 18%, ${c2} 0%, transparent 62%), linear-gradient(${180 + angle}deg, ${c1}, #08060f 85%)`,
      }}
    >
      <span className="font-display" style={{ fontSize: "clamp(40px, 9vw, 92px)", fontWeight: 800, color: "rgba(255,255,255,.16)", letterSpacing: "-0.04em" }}>
        {initials(name)}
      </span>
    </span>
  );
}
