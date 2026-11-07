const COMMON = ["password", "12345678", "123456789", "qwertyui", "iloveyou", "admin123", "11111111"];
const LABEL = ["", "Lemah", "Cukup", "Baik", "Kuat"];

/** Skor 0–4 dari panjang + variasi karakter. Heuristik lokal, bukan jaminan keamanan. */
export function scorePassword(pw) {
  if (!pw) return 0;
  if (COMMON.some((c) => pw.toLowerCase().includes(c))) return 1;
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++;
  return Math.max(1, Math.min(4, s));
}

export default function PasswordStrength({ value }) {
  const level = scorePassword(value);
  if (!value) return null;
  return (
    <div aria-live="polite">
      <div className="strength" data-level={level} aria-hidden="true">
        <i /><i /><i /><i />
      </div>
      <p className="mt-1.5 text-xs" style={{ color: "var(--fg-muted)" }}>
        Kekuatan: <strong style={{ color: "var(--fg)" }}>{LABEL[level]}</strong>
        {level < 3 ? " — tambah panjang atau campur huruf besar, angka, simbol." : ""}
      </p>
    </div>
  );
}
