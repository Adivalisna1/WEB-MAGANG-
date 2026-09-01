const { StorageClient } = require('@supabase/storage-js');
const path = require('path');

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'dokumen';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[SUPABASE] SUPABASE_URL atau SUPABASE_SERVICE_KEY belum diset');
}

const storageClient = SUPABASE_URL && SUPABASE_KEY
  ? new StorageClient(`${SUPABASE_URL}/storage/v1`, {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    })
  : null;

/**
 * Upload file buffer ke Supabase Storage
 */
async function uploadToSupabase(buffer, fileName, mimeType, tahun) {
  if (!storageClient) throw new Error('Supabase tidak dikonfigurasi');

  const storagePath = `${tahun}/${fileName}`;

  const { error } = await storageClient
    .from(SUPABASE_BUCKET)
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Upload Supabase gagal: ${error.message}`);

  return storagePath;
}

/**
 * Download file dari Supabase Storage sebagai Buffer
 */
async function downloadFromSupabase(storagePath) {
  if (!storageClient) throw new Error('Supabase tidak dikonfigurasi');

  const { data, error } = await storageClient
    .from(SUPABASE_BUCKET)
    .download(storagePath);

  if (error) throw new Error(`Download Supabase gagal: ${error.message}`);

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Hapus file dari Supabase Storage
 */
async function deleteFromSupabase(storagePath) {
  if (!storageClient) return;
  const { error } = await storageClient
    .from(SUPABASE_BUCKET)
    .remove([storagePath]);
  if (error) console.warn('[SUPABASE] Gagal hapus file:', error.message);
}

module.exports = {
  storageClient,
  uploadToSupabase,
  downloadFromSupabase,
  deleteFromSupabase,
  SUPABASE_BUCKET,
};
