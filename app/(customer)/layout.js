import { redirect } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import Alert from "@/components/ui/Alert";
import { callBackend, publicUser, readToken } from "@/lib/server/bff";

export const metadata = { robots: { index: false } };

// Gerbang area penonton: cookie → /me ke backend → harus role customer.
export default async function CustomerLayout({ children }) {
  const token = await readToken();
  if (!token) redirect("/login");

  const { status, data } = await callBackend("/api/auth/me", { token });
  if (status === 401 || status === 403) redirect("/api/auth/expired");
  const user = status === 200 ? data?.user : null;
  if (user && user.role !== "customer") redirect("/akun");

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-5 py-24">
        <Alert tone="danger" title="Server belum bisa dihubungi">Sesimu masih tersimpan. Muat ulang halaman beberapa saat lagi.</Alert>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--ink-900)" }}>
      <CustomerHeader user={publicUser(user)} />
      <main id="konten" className="flex-1">{children}</main>
      <footer className="mx-auto w-full max-w-[var(--page-max)] px-4 pb-10 pt-16 sm:px-6">
        <p className="text-lg" style={{ color: "#e04bd0" }}>Showtime 2026</p>
      </footer>
    </div>
  );
}
