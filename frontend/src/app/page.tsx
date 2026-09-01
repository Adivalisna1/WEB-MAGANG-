'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Building2, Eye, CheckCircle, LayoutDashboard } from 'lucide-react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Kalau sudah login, langsung redirect ke dashboard role-nya
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin')          router.replace('/admin');
      else if (user.role === 'ketua_tim') router.replace('/ketua');
      else                                router.replace('/staff/dokumen');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f2447] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-['Inter',sans-serif]">
      {/* ── NAVBAR ───────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 h-[68px] bg-[#0f2447]/92 backdrop-blur-md border-b border-white/8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center font-extrabold text-[#0f2447] text-lg shrink-0 select-none">
            IP
          </div>
          <div className="hidden sm:block">
            <p className="text-white text-sm font-semibold leading-tight">Instansi Pemerintah</p>
            <p className="text-white/50 text-[11px]">Sistem Manajemen Dokumen Laporan</p>
          </div>
        </div>

        {/* Top-right: tombol Masuk */}
        <div className="flex items-center gap-3">
          {!user && (
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 border border-white/35 hover:border-white/70 hover:bg-white/10 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-all duration-200"
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative flex-1 min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background foto gedung */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1600&q=80')`,
            filter: 'brightness(0.35)',
            transform: 'scale(1.04)',
          }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f2447]/60 via-[#0f2447]/25 to-[#0f2447]/80" />

        {/* Content */}
        <div className="relative z-10 text-center px-5 max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-amber-400/15 border border-amber-400/35 text-amber-300 text-[12px] font-medium px-4 py-1.5 rounded-full mb-6">
            <Building2 className="w-3.5 h-3.5" />
            Sistem Manajemen Dokumen Resmi
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Selamat Datang di<br />
            <span className="text-amber-400">Dashboard Laporan</span>
          </h1>

          <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-10">
            Platform pengelolaan dan pengarsipan dokumen laporan instansi
            secara digital, aman, dan terstruktur.
          </p>

          {/* Tombol hero — kondisional berdasarkan status login */}
          {user ? (
            /* Sudah login → 1 tombol ke dashboard role-nya */
            <Link
              href={
                user.role === 'admin' ? '/admin' :
                user.role === 'ketua_tim' ? '/ketua' :
                '/staff/dokumen'
              }
              className="inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-[#0f2447] font-bold text-base px-10 py-4 rounded-xl shadow-[0_8px_32px_rgba(251,191,36,0.35)] hover:shadow-[0_12px_40px_rgba(251,191,36,0.5)] hover:-translate-y-0.5 transition-all duration-250"
            >
              <LayoutDashboard className="w-5 h-5" />
              Buka Dashboard
            </Link>
          ) : (
            /* Belum login → 2 tombol */
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 bg-amber-400 hover:bg-amber-300 text-[#0f2447] font-bold text-base px-10 py-4 rounded-xl shadow-[0_8px_32px_rgba(251,191,36,0.35)] hover:shadow-[0_12px_40px_rgba(251,191,36,0.5)] hover:-translate-y-0.5 transition-all duration-250"
              >
                <LogIn className="w-5 h-5" />
                Masuk ke Dashboard
              </Link>
              <Link
                href="/laporan"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/30 hover:border-white/50 text-white font-semibold text-base px-8 py-4 rounded-xl hover:-translate-y-0.5 transition-all duration-250"
              >
                <Eye className="w-5 h-5" />
                Dashboard Laporan
              </Link>
            </div>
          )}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/35 text-[11px] animate-bounce">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          Info instansi
        </div>
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────── */}
      <div className="bg-[#080f1c] flex flex-wrap items-center justify-center divide-x divide-white/10 py-5 px-6">
        {[
          { num: '1.240+', label: 'Dokumen Terarsip' },
          { num: '10+',    label: 'Kategori Laporan' },
          { num: '2024',   label: 'Berdiri Sejak' },
          { num: '3-Level', label: 'Verifikasi Dokumen' },
        ].map((s) => (
          <div key={s.label} className="flex-1 min-w-[120px] text-center px-6 py-2">
            <p className="text-2xl font-extrabold text-amber-400 leading-none">{s.num}</p>
            <p className="text-white/45 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── ABOUT SECTION ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Gambar gedung instansi */}
          <div className="relative">
            <img
              src="/gedung-dikti.avif"
              alt="Gedung Instansi Pemerintah"
              className="w-full rounded-2xl shadow-2xl object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-5 -right-5 bg-[#1a3a6b] text-white px-5 py-4 rounded-2xl shadow-lg hidden md:block">
              <span className="block text-3xl font-extrabold text-amber-400 leading-none">Est.</span>
              <span className="block font-bold text-lg">2024</span>
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-4">
              Tentang Kami
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900 leading-tight mb-4">
              Instansi Pemerintah Pusat
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              Sistem ini dibangun untuk memudahkan pengelolaan, pengarsipan, dan
              pelaporan dokumen secara digital — memastikan transparansi dan
              akuntabilitas dalam tata kelola organisasi.
            </p>
            <p className="text-gray-600 text-sm leading-relaxed">
              Setiap dokumen melalui proses verifikasi dua tahap oleh Admin dan
              Ketua Tim sebelum dipublikasikan, menjamin kualitas dan keabsahan
              informasi yang sampai ke publik.
            </p>
          </div>
        </div>
      </section>

      {/* ── VISI & MISI ──────────────────────────────────────────── */}
      <section className="bg-white py-20 px-6" id="visi-misi">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide mb-3">
              <Eye className="w-3.5 h-3.5" />
              Visi &amp; Misi
            </span>
            <h2 className="text-3xl font-extrabold text-gray-900">Arah dan Tujuan Instansi</h2>
            <p className="text-gray-500 text-sm mt-3 max-w-xl mx-auto">
              Landasan nilai dan komitmen yang menjadi panduan dalam setiap kegiatan dan pelayanan instansi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* VISI */}
            <div className="rounded-2xl p-8 bg-gradient-to-br from-[#1a3a6b] to-[#2451a3] text-white">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-5">
                <Building2 className="w-6 h-6 text-amber-300" />
              </div>
              <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Visi</p>
              <p className="text-lg font-semibold leading-relaxed">
                Terwujudnya Pendidikan Tinggi, Sains, dan Teknologi yang inklusif,
                adaptif, dan berdampak dalam mewujudkan transformasi bangsa menuju
                Indonesia Emas 2045.
              </p>
            </div>

            {/* MISI */}
            <div className="rounded-2xl p-8 bg-gray-50 border border-gray-200">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-blue-700 text-xs font-bold uppercase tracking-widest mb-2">Misi</p>
              <p className="text-base font-bold text-gray-900 mb-4">Langkah Strategis Kami</p>
              <ul className="space-y-3">
                {[
                  'Mewujudkan pemerataan akses pendidikan tinggi berkualitas, relevan, dan berdaya saing sebagai upaya untuk mendukung transformasi ekonomi.',
                  'Mewujudkan riset, pengembangan, sains, teknologi, dan inovasi yang berdampak dan menjawab kebutuhan masyarakat untuk mendukung transformasi ekonomi dan transformasi sosial.',
                  'Mewujudkan tata kelola Pendidikan Tinggi, Sains, dan Teknologi berintegritas untuk membantu mewujudkan transformasi tata kelola.',
                ].map((misi, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    {i + 1}. {misi}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-[#0f2447] to-[#1a3a6b] py-20 px-6 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl font-extrabold text-white mb-3">Siap Mengelola Dokumen?</h2>
          <p className="text-white/60 text-sm mb-8">
            Masuk ke dashboard untuk mengupload, mengelola, dan memverifikasi laporan instansi.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-300 text-[#0f2447] font-bold px-9 py-3.5 rounded-xl shadow-[0_8px_24px_rgba(251,191,36,0.3)] hover:shadow-[0_12px_32px_rgba(251,191,36,0.45)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <LogIn className="w-5 h-5" />
            Masuk Sekarang
          </Link>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="bg-[#080f1c] text-white/40 py-5 px-6 text-center text-sm">
        © {new Date().getFullYear()} <span className="text-white/65 font-medium">Instansi Pemerintah</span> — Sistem Manajemen Dokumen Laporan
      </footer>
    </div>
  );
}
