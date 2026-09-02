'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [testUrl, setTestUrl] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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
      
      if (!res.ok) throw new Error(data.message || 'Gagal mengirim email');
      
      setSuccessMsg(data.message);
      if (data.testUrl) {
        setTestUrl(data.testUrl);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center px-4 bg-gray-50 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-800 to-primary-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-3">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Lupa Password</h1>
            <p className="text-blue-200 text-sm mt-1">Masukkan email untuk mereset password</p>
          </div>

          <div className="px-8 py-7 space-y-5">
            {errorMsg && (
              <div className="flex items-start gap-2 bg-red-50 text-red-700 p-4 rounded-lg text-sm border border-red-100">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{errorMsg}</p>
              </div>
            )}

            {successMsg && (
              <div className="flex flex-col gap-3 bg-green-50 text-green-800 p-4 rounded-lg text-sm border border-green-200">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-green-600" />
                  <p>{successMsg}</p>
                </div>
                {testUrl && (
                  <div className="mt-2 p-3 bg-white rounded border border-green-100 text-xs text-gray-600 break-all">
                    <p className="font-semibold text-gray-800 mb-1">Testing Mode (Ethereal Email):</p>
                    <a href={testUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline">
                      Buka Kotak Masuk Ethereal Disini
                    </a>
                  </div>
                )}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 text-sm"
                    placeholder="email@instansi.go.id"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Link Reset'}
              </button>
            </form>

            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors pt-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
