// pages/guthyars.jsx
"use client";

/**
 * Guthyars (Public Directory)
 * - Server-side fetch from `public.guthyars_public`
 * - Filters: q (name), region, skill
 * - Pagination: page (1-based), pageSize (default 24)
 * - Uses stable key: user_id
 *
 * ENV needed (already typical in your app):
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { useRouter } from "next/router";
import { useMemo } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getServerSideProps({ query }) {
  const page = Math.max(parseInt(query.page || "1", 10), 1);
  const pageSize = Math.min(Math.max(parseInt(query.pageSize || "24", 10), 1), 60);

  const q = (query.q || "").toString().trim();
  const region = (query.region || "").toString().trim();
  const skill = (query.skill || "").toString().trim();

  const supa = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });

  let req = supa
    .from("guthyars_public")
    .select(
      "user_id,name,title,thar,region,skills,karma_points,photo_url",
      { count: "exact" }
    );

  if (q) req = req.ilike("name", `%${q}%`);
  if (region) req = req.eq("region", region);
  if (skill) req = req.contains("skills", [skill]); // skills must be text[]

  req = req.order("name", { ascending: true });

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  req = req.range(from, to);

  const { data, error, count } = await req;

  return {
    props: {
      profiles: data || [],
      total: count || 0,
      page,
      pageSize,
      q,
      region,
      skill,
      err: error ? (error.message || "Error loading directory") : null,
    },
  };
}

export default function Guthyars({
  profiles,
  total,
  page,
  pageSize,
  q,
  region,
  skill,
  err,
}) {
  const router = useRouter();

  const totalPages = useMemo(() => {
    return Math.max(Math.ceil((total || 0) / pageSize), 1);
  }, [total, pageSize]);

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const qV = (formData.get("q") || "").toString().trim();
    const regionV = (formData.get("region") || "").toString().trim();
    const skillV = (formData.get("skill") || "").toString().trim();
    if (qV) params.set("q", qV);
    if (regionV) params.set("region", regionV);
    if (skillV) params.set("skill", skillV);
    // reset to first page on new search
    params.set("page", "1");
    params.set("pageSize", String(pageSize));
    router.push(`/guthyars?${params.toString()}`);
  };

  const changePage = (nextPage) => {
    const params = new URLSearchParams(router.query);
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));
    router.push(`/guthyars?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-black text-white px-4 py-8">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold">🧑‍🤝‍🧑 Guthyars</h1>
          <p className="mt-2 text-slate-300">Public directory of members who opted to be visible.</p>
        </header>

        <form onSubmit={onSubmit} className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by name…"
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          />
          <input
            name="region"
            defaultValue={region}
            placeholder="Filter by region…"
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          />
          <input
            name="skill"
            defaultValue={skill}
            placeholder="Filter by skill…"
            className="rounded-xl bg-white/5 border border-white/10 px-4 py-3 outline-none focus:border-white/30"
          />
          <button
            type="submit"
            className="rounded-xl bg-white text-black font-semibold px-4 py-3 hover:bg-zinc-100 transition"
          >
            Search
          </button>
        </form>

        {err && (
          <div className="mx-auto max-w-2xl mb-8 rounded-xl bg-red-600/20 border border-red-600/40 p-4 text-red-200">
            {err}
          </div>
        )}

        {!err && profiles.length === 0 ? (
          <div className="text-center text-slate-300">No public profiles found.</div>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {profiles.map((p) => (
              <ProfileCard key={p.user_id} profile={p} />
            ))}
          </section>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrev={() => page > 1 && changePage(page - 1)}
          onNext={() => page < totalPages && changePage(page + 1)}
        />
      </div>
    </div>
  );
}

function ProfileCard({ profile }) {
  const { name, title, thar, region, skills, karma_points, photo_url } = profile || {};
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 hover:border-white/20 transition">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/10 border border-white/10 flex items-center justify-center">
          {photo_url ? (
            <img
              src={photo_url}
              alt={name || "profile photo"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <span className="text-2xl">👤</span>
          )}
        </div>
        <div className="min-w-0">
          <div className="text-lg font-semibold truncate">{name || "—"}</div>
          <div className="text-sm text-slate-300 truncate">
            {title || thar || "—"}
            {(title || thar) && region ? " • " : ""}
            {region || ""}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            {Array.isArray(skills) && skills.length > 0 ? skills.join(" • ") : ""}
          </div>
        </div>
        {typeof karma_points === "number" && (
          <div className="ml-auto text-xs bg-white/10 border border-white/10 rounded-full px-2 py-1">
            karma: {karma_points}
          </div>
        )}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="mt-10 flex items-center justify-center gap-3">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className="px-3 py-2 rounded-lg border border-white/10 disabled:opacity-40 hover:bg-white/5"
      >
        ← Prev
      </button>
      <span className="text-slate-300 text-sm">
        Page <strong>{page}</strong> of <strong>{totalPages}</strong>
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className="px-3 py-2 rounded-lg border border-white/10 disabled:opacity-40 hover:bg-white/5"
      >
        Next →
      </button>
    </div>
  );
}
