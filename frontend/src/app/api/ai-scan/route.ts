import { NextRequest, NextResponse } from 'next/server';

const N8N_AI_WEBHOOK = process.env.NEXT_PUBLIC_N8N_AI_WEBHOOK || 'http://localhost:5678/webhook/baca-dokumen';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Teruskan request persis sama ke n8n
    const n8nRes = await fetch(N8N_AI_WEBHOOK, {
      method: 'POST',
      body: formData,
    });

    if (!n8nRes.ok) {
      return NextResponse.json(
        { error: `n8n Webhook Error: ${n8nRes.status}` },
        { status: n8nRes.status }
      );
    }

    const data = await n8nRes.json();
    
    // Balikin JSON dari n8n ke frontend
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying to n8n:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal menyambung ke server AI' },
      { status: 500 }
    );
  }
}
