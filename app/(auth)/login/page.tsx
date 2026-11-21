"use client";

import { useEffect, useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Phone,
  Check,
  Leaf,
  Package,
  ShieldCheck,
  MessageCircle,
  Sparkles,
} from "lucide-react";

type Tab = "login" | "register";
type LoginMode = "contact" | "customer-id";
type AccountType = "personal" | "business";

interface LoginFormState {
  identifier: string;
  password: string;
  remember: boolean;
}

interface RegisterFormState {
  accountType: AccountType;
  name: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  agree: boolean;
}

export default function LoginPage() {
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("login");
  const [loginMode, setLoginMode] = useState<LoginMode>("contact");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState("");

  const [loginForm, setLoginForm] = useState<LoginFormState>({
    identifier: "",
    password: "",
    remember: false,
  });

  const [registerForm, setRegisterForm] = useState<RegisterFormState>({
    accountType: "personal",
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setLoginMode(params.get("mode") === "customer-id" ? "customer-id" : "contact");
    if (params.get("registered") === "1") {
      setSuccess("Pendaftaran berhasil. Silakan masuk dengan akun baru.");
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      setError("Silakan isi email / nomor WhatsApp / ID pelanggan dan kata sandi");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: loginForm.identifier,
        password: loginForm.password,
      });

      if (res?.error) {
        setError(
          res.error === "CredentialsSignin"
            ? "Email / nomor WhatsApp / ID pelanggan atau kata sandi salah. Silakan periksa kembali."
            : res.error
        );
        setLoading(false);
        return;
      }

      const session = await getSession();
      const role = (session?.user as any)?.role;

      let destination = "/dashboard";
      if (role === "ADMIN") {
        destination = "/admin/dashboard";
      } else if (role === "OPERATOR") {
        destination = "/admin/production";
      }

      window.location.replace(destination);
    } catch (err) {
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    const { name, phone, email, password, confirmPassword, agree } = registerForm;

    if (!name || !phone || !email || !password || !confirmPassword) {
      setError("Silakan lengkapi semua field");
      return;
    }
    if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(name.trim())) {
      setNameError("Nama Lengkap harus terdiri dari huruf");
      setError("Nama Lengkap harus terdiri dari huruf");
      return;
    }
    if (password.length < 6) {
      setError("Kata sandi minimal 6 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok");
      return;
    }
    if (!agree) {
      setError("Anda harus menyetujui syarat & ketentuan");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Gagal mendaftar. Silakan coba lagi.");
        setLoading(false);
        return;
      }

      setSuccess("Registrasi berhasil! Silakan masuk dengan akun Anda.");
      setTab("login");
      setLoginForm((prev) => ({ ...prev, identifier: email }));
      setLoading(false);
    } catch (err) {
      setError("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      setLoading(false);
    }
  }

  const features = [
    { icon: Leaf, title: "FSC Paper", desc: "Kertas ramah lingkungan bersertifikat FSC." },
    { icon: Sparkles, title: "Risograph", desc: "Cetak warna hidup dengan mesin Risograph." },
    { icon: Package, title: "Pengemasan Anti-Tekuk", desc: "Packing aman agar produk tiba utuh." },
    { icon: MessageCircle, title: "Konsultasi Gratis", desc: "Diskusi desain & bahan tanpa biaya." },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fcf9f4]">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 w-full bg-[#fcf9f4]/95 backdrop-blur-md border-b border-[#ece7de]">
        <div className="max-w-[1280px] mx-auto h-20 px-4 sm:px-10 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#f6f3ee] text-xs sm:text-sm font-semibold text-[#4b4639] hover:bg-[#ebe8e3] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </Link>
          <div className="absolute right-4 sm:right-10 flex items-center">
            <Image
              src="/logo.png"
              alt="Faeyza Printing"
              width={280}
              height={74}
              className="h-16 w-auto"
              priority
            />
          </div>
        </div>
      </div>

      {/* Ticker bar */}
      <div className="mt-20 w-full bg-[#fed9e1] overflow-hidden">
        <div className="whitespace-nowrap py-2 text-[11px] font-extrabold uppercase tracking-widest text-[#795d64] animate-[marquee_28s_linear_infinite]">
          <span className="mx-6">✦ Percetakan &amp; Digital Printing</span>
          <span className="mx-6">Kertas Seni Impor 310gsm</span>
          <span className="mx-6">Cetak Custom &amp; Kemasan Ramah Lingkungan</span>
          <span className="mx-6">Garansi Presisi Warna 100%</span>
          <span className="mx-6">Pengiriman Aman &amp; Cepat</span>
        </div>
      </div>

      {/* Main content */}
      <main
        className="flex-1 flex items-center justify-center px-4 sm:px-10 py-10 sm:py-14"
        style={{
          backgroundImage: "url('/login-pattern-stars.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "360px auto",
        }}
      >
        <div className="w-full max-w-[520px]">
          {/* Card */}
          <div className="bg-white rounded-xl shadow-[0_12px_36px_rgba(0,0,0,0.08)] border border-[#cec6b4]/40 overflow-hidden">
            {/* Tab switcher */}
            <div className="flex items-center px-6 pt-6">
              <button
                type="button"
                onClick={() => {
                  setTab("login");
                  setError("");
                  setSuccess("");
                }}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition ${
                  tab === "login"
                    ? "text-[#1c1c19] bg-[#f6f3ee] shadow-sm"
                    : "text-[#4b4639] hover:bg-[#f6f3ee]"
                }`}
              >
                Masuk
              </button>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold rounded-full transition text-[#4b4639] hover:bg-[#f6f3ee]"
              >
                Daftar Akun Baru
              </Link>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl sm:text-[32px] leading-tight font-bold tracking-tight text-[#1c1c19]">
                  {tab === "login" ? "Masuk ke Akun Anda" : "Buat Akun Baru"}
                </h2>
                <p className="mt-2 text-sm leading-5 text-[#4b4639]">
                  {tab === "login"
                    ? "Masuk untuk memantau status pesanan cetak dan mengelola berkas desain Anda."
                    : "Daftar untuk mulai memesan cetakan dan melacak pesanan Anda."}
                </p>
              </div>

              {/* Alert */}
              {error && (
                <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center gap-2 p-3 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {/* LOGIN FORM */}
              {tab === "login" && (
                <form onSubmit={handleLogin} autoComplete="off" className="space-y-5">
                  <input type="text" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />
                  <input type="password" style={{ display: "none" }} tabIndex={-1} autoComplete="off" />

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                        {loginMode === "customer-id"
                          ? "ID Pelanggan"
                          : "Email / Nomor WhatsApp"}
                      </label>
                      <Link
                        href={
                          loginMode === "customer-id"
                            ? "/login"
                            : "/login?mode=customer-id"
                        }
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                      >
                        {loginMode === "customer-id"
                          ? "Email / Nomor WhatsApp"
                          : "ID Pelanggan"}
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="login_identifier"
                        autoComplete="off"
                        required
                        value={loginForm.identifier}
                        onChange={(e) =>
                          setLoginForm((p) => ({
                            ...p,
                            identifier: e.target.value,
                          }))
                        }
                        placeholder={
                          loginMode === "customer-id"
                            ? "Masukkan ID Pelanggan"
                            : "nama@gmail.com atau 081234567890"
                        }
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-[#F9F8F3] focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="login_password"
                        autoComplete="new-password"
                        required
                        value={loginForm.password}
                        onChange={(e) =>
                          setLoginForm((p) => ({ ...p, password: e.target.value }))
                        }
                        placeholder="••••••••"
                        className="w-full pl-10 pr-12 py-2.5 text-sm border border-slate-300 rounded-xl bg-[#F9F8F3] focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                        aria-pressed={showPassword}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-rose-600 rounded-r-xl"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <label className="inline-flex items-center gap-2 text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loginForm.remember}
                        onChange={(e) =>
                          setLoginForm((p) => ({ ...p, remember: e.target.checked }))
                        }
                        className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span>Ingat Saya</span>
                    </label>
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Lupa Kata Sandi?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#F5D061] hover:bg-[#E8C24F] text-slate-900 font-semibold rounded-xl text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>Masuk</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* REGISTER FORM */}
              {tab === "register" && (
                <form onSubmit={handleRegister} autoComplete="off" className="space-y-5">
                  {/* Account type selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                      Tipe Akun
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setRegisterForm((p) => ({ ...p, accountType: "personal" }))
                        }
                        className={`p-3 rounded-xl border text-sm font-semibold transition ${
                          registerForm.accountType === "personal"
                            ? "border-rose-500 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        Personal / Kreatif
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRegisterForm((p) => ({ ...p, accountType: "business" }))
                        }
                        className={`p-3 rounded-xl border text-sm font-semibold transition ${
                          registerForm.accountType === "business"
                            ? "border-rose-500 bg-rose-50 text-rose-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        Bisnis / Perusahaan
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        required
                        value={registerForm.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setRegisterForm((p) => ({ ...p, name: value }));
                          setNameError(
                            value.trim() && !/^[\p{L}][\p{L}\s.'-]*$/u.test(value.trim())
                              ? "Nama Lengkap harus terdiri dari huruf"
                              : ""
                          );
                          if (error) setError("");
                        }}
                        placeholder="Nama lengkap"
                        className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-xl bg-[#F9F8F3] focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition ${
                          nameError ? "border-rose-500" : "border-slate-300"
                        }`}
                      />
                    </div>
                    {nameError && (
                      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-700">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {nameError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      No. WhatsApp
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={registerForm.phone}
                        onChange={(e) =>
                          setRegisterForm((p) => ({ ...p, phone: e.target.value }))
                        }
                        placeholder="08xxxxxxxxxx"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-[#F9F8F3] focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={registerForm.email}
                        onChange={(e) =>
                          setRegisterForm((p) => ({ ...p, email: e.target.value }))
                        }
                        placeholder="nama@gmail.com"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-[#F9F8F3] focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm((p) => ({ ...p, password: e.target.value }))
                        }
                        placeholder="Minimal 6 karakter"
                        className="w-full pl-10 pr-12 py-2.5 text-sm border border-slate-300 rounded-xl bg-[#F9F8F3] focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Konfirmasi Kata Sandi
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirm ? "text" : "password"}
                        required
                        value={registerForm.confirmPassword}
                        onChange={(e) =>
                          setRegisterForm((p) => ({ ...p, confirmPassword: e.target.value }))
                        }
                        placeholder="Ulangi kata sandi"
                        className="w-full pl-10 pr-12 py-2.5 text-sm border border-slate-300 rounded-xl bg-[#F9F8F3] focus:ring-2 focus:ring-rose-600 focus:border-transparent outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm((v) => !v)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Security notice */}
                  <div className="flex items-start gap-2 p-3 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <span>
                      Gunakan kata sandi yang kuat (minimal 6 karakter, kombinasi huruf &amp; angka). Jangan gunakan kata sandi yang sama dengan akun lain.
                    </span>
                  </div>

                  <label className="inline-flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={registerForm.agree}
                      onChange={(e) =>
                        setRegisterForm((p) => ({ ...p, agree: e.target.checked }))
                      }
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span>
                      Saya menyetujui{" "}
                      <Link href="/terms" className="font-semibold text-rose-600 hover:underline">
                        Syarat &amp; Ketentuan
                      </Link>{" "}
                      serta{" "}
                      <Link href="/privacy" className="font-semibold text-rose-600 hover:underline">
                        Kebijakan Privasi
                      </Link>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#F5D061] hover:bg-[#E8C24F] text-slate-900 font-semibold rounded-xl text-sm shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>Daftar Akun Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Feature cards - shown on register tab */}
          {tab === "register" && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="bg-white/80 backdrop-blur rounded-xl border border-slate-100 p-3 text-center shadow-sm"
                  >
                    <div className="mx-auto mb-2 w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    <p className="text-xs font-semibold text-slate-800">{f.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#ece7de] bg-[#f6f3ee] mt-auto">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-5 flex items-center justify-center text-xs text-[#4b4639]">
          <span>© {new Date().getFullYear()} Faeyza Printing. Seluruh Hak Cipta Dilindungi.</span>
        </div>
      </footer>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}