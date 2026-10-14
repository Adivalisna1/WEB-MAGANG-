'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleHelp,
  Clock,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailCheck,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  FileText,
  BadgeCheck,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

const steps = ['Masukkan Email', 'Cek Inbox', 'Sandi Baru'];

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [testUrl, setTestUrl] = useState('');
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!isSent || countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isSent, countdown]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setTestUrl('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail || data.message || 'Gagal mengirim email verifikasi');

      setSuccessMsg(data.message || 'Tautan pemulihan berhasil dikirim');
      if (data.testUrl) {
        setTestUrl(data.testUrl);
      }
      setIsSent(true);
      setCountdown(60);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0 || loading) return;
    const fakeEvent = { preventDefault: () => {} } as FormEvent;
    handleSubmit(fakeEvent);
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-[#0A192F] text-slate-900">
      
      {/* ============================================================ */}
      {/* ── SISI KIRI (HERO & SOP VISUAL LAYAR PENUH 50-52%) ──      */}
      {/* ============================================================ */}
      <section className="relative w-full lg:w-[50%] xl:w-[52%] bg-gradient-to-br from-[#071325] via-[#0D2447] to-[#143B73] p-8 sm:p-12 lg:p-16 flex flex-col justify-between overflow-hidden text-white border-b lg:border-b-0 lg:border-r border-white/10">
        
        {/* Glowing Orbs & Ambient Background Mesh */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-indigo-500/15 blur-3xl" />

        {/* Header Kiri: Brand & Logo Instansi */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-md group-hover:scale-105 transition-transform">
              <Building2 size={22} className="text-blue-300" />
            </span>
            <div>
              <span className="inline-block text-[10px] font-extrabold tracking-[0.2em] text-blue-300 uppercase">
                DIREKTORAT JENDERAL DIKTI
              </span>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-white leading-tight">
                Sistem Laporan Keuangan Satker
              </h2>
            </div>
          </Link>
        </div>

        {/* Content Tengah Kiri: Headline & 3 Langkah Panduan Terstruktur */}
        <div className="relative z-10 my-10 lg:my-auto max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-5 backdrop-blur-sm">
            <ShieldCheck size={14} className="text-blue-300" />
            <span>Pusat Pemulihan Akun Kedinasan</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.18] mb-4">
            Pemulihan Akses Aman & Terverifikasi
          </h1>
          <p className="text-white/75 text-sm sm:text-base leading-relaxed mb-8">
            Kendala lupa kata sandi akun pelaporan rekening koran dan pencatatan satker dapat diselesaikan dengan 3 langkah mudah berikut:
          </p>

          {/* 3 Step Card Timeline Kiri */}
          <div className="space-y-3.5">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.09] transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Verifikasi Email Kedinasan</h4>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  Ketikkan alamat email aktif yang terdaftar di akun instansi / Satker Anda.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.09] transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Terima Tautan Reset (15 Menit)</h4>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  Sistem otomatis mengirimkan token unik yang terenkripsi langsung ke kotak masuk email.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:bg-white/[0.09] transition-colors">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Buat Kata Sandi Baru</h4>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                  Perbarui sandi baru Anda dan langsung masuk kembali ke dashboard aplikasi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Kiri: Trust Badges & Hotline Info */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <BadgeCheck size={15} className="text-emerald-400" />
              Standar Keamanan SSL 256-bit
            </span>
            <span className="hidden sm:inline text-white/20">•</span>
            <span className="hidden sm:flex items-center gap-1.5 font-medium">
              <Building2 size={15} className="text-blue-300" />
              153 Satker Terdata
            </span>
          </div>
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <span>Portal Publik</span>
            <ExternalLink size={12} />
          </Link>
        </div>

      </section>

      {/* ============================================================ */}
      {/* ── SISI KANAN (FORMULIR INTERAKTIF LAYAR PENUH 48-50%) ──    */}
      {/* ============================================================ */}
      <section className="w-full lg:w-[50%] xl:w-[48%] bg-[#F8FAFC] flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 relative">
        
        {/* Top Navbar Kanan: Tombol Kembali ke Login */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Langkah 1 dari 3
          </span>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 shadow-xs hover:border-[#1D64EC] hover:text-[#1D64EC] transition-all"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Login</span>
          </Link>
        </div>

        {/* Kartu Formulir Tengah Kanan */}
        <div className="my-auto max-w-md w-full mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-9 relative overflow-hidden">
            
            {/* Top Blue Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-[#1D64EC] to-indigo-600" />

            {!isSent ? (
              <>
                {/* Header Card */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-[#1D64EC] shadow-xs">
                      <KeyRound size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                        Pemulihan Sandi
                      </h2>
                      <p className="text-xs text-slate-400">
                        Konfirmasi identitas akun kedinasan
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Ketikkan alamat email kedinasan Anda yang terdaftar untuk menerima tautan aktivasi password baru.
                  </p>
                </div>

                {/* Micro-steps Guide */}
                <ol className="mb-6 grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5">
                  {steps.map((step, index) => (
                    <li
                      key={step}
                      className={`flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 text-center text-[10px] font-semibold sm:text-xs ${
                        index === 0
                          ? 'bg-white text-[#1D64EC] shadow-xs ring-1 ring-slate-200/70'
                          : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
                          index === 0
                            ? 'bg-[#1D64EC] text-white font-bold'
                            : 'border border-slate-300 bg-white text-slate-400'
                        }`}
                      >
                        {index + 1}
                      </span>
                      <span className="truncate">{step}</span>
                    </li>
                  ))}
                </ol>

                {/* Error Alert */}
                {errorMsg && (
                  <div
                    role="alert"
                    className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs sm:text-sm text-red-700 leading-snug"
                  >
                    <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Form Input Email */}
                <form onSubmit={handleSubmit} noValidate>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-xs sm:text-sm font-semibold text-slate-700"
                  >
                    Email Kedinasan
                  </label>
                  <div className="group relative">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#1D64EC]"
                      size={18}
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="nama.staf@instansi.go.id"
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-xs sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#1D64EC] focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-4 text-slate-500">
                    <Lock size={12} className="mt-0.5 shrink-0 text-slate-400" />
                    Pastikan menggunakan email yang terdaftar pada akun Satker Anda.
                  </p>

                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1D64EC] hover:bg-[#1552C6] active:bg-[#0E45B0] px-5 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Mengirim tautan...</span>
                      </>
                    ) : (
                      <>
                        <span>Kirim Tautan Pemulihan</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              /* Success / Email Sent State */
              <div className="py-2 text-center">
                <div className="relative mx-auto mb-5 w-fit">
                  <div className="absolute inset-0 scale-150 rounded-full bg-emerald-100/80 blur-xl" />
                  <div className="relative flex size-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-xs">
                    <MailCheck size={32} strokeWidth={2.1} />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-white">
                    <Check size={13} strokeWidth={3} />
                  </span>
                </div>

                <p className="text-[11px] font-bold tracking-[0.16em] text-emerald-600 uppercase">
                  Email berhasil dikirim
                </p>
                <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 sm:text-[26px]">
                  Periksa Inbox Anda
                </h2>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-500">
                  Kami telah mengirim tautan verifikasi pemulihan ke:
                  <strong className="mt-1 block font-semibold text-slate-800 break-all">
                    {email}
                  </strong>
                </p>

                <div className="my-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className="mt-0.5 shrink-0 text-[#1D64EC]" />
                    <p className="text-xs leading-relaxed text-slate-600">
                      Belum menemukan emailnya? Periksa folder{' '}
                      <strong className="font-semibold text-slate-800">
                        spam, junk,
                      </strong>{' '}
                      atau promosi. Pastikan alamat email di atas sudah benar.
                    </p>
                  </div>
                </div>

                {testUrl && (
                  <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-left">
                    <p className="text-xs font-bold text-emerald-800 mb-1">Mode Pengujian / Development:</p>
                    <p className="text-[11px] text-emerald-700 leading-relaxed mb-2.5">
                      Karena provider email (Brevo) belum disetel di server lokal, tautan pemulihan dibuat langsung untuk pengujian. Silakan klik tombol berikut:
                    </p>
                    <a
                      href={testUrl}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <span>Buka Form Reset Password Baru</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-[#1D64EC] hover:bg-blue-50/50 hover:text-[#1D64EC] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <RotateCcw size={16} />
                  )}
                  {countdown > 0
                    ? `Kirim Ulang Email (${countdown}s)`
                    : 'Kirim Ulang Email'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsSent(false);
                    setErrorMsg('');
                  }}
                  className="mt-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-[#1D64EC] hover:text-blue-700 transition hover:bg-blue-50 cursor-pointer"
                >
                  Gunakan email lain
                </button>
              </div>
            )}

            {/* Security Notice Box */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={18} className="shrink-0 text-[#1D64EC]" />
                  <p className="text-[11px] sm:text-xs text-slate-600">
                    Tautan reset berlaku selama{' '}
                    <strong className="font-semibold text-slate-800">
                      15 menit
                    </strong>{' '}
                    demi keamanan akun.
                  </p>
                </div>
                <Clock size={14} className="shrink-0 text-blue-400" />
              </div>
            </div>

          </div>
        </div>

        {/* Footer Kanan: Helpdesk Satker */}
        <div className="mt-8 text-center">
          <a
            href="mailto:helpdesk@kemdikbud.go.id"
            className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-[#1D64EC] transition-colors"
          >
            <CircleHelp size={15} />
            <span>
              Kendala akses akun?{' '}
              <strong className="font-semibold text-slate-700">
                Hubungi Admin Satker atau Helpdesk IT
              </strong>
            </span>
          </a>
          <p className="text-[10px] text-slate-400 mt-2">
            © 2026 Direktorat Jenderal Pendidikan Tinggi · Kemdiktisaintek
          </p>
        </div>

      </section>

    </main>
  );
}
