"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Mail } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { login } from "@/lib/api";
import { safeNext } from "@/lib/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const emailRef = useRef(null);
  const passRef = useRef(null);
  const [values, setValues] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const expired = params.get("expired") === "1";

  const set = (key) => (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setValues((p) => ({ ...p, [key]: v }));
    setErrors((p) => (p[key] ? { ...p, [key]: undefined } : p));
  };

  const checkEmail = () =>
    !values.email.trim() ? "Email wajib diisi." : !EMAIL_RE.test(values.email.trim()) ? "Format email belum benar. Contoh: nama@email.com." : undefined;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setFormError("");
    const found = { email: checkEmail(), password: values.password ? undefined : "Kata sandi wajib diisi." };
    setErrors(found);
    if (found.email) return emailRef.current?.focus();
    if (found.password) return passRef.current?.focus();

    setBusy(true);
    try {
      await login(values.email.trim(), values.password, values.remember);
      router.replace(safeNext(params.get("next")));
      router.refresh();
    } catch (err) {
      setFormError(err.message);
      setValues((p) => ({ ...p, password: "" }));
      passRef.current?.focus();
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title="Masuk"
      subtitle="Lanjutkan ke akun ShowTime kamu."
      footer={
        <>
          Belum punya akun?{" "}
          <Link href="/registrasi" className="inline-block py-1 font-semibold brand-text">
            Daftar gratis
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        {expired ? <Alert tone="warn" title="Sesi berakhir">Masuk lagi untuk melanjutkan.</Alert> : null}
        {formError ? <Alert tone="danger" title="Belum bisa masuk">{formError}</Alert> : null}

        <Input
          ref={emailRef}
          id="login-email"
          name="email"
          type="email"
          label="Email"
          icon={Mail}
          autoComplete="username"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          autoFocus
          placeholder="nama@email.com"
          value={values.email}
          onChange={set("email")}
          onBlur={() => values.email && setErrors((p) => ({ ...p, email: checkEmail() }))}
          error={errors.email}
        />

        <PasswordInput
          ref={passRef}
          id="login-password"
          name="password"
          label="Kata sandi"
          autoComplete="current-password"
          placeholder="Kata sandi kamu"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
          aside={
            <button type="button" className="auth__quiet" aria-expanded={helpOpen} aria-controls="help-reset" onClick={() => setHelpOpen((v) => !v)}>
              Lupa kata sandi?
            </button>
          }
        />

        {helpOpen ? (
          <div id="help-reset">
            <Alert tone="info" title="Atur ulang kata sandi">
              Pengaturan ulang mandiri belum tersedia. Kirim email dari alamat akunmu ke{" "}
              <a href="mailto:help@showtime.id" className="inline-block py-1 font-semibold brand-text">help@showtime.id</a>, tim kami bantu.
            </Alert>
          </div>
        ) : null}

        <label className="check">
          <input type="checkbox" checked={values.remember} onChange={set("remember")} />
          <span className="check__box" aria-hidden="true"><Check size={13} strokeWidth={3} /></span>
          <span>Ingat saya di perangkat ini (7 hari)</span>
        </label>

        <Button type="submit" variant="primary" size="lg" block loading={busy} iconRight={ArrowRight}>
          {busy ? "Memeriksa..." : "Masuk"}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
