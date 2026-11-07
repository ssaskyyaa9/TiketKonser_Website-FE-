"use client";

import { useEffect } from "react";
import Link from "next/link";
import StateScreen from "@/components/layout/StateScreen";
import Alert from "@/components/ui/Alert";
import { buttonClass } from "@/components/ui/Button";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Catat ke console agar bisa dilacak saat pengembangan.
    console.error(error);
  }, [error]);

  return (
    <StateScreen
      title="Ada gangguan sebentar"
      description="Halaman ini gagal dimuat. Kamu bisa coba lagi — biasanya langsung berhasil di percobaan berikutnya."
      actions={
        <>
          <button type="button" onClick={() => reset()} className={buttonClass({ variant: "primary" })}>
            Coba lagi
          </button>
          <Link href="/landing" className={buttonClass({ variant: "secondary" })}>
            Ke beranda
          </Link>
        </>
      }
    >
      <Alert tone="warn" title="Kalau terus terjadi">
        Hubungi{" "}
        <a href="mailto:help@showtime.id" className="underline" style={{ color: "var(--fg)" }}>
          help@showtime.id
        </a>{" "}
        dan sebutkan halaman yang kamu buka.
      </Alert>
    </StateScreen>
  );
}
