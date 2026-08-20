'use client';

import Link from 'next/link';
import { KeyRound, ArrowLeft, UserRound, MessageSquare } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-800 to-primary-600 px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 rounded-xl mb-3">
              <KeyRound className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Lupa Password</h1>
            <p className="text-blue-200 text-sm mt-1">Tenang, password kamu bisa direset</p>
          </div>

          <div className="px-8 py-7 space-y-5">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                <UserRound className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <p>
                  Sistem belum mendukung reset password otomatis via email.
                  Hubungi <span className="font-semibold text-gray-800">Admin</span> atau{' '}
                  <span className="font-semibold text-gray-800">Ketua Tim</span> dengan
                  menyebutkan <span className="font-semibold text-gray-800">username</span> kamu.
                </p>
              </div>
              <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                <MessageSquare className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
                <p>
                  Admin atau Ketua Tim akan mereset password kamu dari dashboard dan
                  memberikan password sementara untuk login kembali.
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full btn-primary py-2.5 flex items-center justify-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
