"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

/** Simpan/hapus favorit. Optimistik: berubah dulu, kembali bila server menolak. */
export default function BookmarkButton({ concertId, initial = false, size = 36, label = "konser ini", className = "" }) {
  const [saved, setSaved] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      const res = await fetch(`/api/customer/favorites/${concertId}`, { method: next ? "POST" : "DELETE", credentials: "same-origin" });
      if (!res.ok && !(next && res.status === 400)) throw new Error();
      setMsg(next ? "Disimpan ke Tiket Disimpan" : "Dihapus dari Tiket Disimpan");
    } catch {
      setSaved(!next);
      setMsg("Gagal menyimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? `Hapus ${label} dari Tiket Disimpan` : `Simpan ${label} ke Tiket Disimpan`}
        className={`relative z-10 grid place-items-center rounded-[10px] transition-transform duration-150 active:scale-90 hover:bg-white/10 ${className}`}
        style={{ width: size, height: size, color: "#fff" }}
      >
        <Bookmark size={Math.round(size * 0.58)} strokeWidth={1.9} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
      </button>
      <span className="sr-only" role="status">{msg}</span>
    </>
  );
}
