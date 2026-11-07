const TONE_COLORS = {
  brand: null,
  ok: "var(--ok)",
  warn: "var(--warn)",
  danger: "var(--danger)",
};

export default function Progress({ value = 0, label, showValue = false, tone = "brand", className = "" }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const flatColor = TONE_COLORS[tone];

  return (
    <div className={`w-full ${className}`}>
      {label || showValue ? (
        <div className="flex items-center justify-between gap-3 text-xs mb-1.5" style={{ color: "var(--fg-muted)" }}>
          <span>{label}</span>
          {showValue ? <span className="font-semibold">{pct}%</span> : null}
        </div>
      ) : null}
      <div
        className="progress"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={typeof label === "string" ? label : undefined}
      >
        <div
          className="progress__bar"
          style={{ width: `${pct}%`, ...(flatColor ? { backgroundImage: "none", background: flatColor } : {}) }}
        />
      </div>
    </div>
  );
}
