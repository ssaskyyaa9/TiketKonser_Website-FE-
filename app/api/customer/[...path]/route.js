import { callBackend, fail, ok, readToken, sameOrigin } from "@/lib/server/bff";

// BFF pass-through ber-allowlist: cookie httpOnly → Bearer. Hanya rute di bawah yang diteruskan.
const RULES = [
  { m: "GET", re: /^favorites$/, to: () => "/api/customer/favorites" },
  { m: "POST", re: /^favorites\/(\d+)$/, to: (x) => `/api/customer/favorites/${x[1]}` },
  { m: "DELETE", re: /^favorites\/(\d+)$/, to: (x) => `/api/customer/favorites/${x[1]}` },
  { m: "GET", re: /^notifications$/, to: () => "/api/users/notifications" },
  { m: "PUT", re: /^notifications\/(\d+)\/read$/, to: (x) => `/api/users/notifications/${x[1]}/read` },
  { m: "GET", re: /^tickets\/(\d+)\/(pdf)$/, to: (x) => `/api/customer/tickets/${x[1]}/${x[2]}`, binary: true },
  { m: "GET", re: /^orders\/(\d+)\/pdf$/, to: (x) => `/api/customer/orders/${x[1]}/pdf`, binary: true },
];

async function handle(request, { params }) {
  const method = request.method;
  if (method !== "GET" && !sameOrigin(request)) return fail(403, "FORBIDDEN", "Permintaan ditolak.");

  const path = (await params).path.join("/");
  let hit = null;
  for (const r of RULES) {
    const x = r.m === method ? path.match(r.re) : null;
    if (x) { hit = { r, to: r.to(x) }; break; }
  }
  if (!hit) return fail(404, "NOT_FOUND", "Rute tidak tersedia.");

  const token = await readToken();
  if (!token) return fail(401, "NO_SESSION", "Belum masuk.");

  if (hit.r.binary) {
    try {
      const res = await fetch(`${process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5003"}${hit.to}`, {
        headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) return fail(res.status === 401 ? 401 : 404, "UPSTREAM", "Berkas tidak tersedia.");
      const headers = new Headers({ "Cache-Control": "private, no-store" });
      for (const h of ["content-type", "content-disposition"]) if (res.headers.get(h)) headers.set(h, res.headers.get(h));
      return new Response(res.body, { status: 200, headers });
    } catch {
      return fail(503, "SERVER_UNREACHABLE", "Server belum bisa dihubungi.");
    }
  }

  const { status, data } = await callBackend(hit.to, { method, token });
  if (status === 503) return fail(503, "SERVER_UNREACHABLE", "Server belum bisa dihubungi.");
  if (status >= 400) return fail(status === 401 || status === 403 ? status : 400, "UPSTREAM", data?.message || "Permintaan gagal.");
  return ok({ data: data?.data ?? null });
}

export { handle as GET, handle as POST, handle as PUT, handle as DELETE };
