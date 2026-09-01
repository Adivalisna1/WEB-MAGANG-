const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const SUPABASE_URL    = process.env.SUPABASE_URL;
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'dokumen';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('[SUPABASE] SUPABASE_URL atau SUPABASE_SERVICE_KEY belum diset — storage tidak aktif');
}

const supabase = SUPABASE_URL && SUPABASE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_KEY)
  : null;

/**
 * Upload file buffer ke Supabase Storage
 * @param {Buffer} buffer - isi file
 * @param {string} fileName - nama file unik (pakai Date.now() dll)
 * @param {string} mimeType
 * @param {string|number} tahun - subfolder tahun
 * @returns {Promise<string>} storagePath — path di bucket (bukan URL publik)
 */
async function uploadToSupabase(buffer, fileName, mimeType, tahun) {
  if (!supabase) throw new Error('Supabase tidak dikonfigurasi');

  const storagePath = `${tahun}/${fileName}`;

  const { error } = await supabase.storage
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
 * @param {string} storagePath
 * @returns {Promise<{buffer: Buffer, contentType: string}>}
 */
async function downloadFromSupabase(storagePath) {
  if (!supabase) throw new Error('Supabase tidak dikonfigurasi');

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .download(storagePath);

  if (error) throw new Error(`Download Supabase gagal: ${error.message}`);

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Hapus file dari Supabase Storage
 * @param {string} storagePath
 */
async function deleteFromSupabase(storagePath) {
  if (!supabase) return;
  const { error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .remove([storagePath]);
  if (error) console.warn('[SUPABASE] Gagal hapus file:', error.message);
}

/**
 * Cek apakah path adalah Supabase path (bukan path lokal)
 * @param {string} filePath
 */
function isSupabasePath(filePath) {
  if (!filePath) return false;
  // Path lokal biasanya diawali / atau C:\ dll
  // Supabase path format: "2025/namafile.pdf"
  return !path.isAbsolute(filePath) && !filePath.startsWith('C:') && !filePath.startsWith('/app');
}

module.exports = {
  supabase,
  uploadToSupabase,
  downloadFromSupabase,
  deleteFromSupabase,
  isSupabasePath,
  SUPABASE_BUCKET,
};
