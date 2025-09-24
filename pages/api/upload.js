// /pages/api/upload.js
export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } }, // adjust as needed
};

import { storageUpload } from '@/lib/storage';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { path, contentBase64, contentType } = req.body || {};
    if (!path || !contentBase64) return res.status(400).json({ error: 'path and contentBase64 required' });

    const buffer = Buffer.from(contentBase64, 'base64');
    const out = await storageUpload({ path, buffer, contentType });
    return res.status(200).json(out); // { url, key }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
