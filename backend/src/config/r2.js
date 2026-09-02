const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

const R2_ENDPOINT  = process.env.R2_ENDPOINT;
const R2_ACCESS    = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET    = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET    = process.env.R2_BUCKET || 'dokumen';

const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId:     R2_ACCESS,
    secretAccessKey: R2_SECRET,
  },
});

async function uploadToR2(buffer, fileName, mimeType, tahun) {
  const key = `${tahun}/${fileName}`;
  await s3.send(new PutObjectCommand({
    Bucket:      R2_BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: mimeType,
  }));
  return key;
}

async function downloadFromR2(key) {
  const res = await s3.send(new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key:    key,
  }));
  // Konversi stream ke buffer
  const chunks = [];
  for await (const chunk of res.Body) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function deleteFromR2(key) {
  try {
    await s3.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  } catch (e) {
    console.warn('[R2] Gagal hapus file:', e.message);
  }
}

module.exports = { uploadToR2, downloadFromR2, deleteFromR2 };
