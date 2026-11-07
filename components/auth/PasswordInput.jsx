"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/Field";

/** Input kata sandi: tampil/sembunyi (aria-pressed) + peringatan Caps Lock. */
export default function PasswordInput({ id, label, error, hint, aside, onKeyUp, onBlur, ...rest }) {
  const [shown, setShown] = useState(false);
  const [caps, setCaps] = useState(false);

  return (
    <div>
      <Input
        id={id}
        label={label}
        error={error}
        hint={hint}
        aside={aside}
        icon={Lock}
        type={shown ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        onKeyUp={(e) => {
          setCaps(e.getModifierState?.("CapsLock") || false);
          onKeyUp?.(e);
        }}
        onBlur={(e) => {
          setCaps(false);
          onBlur?.(e);
        }}
        trailing={
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            style={{ height: 32, padding: "0 8px" }}
            onClick={() => setShown((v) => !v)}
            aria-pressed={shown}
            aria-label={shown ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {shown ? <EyeOff size={18} strokeWidth={1.75} aria-hidden="true" /> : <Eye size={18} strokeWidth={1.75} aria-hidden="true" />}
          </button>
        }
        {...rest}
      />
      {caps ? (
        <p className="mt-2 flex items-center gap-2 text-xs" style={{ color: "var(--warn)" }} role="status">
          <TriangleAlert size={14} strokeWidth={2} aria-hidden="true" />
          Caps Lock menyala.
        </p>
      ) : null}
    </div>
  );
}
