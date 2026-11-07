import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

const TONES = {
  info: { color: "var(--info)", bg: "rgba(96, 165, 250, 0.1)", border: "rgba(96, 165, 250, 0.35)", Icon: Info },
  ok: { color: "var(--ok)", bg: "rgba(52, 211, 153, 0.1)", border: "rgba(52, 211, 153, 0.35)", Icon: CircleCheck },
  warn: { color: "var(--warn)", bg: "rgba(251, 191, 36, 0.1)", border: "rgba(251, 191, 36, 0.35)", Icon: TriangleAlert },
  danger: { color: "var(--danger)", bg: "rgba(251, 113, 133, 0.1)", border: "rgba(251, 113, 133, 0.4)", Icon: CircleAlert },
};

/** Kotak pesan penting (error/sukses/info) dengan teks — tidak pernah warna saja. */
export default function Alert({ tone = "info", title, children, className = "" }) {
  const config = TONES[tone] || TONES.info;
  const Icon = config.Icon;
  const isUrgent = tone === "danger" || tone === "warn";

  return (
    <div
      role={isUrgent ? "alert" : "status"}
      className={`flex items-start gap-3 px-4 py-3 ${className}`}
      style={{ borderRadius: "var(--r-md)", background: config.bg, border: `1px solid ${config.border}` }}
    >
      <Icon size={18} strokeWidth={1.75} style={{ color: config.color, flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
      <div className="min-w-0 text-sm">
        {title ? (
          <p className="font-semibold" style={{ color: "var(--fg)" }}>
            {title}
          </p>
        ) : null}
        {children ? (
          <div style={{ color: "var(--fg-muted)" }} className={title ? "mt-1" : undefined}>
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
