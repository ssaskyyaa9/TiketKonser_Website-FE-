const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getConcerts() {
  const res = await fetch(`${BASE_URL}/api/concerts`);

  if (!res.ok) {
    throw new Error("Gagal mengambil data konser");
  }

  return res.json();
}