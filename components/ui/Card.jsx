// Kartu ShowTime. Varian `ticket` menambahkan lekukan sobekan tiket (notch)
// sebagai motif khas produk.

const BASE = {
  plain: "card",
  raised: "card card--raised",
  ticket: "card card--ticket",
};

export default function Card({ variant = "plain", as: As = "div", className = "", children, ...rest }) {
  return (
    <As className={`${BASE[variant] || BASE.plain} ${className}`} {...rest}>
      {children}
    </As>
  );
}

export function CardHeader({ title, description, action, className = "" }) {
  return (
    <div
      className={`flex items-start justify-between gap-4 px-5 py-4 border-b ${className}`}
      style={{ borderColor: "var(--line)" }}
    >
      <div className="min-w-0">
        <h2 className="font-display text-base font-bold leading-tight">{title}</h2>
        {description ? (
          <p className="text-sm mt-1" style={{ color: "var(--fg-muted)" }}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 flex items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function CardBody({ className = "", children }) {
  return <div className={`p-5 ${className}`}>{children}</div>;
}

export function CardFooter({ className = "", children }) {
  return (
    <div
      className={`px-5 py-4 border-t flex flex-wrap items-center gap-2 ${className}`}
      style={{ borderColor: "var(--line)" }}
    >
      {children}
    </div>
  );
}

/** Judul bagian ringkas: garis gradien + label. Dipakai di landing & dashboard. */
export function SectionTitle({ children, as: As = "h2", className = "" }) {
  return (
    <As className={`flex items-center gap-3 font-display font-extrabold ${className}`}>
      <span
        aria-hidden="true"
        style={{
          width: 5,
          height: 20,
          borderRadius: 999,
          backgroundImage: "linear-gradient(180deg, var(--violet-600) 0%, var(--magenta-500) 100%)",
        }}
      />
      <span className="brand-text">{children}</span>
    </As>
  );
}
