"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Building2, Check, Clock, Mail, Phone, Ticket, UserRound } from "lucide-react";
import AuthLayout from "@/components/auth/AuthLayout";
import PasswordInput from "@/components/auth/PasswordInput";
import PasswordStrength, { scorePassword } from "@/components/auth/PasswordStrength";
import Alert from "@/components/ui/Alert";
import Button, { buttonClass } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { register } from "@/lib/api";

const TYPES = [
  { value: "customer", label: "Penonton", hint: "Beli tiket, simpan favorit", icon: Ticket },
  { value: "organizer", label: "Penyelenggara", hint: "Buat dan kelola konser", icon: Building2 },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (v) => String(v || "").replace(/\D/g, "");

const EMPTY = {
  name: "", email: "", phone: "", password: "", confirmPassword: "",
  companyName: "", city: "", website: "", instagram: "", address: "", description: "",
  bankName: "", bankAccount: "", bankHolder: "",
};

// Aturan sama dengan route handler /api/auth/register (server tetap memvalidasi ulang).
function validateAccount(v) {
  const e = {};
  const name = v.name.trim();
  if (!name) e.name = "Nama wajib diisi.";
  else if (name.length < 2 || name.length > 100) e.name = "Nama harus 2–100 karakter.";
  if (!v.email.trim()) e.email = "Email wajib diisi.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Format email belum benar. Contoh: nama@email.com.";
  if (v.phone.trim() && (digits(v.phone).length < 10 || digits(v.phone).length > 15)) e.phone = "Nomor telepon harus 10–15 angka.";
  if (!v.password) e.password = "Kata sandi wajib diisi.";
  else if (v.password.length < 8) e.password = "Kata sandi minimal 8 karakter.";
  else if (scorePassword(v.password) < 2) e.password = "Kata sandi terlalu mudah ditebak. Tambahkan variasi karakter.";
  if (v.confirmPassword !== v.password) e.confirmPassword = "Ulangi kata sandi dengan tulisan yang sama.";
  return e;
}
function validateCompany(v) {
  const e = {};
  if (!v.companyName.trim()) e.companyName = "Nama perusahaan atau komunitas wajib diisi.";
  if (!v.city.trim()) e.city = "Kota wajib diisi.";
  if (!v.address.trim()) e.address = "Alamat wajib diisi.";
  return e;
}

export default function RegisterPage() {
  const router = useRouter();
  const formRef = useRef(null);
  const [type, setType] = useState("customer");
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);

  const isOrg = type === "organizer";
  const lastStep = isOrg ? 2 : 1;

  const set = (key) => (e) => {
    setValues((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => (p[key] ? { ...p, [key]: undefined } : p));
  };

  const focusFirst = (found) => {
    const first = Object.keys(found).find((k) => found[k]);
    if (first) formRef.current?.querySelector(`[name="${first}"]`)?.focus();
  };

  const pickType = (next) => {
    setType(next);
    setStep(1);
    setErrors({});
    setFormError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setFormError("");

    const account = validateAccount(values);
    if (step === 1) {
      setErrors(account);
      if (Object.values(account).some(Boolean)) return focusFirst(account);
      if (isOrg) return setStep(2);
    }

    const company = isOrg ? validateCompany(values) : {};
    if (isOrg && Object.values(company).some(Boolean)) {
      setErrors(company);
      return focusFirst(company);
    }

    setBusy(true);
    try {
      const { confirmPassword, ...payload } = values;
      void confirmPassword;
      const data = await register({ type, ...payload });
      if (data.pending) {
        setPending({ name: data.name, companyName: data.companyName });
        setBusy(false);
        return;
      }
      router.replace("/beranda");
      router.refresh();
    } catch (err) {
      setFormError(err.message);
      if (err.code === "EMAIL_TAKEN") {
        setStep(1);
        setErrors({ email: "Email ini sudah terdaftar." });
      }
      setBusy(false);
    }
  };

  if (pending) {
    return (
      <AuthLayout title="Pendaftaran terkirim" subtitle="Satu langkah lagi sebelum bisa masuk." backHref="/login" backLabel="Masuk">
        <div className="flex flex-col gap-5">
          <Alert tone="ok" title={`Terima kasih, ${pending.name}.`}>
            Akun <strong>{pending.companyName}</strong> sudah kami terima.
          </Alert>
          <p className="flex items-start gap-3 text-sm" style={{ color: "var(--fg-muted)" }}>
            <Clock size={18} strokeWidth={1.75} aria-hidden="true" style={{ color: "var(--warn)", flexShrink: 0, marginTop: 1 }} />
            Tim ShowTime memverifikasi data perusahaanmu dulu. Setelah disetujui, kamu bisa masuk dan mulai membuat konser.
          </p>
          <Link href="/login" className={buttonClass({ variant: "primary", size: "lg", block: true })}>
            Ke halaman masuk
            <ArrowRight size={18} strokeWidth={1.75} aria-hidden="true" />
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Buat akun"
      subtitle={isOrg ? `Langkah ${step} dari 2 — ${step === 1 ? "data akunmu" : "data penyelenggara"}.` : "Gratis, selesai dalam satu menit."}
      footer={
        <>
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold brand-text">
            Masuk
          </Link>
        </>
      }
    >
      <form ref={formRef} className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        {formError ? <Alert tone="danger" title="Pendaftaran belum bisa diproses">{formError}</Alert> : null}

        {step === 1 ? (
          <>
            <fieldset className="m-0 p-0 border-0 min-w-0">
              <legend className="field__label mb-2">Daftar sebagai</legend>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(({ value, label, hint, icon: Icon }) => (
                  <label key={value} className="choice">
                    <input type="radio" name="type" value={value} checked={type === value} onChange={() => pickType(value)} />
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                      {label}
                    </span>
                    <span className="block text-xs mt-1" style={{ color: "var(--fg-muted)" }}>{hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Input id="reg-name" name="name" label="Nama lengkap" required icon={UserRound} autoComplete="name" autoFocus placeholder="Contoh: Rara Anjani" value={values.name} onChange={set("name")} error={errors.name} />
            <Input id="reg-email" name="email" type="email" label="Email" required icon={Mail} autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="nama@email.com" value={values.email} onChange={set("email")} error={errors.email} />
            <Input id="reg-phone" name="phone" type="tel" inputMode="tel" label="Nomor telepon" hint="Opsional. Untuk kabar penting soal tiket." icon={Phone} autoComplete="tel" placeholder="08xx xxxx xxxx" value={values.phone} onChange={set("phone")} error={errors.phone} />

            <div>
              <PasswordInput id="reg-password" name="password" label="Kata sandi" required autoComplete="new-password" placeholder="Minimal 8 karakter" value={values.password} onChange={set("password")} error={errors.password} />
              <PasswordStrength value={values.password} />
            </div>
            <PasswordInput id="reg-confirm" name="confirmPassword" label="Ulangi kata sandi" required autoComplete="new-password" placeholder="Tulis ulang kata sandi" value={values.confirmPassword} onChange={set("confirmPassword")} error={errors.confirmPassword} />
          </>
        ) : (
          <>
            <Input id="reg-company" name="companyName" label="Nama perusahaan atau komunitas" required icon={Building2} autoComplete="organization" autoFocus placeholder="Contoh: Starlight Live Indonesia" value={values.companyName} onChange={set("companyName")} error={errors.companyName} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input id="reg-city" name="city" label="Kota" required placeholder="Jakarta" autoComplete="address-level2" value={values.city} onChange={set("city")} error={errors.city} />
              <Input id="reg-instagram" name="instagram" label="Instagram" hint="Opsional" placeholder="@namaakun" value={values.instagram} onChange={set("instagram")} />
            </div>
            <Textarea id="reg-address" name="address" label="Alamat" required rows={2} autoComplete="street-address" placeholder="Alamat lengkap perusahaan" value={values.address} onChange={set("address")} error={errors.address} />
            <Input id="reg-website" name="website" label="Situs web" hint="Opsional" placeholder="namadomain.id" value={values.website} onChange={set("website")} />
            <Textarea id="reg-desc" name="description" label="Tentang kamu" hint="Opsional. Pengalaman mengadakan acara." rows={3} value={values.description} onChange={set("description")} />

            <details className="rounded-[var(--r-md)] border px-4 py-3" style={{ borderColor: "var(--line-strong)" }}>
              <summary className="cursor-pointer text-sm font-semibold">Rekening pencairan dana (opsional)</summary>
              <div className="flex flex-col gap-4 mt-4">
                <Input id="reg-bank" name="bankName" label="Nama bank" placeholder="Bank Mandiri" value={values.bankName} onChange={set("bankName")} />
                <Input id="reg-acc" name="bankAccount" label="Nomor rekening" inputMode="numeric" placeholder="1234567890" value={values.bankAccount} onChange={set("bankAccount")} />
                <Input id="reg-holder" name="bankHolder" label="Nama pemilik rekening" placeholder="Sesuai buku tabungan" value={values.bankHolder} onChange={set("bankHolder")} />
                <p className="text-xs" style={{ color: "var(--fg-dim)" }}>Bisa dilengkapi nanti sebelum menarik dana.</p>
              </div>
            </details>
          </>
        )}

        <div className="flex gap-3 mt-1">
          {step === 2 ? (
            <Button variant="secondary" size="lg" icon={ArrowLeft} onClick={() => { setStep(1); setErrors({}); }}>
              Kembali
            </Button>
          ) : null}
          <Button type="submit" variant="primary" size="lg" block loading={busy} iconRight={step === lastStep ? Check : ArrowRight}>
            {busy ? "Mendaftarkan..." : step < lastStep ? "Lanjut" : isOrg ? "Daftar penyelenggara" : "Buat akun"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
