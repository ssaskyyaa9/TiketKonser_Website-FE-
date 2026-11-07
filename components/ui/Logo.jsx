import Image from "next/image";
import Link from "next/link";

// logo.png (1536×1024) punya ruang transparan lebar; isi sebenarnya hanya
// piksel x 248–1280, y 367–608. Dipotong tepat ke area itu lewat posisi absolut
// sehingga wordmark selalu utuh di tinggi berapa pun (aset tidak diubah).
const SRC_W = 1536;
const SRC_H = 1024;
const BOX = { x: 248, y: 367, w: 1032, h: 241 };

export default function Logo({ height = 40, href = "/landing", className = "" }) {
  const scale = height / BOX.h;
  const boxW = Math.round(BOX.w * scale);
  const img = (
    <span className={`relative inline-block overflow-hidden ${className}`} style={{ height, width: boxW }}>
      <Image
        src="/icons/logo.png"
        alt="ShowTime"
        width={Math.round(SRC_W * scale)}
        height={Math.round(SRC_H * scale)}
        priority
        sizes="400px"
        style={{ position: "absolute", maxWidth: "none", left: -BOX.x * scale, top: -BOX.y * scale }}
      />
    </span>
  );
  return href ? (
    <Link href={href} aria-label="ShowTime — beranda" className="inline-flex">
      {img}
    </Link>
  ) : (
    img
  );
}
