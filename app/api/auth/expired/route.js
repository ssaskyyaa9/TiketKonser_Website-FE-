import { NextResponse } from "next/server";
import { dropToken } from "@/lib/server/bff";

// Tujuan redirect dari /akun saat token ditolak backend: hapus cookie basi
// (Server Component tidak boleh menulis cookie) lalu kembali ke /login.
export async function GET(request) {
  await dropToken();
  const url = new URL("/login", request.url);
  url.searchParams.set("expired", "1");
  return NextResponse.redirect(url);
}
