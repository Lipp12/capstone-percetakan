"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, User, Phone, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const NAME_PATTERN = /^[\p{L}]+(?:\s+[\p{L}]+)*$/u;
  const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@gmail\.com$/i;
  const PHONE_PATTERN = /^08[0-9]{8,13}$/;

  function handlePhoneChange(value: string) {
    // Hanya izinkan angka
    const digitsOnly = value.replace(/[^0-9]/g, "");
    setPhone(digitsOnly);
    if (digitsOnly.length === 0) {
      setPhoneError("");
    } else if (!PHONE_PATTERN.test(digitsOnly)) {
      setPhoneError(
        "Nomor WhatsApp / Telepon harus diawali 08 dan terdiri dari 10-15 digit"
      );
    } else {
      setPhoneError("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setPasswordError("");

    if (!NAME_PATTERN.test(name.trim())) {
      setNameError("Nama Lengkap harus terdiri dari huruf");
      return;
    }

    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError("Alamat Email harus ada @gmail.com");
      return;
    }

    if (!PHONE_PATTERN.test(phone)) {
      setPhoneError(
        "Nomor WhatsApp / Telepon harus diawali 08 dan terdiri dari 10-15 digit"
      );
      return;
    }

    if (password.length < 6) {
      setPasswordError("Kata Sandi minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mendaftar");
        setLoading(false);
        return;
      }

      setSuccess(true);
      router.push("/login?registered=1");
    } catch (err) {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f4]">
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-[#ece7de] bg-[#fcf9f4]/95 backdrop-blur-md">
        <div className="relative mx-auto flex h-20 max-w-[1280px] items-center justify-between gap-3 px-4 sm:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f3ee] px-4 py-2.5 text-xs font-semibold text-[#4b4639] transition hover:bg-[#ebe8e3] sm:text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali</span>
          </Link>
          <Image
            src="/logo.png"
            alt="Faeyza Printing"
            width={280}
            height={74}
            className="absolute right-4 h-16 w-auto sm:right-10"
            priority
          />
        </div>
      </header>

      <div className="mt-20 w-full overflow-hidden bg-[#fed9e1]">
        <div className="whitespace-nowrap py-2 text-center text-[11px] font-extrabold uppercase tracking-widest text-[#795d64]">
          <span className="mx-6">✦ Percetakan &amp; Digital Printing</span>
          <span className="mx-6">Kertas Seni Impor 310gsm</span>
          <span className="mx-6">Cetak Custom &amp; Kemasan Ramah Lingkungan</span>
          <span className="mx-6">Garansi Presisi Warna 100%</span>
          <span className="mx-6">Pengiriman Aman &amp; Cepat</span>
        </div>
      </div>

      <main
        className="flex flex-1 items-center justify-center px-4 py-10 sm:px-10 sm:py-14"
        style={{
          backgroundImage: "url('/login-pattern-stars.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "360px auto",
        }}
      >
        <section className="w-full max-w-[520px]">
          <div className="overflow-hidden rounded-xl border border-[#cec6b4]/40 bg-white shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
            <div className="flex items-center px-6 pt-6">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#4b4639] transition hover:bg-[#f6f3ee]"
              >
                Masuk
              </Link>
              <span className="rounded-full bg-[#f6f3ee] px-4 py-2 text-sm font-semibold text-[#1c1c19] shadow-sm">
                Daftar Akun Baru
              </span>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#1c1c19] sm:text-[32px]">
                  Daftar Akun Baru
                </h1>
                <p className="mt-2 text-sm leading-5 text-[#4b4639]">
                  Buat akun untuk memesan cetakan dan memantau pesanan Anda.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>Pendaftaran berhasil! Mengalihkan ke halaman login...</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        const value = e.target.value;
                        setName(value);
                        setNameError(
                          value.trim() && !NAME_PATTERN.test(value.trim())
                            ? "Nama Lengkap harus terdiri dari huruf"
                            : ""
                        );
                      }}
                      placeholder="Andi Pratama"
                      className="w-full rounded-xl border border-slate-300 bg-[#F9F8F3] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#6e5d15]"
                    />
                  </div>
                  {nameError && (
                    <p className="mt-1.5 text-xs text-rose-700">{nameError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEmail(value);
                        setEmailError(
                          value.trim() && !EMAIL_PATTERN.test(value.trim())
                            ? "Alamat Email harus ada @gmail.com"
                            : ""
                        );
                      }}
                      placeholder="nama@gmail.com"
                      className="w-full rounded-xl border border-slate-300 bg-[#F9F8F3] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#6e5d15]"
                    />
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs text-rose-700">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Nomor WhatsApp / Telepon
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Phone className="h-4 w-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder="081234567890"
                      className={`w-full rounded-xl border bg-[#F9F8F3] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#6e5d15] ${
                        phoneError ? "border-rose-400 bg-rose-50/40" : "border-slate-300"
                      }`}
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-[11px] font-medium text-rose-600">
                      <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
                      <span>{phoneError}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Kata Sandi (Min. 6 Karakter)
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPassword(value);
                        setPasswordError(
                          value.length > 0 && value.length < 6
                            ? "Kata Sandi minimal 6 karakter"
                            : ""
                        );
                      }}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-[#F9F8F3] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-transparent focus:ring-2 focus:ring-[#6e5d15]"
                    />
                  </div>
                  {passwordError && (
                    <p className="mt-1.5 text-xs text-rose-700">{passwordError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || success}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F5D061] px-4 py-3 text-sm font-semibold text-slate-900 shadow-[3px_3px_0px_#1c1c19] transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-[#E8C24F] hover:shadow-[4px_4px_0px_#1c1c19] disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mendaftarkan...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sekarang</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="border-t border-[#ece7de] pt-4 text-center text-sm text-[#4b4639]">
                Sudah memiliki akun?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-[#6e5d15] hover:underline"
                >
                  Masuk di sini
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-auto w-full border-t border-[#ece7de] bg-[#f6f3ee]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-center px-4 py-5 text-xs text-[#4b4639] sm:px-10">
          <span>© {new Date().getFullYear()} Faeyza Printing. Seluruh Hak Cipta Dilindungi.</span>
        </div>
      </footer>
    </div>
  );
}
