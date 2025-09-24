// /lib/storage.js (patched)
// Fallbacks for env names so either NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL works,
// and SUPABASE_SERVICE_ROLE or SUPABASE_SERVICE_ROLE_KEY both work.

import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BACKEND = process.env.STORAGE_BACKEND || 'supabase';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const SUPABASE_SERVICE =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // last-resort read-only

const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'vibes';

/* ---------------- Supabase (dev/test/prod-light) ---------------- */
function supaAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE) {
    throw new Error('Supabase env missing: SUPABASE_URL or SERVICE key is not set');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE, { auth: { persistSession: false } });
}

async function supabaseUpload({ path, buffer, contentType }) {
  const supa = supaAdmin();
  const { error } = await supa.storage
    .from(SUPABASE_BUCKET)
    .upload(path, buffer, { contentType: contentType || 'application/octet-stream', upsert: true });
  if (error) throw error;

  const { data } = supa.storage.from(SUPABASE_BUCKET).getPublicUrl(path);
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
