// /pages/guthyars.jsx (privacy-safe: is_public + noindex)
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const PAGE_SIZE = 20;

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // read-only fallback if policy allows

export async function getServerSideProps({ query }) {
  const q = (query.q || '').toString().trim();
  const region = (query.region || '').toString().trim();
  const skill = (query.skill || '').toString().trim();
  const page = Math.max(parseInt(query.page || '1', 10), 1);

  const supa = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

  let req = supa
    .from('profiles')
    .select('id,name,title,region,skills,karma_points,photo_url', { count: 'exact' })
    .eq('is_public', true); // only list opt-in profiles

  if (q) req = req.ilike('name', `%${q}%`);
  if (region) req = req.eq('region', region);
  if (skill)  req = req.contains('skills', [skill]); // skills should be text[]

  req = req.order('karma_points', { ascending: false })
           .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

  const { data, error, count } = await req;
  if (error) {
    return { props: { profiles: [], total: 0, page, q, region, skill, err: error.message } };
  }

  return { props: { profiles: data || [], total: count || 0, page, q, region, skill } };
}

export default function Guthyars({ profiles, total, page, q, region, skill, err }) {
  const router = useRouter();
  const totalPages = Math.max(Math.ceil(total / 20), 1);

  function submitFilters(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const next = {
      q: form.get('q') || '',
      region: form.get('region') || '',
      skill: form.get('skill') || '',
      page: '1',
    };
    router.push({ pathname: '/guthyars', query: next });
  }

  const go = (p) => router.push({ pathname: '/guthyars', query: { q, region, skill, page: p } });

  return (
    <div className="min-h-screen bg-black text-white">
      <Head>
        {/* Hide the directory from search engines to protect member privacy */}
        <meta name="robots" content="noindex,nofollow" />
        <title>Guthyars (Members)</title>
      </Head>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold mb-4">Guthyars (Members)</h1>

        <form onSubmit={submitFilters} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <input
            name="q" defaultValue={q}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
            placeholder="Search name…"
          />
          <input
            name="region" defaultValue={region}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
            placeholder="Region (e.g., Kathmandu)"
          />
          <input
            name="skill" defaultValue={skill}
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2"
            placeholder="Skill (e.g., CNC)"
          />
          <button className="rounded-xl px-4 py-2 bg-white text-black font-medium">Filter</button>
        </form>

        {err && (
          <div className="mb-4 text-red-400 text-sm">
            Failed to load directory: {err}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div key={p.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex gap-3">
              <div className="w-16 h-16 rounded-xl bg-zinc-800 overflow-hidden flex items-center justify-center">
                {p.photo_url
                  ? <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  : <span className="text-zinc-500 text-sm">No Photo</span>}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.name || 'Unnamed'}</h3>
                  <span className="text-xs text-zinc-400">⭐ {p.karma_points ?? 0}</span>
                </div>
                <div className="text-sm text-zinc-400">{p.title || '—'}</div>
                <div className="text-xs text-zinc-500">{p.region || '—'}</div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {(p.skills || []).map((s) => (
                    <span key={s} className="text-xs bg-zinc-800 border border-zinc-700 rounded-md px-2 py-0.5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => go(page - 1)}
            className="px-3 py-1 rounded-lg border border-zinc-700 disabled:opacity-40"
          >
            Prev
          </button>
          <span className="text-sm text-zinc-400">Page {page} / {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => go(page + 1)}
            className="px-3 py-1 rounded-lg border border-zinc-700 disabled:opacity-40"
          >
            Next
          </button>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          Showing {(profiles?.length || 0)} of {total} member(s).
        </div>

        <div className="mt-8">
          <Link href="/" className="text-sm underline text-zinc-400 hover:text-white">← Back home</Link>
        </div>
      </div>
    </div>
  );
}
