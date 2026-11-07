import { redirect } from "next/navigation";

// Halaman beranda mengarahkan ke landing page publik.
export default function Home() {
  redirect("/landing");
}
