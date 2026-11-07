import { statusMeta } from "@/lib/status";

/**
 * Chip status. Utamakan `domain` + `value` agar label & warna selalu
 * mengikuti peta resmi (docs/DESIGN-SYSTEM.md §5.1). Status tidak pernah
 * hanya dibedakan lewat warna — selalu ada teks.
 */
export default function Badge({ domain, value, tone, dot = true, className = "", children }) {
  let label = children;
  let resolvedTone = tone || "neutral";

  if (domain && value !== undefined) {
    const meta = statusMeta(domain, value);
    label = meta.label;
    resolvedTone = tone || meta.tone;
  }

  return (
    <span className={`chip chip--${resolvedTone} ${className}`}>
      {dot ? <span className="chip__dot" aria-hidden="true" /> : null}
      {label}
    </span>
  );
}
