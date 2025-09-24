// /lib/storage.js
// One adapter: Supabase now, R2 later. Remote-only safe for Vercel lambdas.

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BACKEND = process.env.STORAGE_BACKEND || 'supabase';

/* ---------------- Supabase (dev/test/prod-light) ---------------- */
function supaAdmin() {
  // SERVICE_ROLE is safe on server (API routes/SSR). Never send to browser.
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE,
    { auth: { persistSession: false } }
  );
}

async function supabaseUpload({ path, buffer, contentType }) {
  const supa = supaAdmin();
  const bucket = process.env.SUPABASE_BUCKET || 'vibes';
  const { error } = await supa.storage
    .from(bucket)
    .upload(path, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
  if (error) throw error;

  // If bucket is public
  const { data } = supa.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl, key: path };
}

/* ---------------- R2 (production, S3-compatible) ---------------- */
function r2() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

async function r2Upload({ path, buffer, contentType }) {
  const s3 = r2();
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: path,
    Body: buffer,
    ContentType: contentType || 'application/octet-stream',
  }));
  const base = (process.env.R2_PUBLIC_BASE || '').replace(/\/+$/, '');
  return { url: `${base}/${encodeURI(path)}`, key: path };
}

/* ---------------- Unified API ---------------- */
export async function storageUpload({ path, buffer, contentType }) {
  if (!path || !buffer) throw new Error('Missing path or buffer');
  return BACKEND === 'r2'
    ? r2Upload({ path, buffer, contentType })
    : supabaseUpload({ path, buffer, contentType });
}
