import { NextResponse } from "next/server";

// Gerbang cepat (hanya cek keberadaan cookie). Validasi sungguhan dilakukan
// di Server Component /akun lewat backend /api/auth/me — cookie palsu = ditolak di sana.
const COOKIE = process.env.NODE_ENV === "production" ? "__Host-st_session" : "st_session";

export function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const has = Boolean(request.cookies.get(COOKIE)?.value);

  if (pathname.startsWith("/akun") && !has) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if ((pathname === "/login" || pathname === "/registrasi") && has) {
    return NextResponse.redirect(new URL("/akun", request.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/akun/:path*", "/login", "/registrasi"] };
