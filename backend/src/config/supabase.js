// Pakai native fetch (Node.js 18+)
const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'dokumen';

const BASE = `${SUPABASE_URL}/storage/v1`;

function getHeaders(extra = {}) {
  return {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    ...extra,
  };
}

async function uploadToSupabase(buffer, fileName, mimeType, tahun) {
  const storagePath = `${tahun}/${fileName}`;
  const url = `${BASE}/object/${SUPABASE_BUCKET}/${storagePath}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': mimeType, 'x-upsert': 'false' }),
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload Supabase gagal (${res.status}): ${err}`);
  }

  return storagePath;
}

async function downloadFromSupabase(storagePath) {
  const url = `${BASE}/object/${SUPABASE_BUCKET}/${storagePath}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Download Supabase gagal (${res.status}): ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function deleteFromSupabase(storagePath) {
  const url = `${BASE}/object/${SUPABASE_BUCKET}/${storagePath}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.text();
    console.warn('[SUPABASE] Gagal hapus file:', err);
  }
}

module.exports = {
  uploadToSupabase,
  downloadFromSupabase,
  deleteFromSupabase,
  SUPABASE_BUCKET,
};
