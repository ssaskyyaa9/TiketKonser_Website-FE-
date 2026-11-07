import Link from "next/link";
import StateScreen from "@/components/layout/StateScreen";
import { buttonClass } from "@/components/ui/Button";

export const metadata = {
  title: "Halaman tidak ditemukan — ShowTime",
};

export default function NotFound() {
  return (
    <StateScreen
      code="404"
      title="Halaman ini tidak ada"
      description="Mungkin tautannya salah ketik, atau halaman sudah dipindahkan. Tenang, tiketmu tetap aman."
      actions={
        <>
          <Link href="/landing" className={buttonClass({ variant: "primary" })}>
            Ke beranda
          </Link>
          <Link href="/login" className={buttonClass({ variant: "secondary" })}>
            Masuk ke akun
          </Link>
        </>
      }
    />
  );
}
