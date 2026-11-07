// Tombol standar ShowTime. Semua warna/ukuran berasal dari token di globals.css.

const VARIANTS = {
  primary: "btn--primary",
  secondary: "btn--secondary",
  ghost: "btn--ghost",
  danger: "btn--danger",
};

const SIZES = {
  sm: "btn--sm",
  md: "btn--md",
  lg: "btn--lg",
};

export function buttonClass({ variant = "primary", size = "md", block = false, className = "" } = {}) {
  return [
    "btn",
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || SIZES.md,
    block ? "btn--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * @param {object} props
 * @param {"primary"|"secondary"|"ghost"|"danger"} [props.variant]
 * @param {"sm"|"md"|"lg"} [props.size]
 * @param {boolean} [props.block] lebar penuh
 * @param {boolean} [props.loading] tampilkan spinner & nonaktifkan tombol
 * @param {import("react").ElementType} [props.icon] ikon lucide di kiri teks
 * @param {import("react").ElementType} [props.iconRight] ikon lucide di kanan teks
 */
export default function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  icon: Icon,
  iconRight: IconRight,
  className = "",
  children,
  type = "button",
  disabled,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClass({ variant, size, block, className })}
      {...rest}
    >
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : Icon ? (
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
      {children ? <span>{children}</span> : null}
      {IconRight && !loading ? (
        <IconRight size={18} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
    </button>
  );
}
