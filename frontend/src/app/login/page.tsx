"use client";

import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { clearSession } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  Landmark,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
} from "lucide-react";

export default function LoginPage() {
  const { loginFn, user, loading } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Kalau sudah login, redirect sesuai role & tingkat (kecuali jika ada param switch / logout)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("logout") === "true") {
        clearSession();
        window.location.href = "/login";
        return;
      }
      if (params.get("switch") === "true") {
        return;
      }
    }
    if (!loading && user) {
      const r = user.role;
      const t = user.tingkat;
      const isIt = Boolean(
        user.is_it ||
        r === "admin_it" ||
        r === "it" ||
        (t === "kl" &&
          (user.permissions?.can_manage_users ||
            ["it_admin", "naufal"].includes(user.username))),
      );
      if (isIt) router.replace("/admin-it");
      else if (t === "kl") router.replace("/kl");
      else if (r === "eselon_1" || t === "eselon_1")
        router.replace("/eselon-1");
      else if (
        r === "pimpinan_satker" ||
        (t === "satker" && (r === "manajemen" || r === "administrasi"))
      )
        router.replace("/pimpinan");
      else router.replace("/staff/dokumen");
    }
  }, [user, loading, router]);

  // Cek apakah user baru saja ketendang (kicked)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("kicked") === "true") {
        setError(
          "Sesi Anda dihentikan karena akun ini baru saja login di perangkat atau jaringan lain.",
        );
      }
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginFn(username, password);
      if (password === "123456") {
        toast(
          "Akun Anda masih menggunakan password default. Segera ganti password demi keamanan!",
          {
            icon: "⚠️",
            duration: 8000,
            style: {
              background: "#fff3cd",
              color: "#856404",
              border: "1px solid #ffeeba",
            },
          },
        );
      }
    } catch (err: any) {
      setError(err.message || "Username atau password salah");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white selection:bg-blue-100 selection:text-[#1D64EC]">
      {/* ============================================================ */}
      {/* SISI KIRI (HERO & BRANDING VISUAL - PROPORSI BESAR & MEGAH)  */}
      {/* ============================================================ */}
      <div className="lg:w-1/2 bg-[#1D64EC] flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 relative overflow-hidden text-white shrink-0 min-h-screen lg:h-screen">
        {/* Header Branding */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-[#1D64EC] shadow-md shrink-0">
            <Landmark className="w-6 h-6" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Portal Rekonsiliasi Satker
          </span>
        </div>

        {/* Center Content & Illustration */}
        <div className="relative z-10 my-auto py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-[40px] xl:text-[44px] font-extrabold text-white leading-[1.2] max-w-xl tracking-tight mb-4">
            Pusat Pengelolaan Bukti Transaksi, Rekening Koran, dan Laporan
            Satker.
          </h1>
          <p className="text-white/90 text-base sm:text-lg max-w-lg leading-relaxed mb-8 sm:mb-10">
            Sederhanakan arsip bukti pengeluaran, pendapatan, dan pencocokan
            saldo kas bank dalam satu sistem terintegrasi.
          </p>

          {/* Vektor Kartu Data & Verifikasi (Proporsional & Besar sesuai Monitor 1080p) */}
          <div className="relative w-full max-w-[440px] sm:max-w-[480px] my-6">
            {/* Soft decorative background circles */}
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -right-6 top-1/4 w-36 h-36 rounded-full bg-white/15 blur-xl pointer-events-none" />

            {/* Outer Window Card */}
            <div className="relative bg-[#EAF2FE] rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-white/70">
              {/* Window dots & top bar */}
              <div className="flex items-center gap-2 mb-5">
                <div className="w-3 h-3 rounded-full bg-[#8BB8F5]" />
                <div className="w-3 h-3 rounded-full bg-[#8BB8F5]" />
                <div className="w-32 h-3 bg-[#8BB8F5] rounded-full ml-1" />
              </div>

              {/* Card Body */}
              <div className="flex items-center gap-5">
                {/* Mini Graph Card */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 flex-1 min-h-[140px] flex flex-col justify-between">
                  <div className="w-14 h-2 bg-[#E2EDFC] rounded-full" />
                  <svg
                    viewBox="0 0 100 45"
                    className="w-full h-16 overflow-visible my-2"
                  >
                    <defs>
                      <linearGradient
                        id="chartFillLarge"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#1D64EC"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#1D64EC"
                          stopOpacity="0.0"
                        />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 5 35 Q 25 32 35 20 T 65 26 T 95 8"
                      fill="none"
                      stroke="#1D64EC"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M 5 35 Q 25 32 35 20 T 65 26 T 95 8 L 95 45 L 5 45 Z"
                      fill="url(#chartFillLarge)"
                    />
                  </svg>
                </div>

                {/* Placeholder Data Bars */}
                <div className="flex flex-col gap-3.5 flex-1 pr-2">
                  <div className="w-full h-3.5 bg-[#8BB8F5] rounded-full" />
                  <div className="w-4/5 h-3.5 bg-[#B9D5F9] rounded-full" />
                  <div className="w-11/12 h-3.5 bg-[#B9D5F9] rounded-full" />
                </div>
              </div>

              {/* Blue Circular Checkmark Badge */}
              <div className="absolute -bottom-5 -right-4 sm:-right-5 w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#1D64EC] ring-4 ring-white shadow-2xl flex items-center justify-center text-white">
                <Check className="w-10 h-10 sm:w-11 sm:h-11 stroke-[3.5]" />
              </div>
            </div>
          </div>


        </div>

        {/* Dynamic Dark Wave Ribbon di Bagian Bawah */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden h-40 sm:h-52 z-0">
          <svg
            viewBox="0 0 600 160"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Lapis Gelombang Biru Tua */}
            <path
              d="M 0 110 C 140 70 290 140 600 70 L 600 160 L 0 160 Z"
              fill="#1555C7"
              opacity="0.55"
            />
            {/* Lapis Pita Gelombang Hitam Elegan */}
            <path
              d="M 0 120 C 130 95 240 148 360 98 C 450 60 525 90 600 78 L 600 160 L 0 160 Z"
              fill="#060C1B"
              opacity="0.95"
            />
          </svg>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SISI KANAN (FORM LOGIN MEWAH, LEGA, & UX SANGAT NYAMAN)      */}
      {/* ============================================================ */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 lg:p-16 xl:p-20 bg-white min-h-screen lg:h-screen lg:overflow-y-auto">
        {/* Spacer atas */}
        <div className="hidden lg:block"></div>

        {/* Form Container (Lega & Nyaman) */}
        <div className="w-full max-w-[460px] mx-auto my-auto py-6">
          {/* Blue accent bar */}
          <div className="w-12 h-1.5 bg-[#1D64EC] rounded-full mb-6"></div>

          {/* Active Session Notice if logged in */}
          {user && (
            <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Sesi Masih Aktif
                  </span>
                  <p className="font-extrabold text-sm text-slate-900 truncate">
                    {user.nama} (
                    {user.satker_nama || user.eselon_1_singkatan || user.role})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    clearSession();
                    if (typeof window !== "undefined")
                      window.location.href = "/login";
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 rounded-xl transition-all shadow-xs shrink-0 cursor-pointer text-center"
                >
                  Keluar / Ganti Akun
                </button>
              </div>
            </div>
          )}

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Selamat Datang
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-2 mb-8 sm:mb-9">
            Masukkan username dan password Anda
          </p>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-4">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Username
              </label>
              <div className="relative rounded-xl border border-gray-200 bg-white focus-within:border-[#1D64EC] focus-within:ring-4 focus-within:ring-[#1D64EC]/10 transition-all shadow-sm">
                <User className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  required
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-3.5 text-base text-gray-900 placeholder:text-gray-400 bg-transparent rounded-xl focus:outline-none"
                />
              </div>
            </div>

            {/* Field Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative rounded-xl border border-gray-200 bg-white focus-within:border-[#1D64EC] focus-within:ring-4 focus-within:ring-[#1D64EC]/10 transition-all shadow-sm">
                <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-12 pr-12 py-3.5 text-base text-gray-900 placeholder:text-gray-400 bg-transparent rounded-xl focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  aria-label={
                    showPass ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPass ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox Ingat Saya & Lupa Password */}
            <div className="flex items-center justify-between pt-1 pb-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#1D64EC] focus:ring-[#1D64EC]"
                />
                <span className="text-sm text-gray-600">Ingat saya</span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-medium text-[#1D64EC] hover:underline"
              >
                Lupa Password?
              </Link>
            </div>

            {/* Tombol Submit Masuk */}
            <button
              type="submit"
              disabled={submitting || !username || !password}
              className="w-full py-3.5 px-6 bg-[#1D64EC] hover:bg-[#1552C6] active:bg-[#0E45B0] text-white text-base font-semibold rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
              {submitting ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Kembali ke Beranda */}
          <div className="text-center mt-9">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>
          </div>
        </div>

        {/* Footer Copyright */}
        <p className="text-center text-xs text-gray-400 pt-8">
          © 2026 Portal Rekonsiliasi Satker
        </p>
      </div>
    </div>
  );
}
