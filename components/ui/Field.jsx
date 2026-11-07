import { CircleAlert } from "lucide-react";

// Primitif form ShowTime. Label selalu eksplisit (bukan sekadar placeholder),
// error diumumkan ke screen reader lewat role="alert".

export function Field({ label, htmlFor, hint, error, required = false, aside, children, className = "" }) {
  return (
    <div className={`field ${className}`}>
      {label ? (
        <div className="field__row">
          <label className="field__label" htmlFor={htmlFor}>
            {label}
            {required ? (
              <span className="field__req" aria-hidden="true">
                *
              </span>
            ) : null}
          </label>
          {aside}
        </div>
      ) : null}
      {children}
      {error ? (
        <p className="field__error" id={htmlFor ? `${htmlFor}-err` : undefined} role="alert">
          <CircleAlert size={14} strokeWidth={2} aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p className="field__hint" id={htmlFor ? `${htmlFor}-hint` : undefined}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id, { error, hint }) {
  if (error) return id ? `${id}-err` : undefined;
  if (hint) return id ? `${id}-hint` : undefined;
  return undefined;
}

export function Input({
  label,
  id,
  hint,
  error,
  required = false,
  icon: Icon,
  trailing,
  aside,
  className = "",
  ...rest
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required} aside={aside}>
      <div className={`control ${error ? "control--error" : ""}`}>
        {Icon ? (
          <span className="control__icon">
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
        ) : null}
        <input
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { error, hint })}
          {...rest}
        />
        {trailing ? <span className="control__trailing">{trailing}</span> : null}
      </div>
    </Field>
  );
}

export function Textarea({ label, id, hint, error, required = false, className = "", rows = 4, ...rest }) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <div className={`control ${error ? "control--error" : ""}`} style={{ alignItems: "flex-start" }}>
        <textarea
          id={id}
          rows={rows}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { error, hint })}
          {...rest}
        />
      </div>
    </Field>
  );
}

export function Select({ label, id, hint, error, required = false, children, className = "", ...rest }) {
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <div className={`control ${error ? "control--error" : ""}`}>
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, { error, hint })}
          {...rest}
        >
          {children}
        </select>
      </div>
    </Field>
  );
}
