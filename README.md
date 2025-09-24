# Pasaguthi Drop-in Bundle

This zip contains three production-ready files:

- `lib/storage.js` – unified storage adapter (Supabase now, R2-ready later)
- `pages/api/upload.js` – upload endpoint (JSON in: {path, contentBase64, contentType}, JSON out: {url, key})
- `pages/guthyars.jsx` – SSR member directory with filters & pagination

## Env (Vercel → Project → Settings → Environment Variables)

```
STORAGE_BACKEND=supabase           # later: r2

NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE=...
SUPABASE_BUCKET=vibes

R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET=vibes
R2_PUBLIC_BASE=https://<your-r2-public-domain>
```

## Notes
- Keep SERVICE_ROLE server-side only (API/SSR). Never expose to client.
- `/guthyars` expects a `profiles` table with:
  - id uuid, name text, title text, region text, skills text[], karma_points int, photo_url text.
