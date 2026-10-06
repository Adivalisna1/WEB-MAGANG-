import { NextRequest, NextResponse } from 'next/server';

// Gunakan URL internal container atau public API backend FastAPI
const BACKEND_API = process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Teruskan request langsung ke Python FastAPI (/api/dokumen/scan-ekstrak)
    // Menghilangkan ketergantungan pada webhook n8n port 5678
    const pyRes = await fetch(`${BACKEND_API}/dokumen/scan-ekstrak`, {
      method: 'POST',
      body: formData,
    });

    if (!pyRes.ok) {
      const errText = await pyRes.text();
      return NextResponse.json(
        { error: `Backend Extraction Error: ${pyRes.status} - ${errText}` },
        { status: pyRes.status }
      );
    }

    const data = await pyRes.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error in scan extraction proxy:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal memproses ekstraksi berkas' },
      { status: 500 }
    );
  }
}
