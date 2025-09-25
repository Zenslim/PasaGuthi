// pages/dashboard.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

/** ---------- helpers ---------- */
const safe = (v, d = "") => (v === null || v === undefined ? d : v);
const getLocal = (k) => (typeof window !== "undefined" ? localStorage.getItem(k) : null);
const setLocal = (k, v) => (typeof window !== "undefined" ? localStorage.setItem(k, v) : void 0);

/** Try a select on a table with a builder; swallow errors so we can try other paths. */
async function selectFirst(table, build) {
  try {
    let q = supabase
      .from(table)
      .select(
        "id, email, name, thar, region, phone, skills, karma, karma_points, guthiKey, guthi_key, created_at, updated_at"
      )
      .limit(1);
    q = build(q);
    const { data, error } = await q;
    if (error) throw error;
    return data && data[0] ? data[0] : null;
  } catch {
    return null;
  }
}

/** Upsert into a table with flexible key names and onConflict hint (best effort). */
async function upsertProfile(table, row, onConflictCols = "id") {
  try {
    const { data, error } = await supabase
      .from(table)
      .upsert(row, { onConflict: onConflictCols, ignoreDuplicates: false })
      .select()
      .limit(1);
    if (error) throw error;
    return data && data[0] ? data[0] : null;
  } catch (e) {
    // Second-chance without onConflict (some PostgREST versions choke if column missing)
    try {
      const { data, error } = await supabase.from(table).upsert(row).select().limit(1);
      if (error) throw error;
      return data && data[0] ? data[0] : null;
    } catch {
      return null;
    }
  }
}

export default function Dashboard() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [sessionUser, setSessionUser] = useState(null);
  const [guthiKey, setGuthiKey] = useState("");
  const [profile, setProfile] = useState(null);

  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  /** 1) grab session + local guthiKey */
  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        const u = data?.session?.user || null;
        setSessionUser(u || null);

        const lk = safe(getLocal("guthiKey"), "").trim();
        if (lk) setGuthiKey(lk);
      } catch (e) {
        setErr(`Auth error: ${e.message || e}`);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const userId = sessionUser?.id || null;
  const userEmail = sessionUser?.email || "";
  const meta = sessionUser?.user_metadata || {};
  const guessedName = useMemo(() => {
    return (
      safe(meta.full_name) ||
      `${safe(meta.first_name)} ${safe(meta.last_name)}`.trim() ||
      safe(getLocal("name")) ||
      ""
    ).trim();
  }, [meta]);

  /** 2) load profile. If not found, AUTO-HEAL by creating it. */
  const loadOrCreate = useCallback(async () => {
    if (!userId) return;

    setBusy(true);
    setErr("");
    setMsg("");

    // Try locate in users/profiles by id first (RLS-friendly), then by guthiKey
    const key = safe(guthiKey, "").trim();

    // lookups (ordered for fastest RLS path first)
    let row =
      (await selectFirst("profiles", (q) => q.eq("id", userId))) ||
      (await selectFirst("users", (q) => q.eq("id", userId))) ||
      (key &&
        ((await selectFirst("profiles", (q) => q.or(`guthiKey.eq.${key},guthi_key.eq.${key}`))) ||
          (await selectFirst("users", (q) => q.or(`guthiKey.eq.${key},guthi_key.eq.${key}`)))));

    if (!row) {
      // AUTO-HEAL: attempt to create a minimal profile row the current user can see via RLS
      // Assumptions for RLS: INSERT where id = auth.uid() is allowed (standard Supabase pattern).
      const seed = {
        id: userId,
        email: userEmail || null,
        name: guessedName || null,
        guthi_key: key || null, // both keys for safety
        guthiKey: key || null,
        // optional starter fields (null-safe)
        thar: safe(getLocal("thar"), null),
        region: safe(getLocal("region"), null),
        phone: safe(getLocal("phone"), null),
        skills: safe(getLocal("skills"), null),
        updated_at: new Date().toISOString(),
      };

      // Prefer 'profiles' as canonical storage; fall back to 'users' if profiles table isn’t there
      row =
        (await upsertProfile("profiles", seed, "id")) ||
        (await upsertProfile("users", seed, "id"));
    }

    if (row) {
      // normalize keys + persist guthiKey if we learned it from DB
      const dbKey = row.guthiKey || row.guthi_key || key;
      if (dbKey && dbKey !== key) {
        setLocal("guthiKey", dbKey);
        setGuthiKey(dbKey);
      }
      setProfile(row);
      setMsg(row?.created_at ? "✅ Profile loaded." : "✅ Profile created.");
    } else {
      setErr(
        "Could not load or create your profile. This is usually a database policy issue (RLS) or mismatched table/columns."
      );
    }

    setBusy(false);
  }, [userId, userEmail, guthiKey, guessedName]);

  useEffect(() => {
    if (ready && userId) loadOrCreate();
  }, [ready, userId, loadOrCreate]);

  /** 3) fix-buttons if something still blocks auto-heal */
  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("guthiKey");
      ["name", "thar", "region", "phone", "skills"].forEach((k) => localStorage.removeItem(k));
    }
    router.replace("/signin");
  };

  /** ---------- UI ---------- */

  if (!ready || busy) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>🌿 Loading your Dashboard...</p>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-lg">You’re signed out.</p>
          <button
            onClick={() => router.push("/signin")}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    // Only shown if RLS/columns blocked auto-heal
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-md mx-auto text-center space-y-3">
          <h1 className="text-2xl font-bold">We couldn’t access your profile yet.</h1>
          <p className="text-sm text-gray-300">
            I tried to auto-create it but was blocked (likely RLS or schema). Use a quick fallback:
          </p>
          {err && <p className="text-sm text-amber-400">{err}</p>}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={() => router.push("/welcome")}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
            >
              🌱 Finish Welcome
            </button>
            <button
              onClick={() => router.push("/edit-profile")}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
            >
              ✏️ Edit Profile
            </button>
            <button
              onClick={signOut}
              className="w-full py-3 px-4 rounded-xl bg-zinc-700 hover:bg-zinc-600 text-white font-semibold"
            >
              🚪 Sign Out & Start Fresh
            </button>
            <button
              onClick={loadOrCreate}
              className="w-full py-3 px-4 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-white font-semibold"
            >
              🔁 Try Auto-Create Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const karma = profile?.karma ?? profile?.karma_points ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-yellow-300 mb-1">
            🌸 Welcome, {safe(profile?.name, "Friend")} {safe(profile?.thar)}
          </h1>
          <p className="text-sm italic text-gray-400">Your circle remembers you.</p>
        </div>

        {(msg || err) && (
          <p className={`text-sm mb-6 text-center ${err ? "text-red-400" : "text-emerald-300"}`}>
            {err || msg}
          </p>
        )}

        <div className="grid gap-2 text-center text-base mb-10">
          <p>📧 <span className="text-blue-300">{safe(profile?.email, "—")}</span></p>
          <p>📍 <span className="text-blue-300">{safe(profile?.region, "—")}</span></p>
          <p>📱 <span className="text-orange-300">{safe(profile?.phone, "—")}</span></p>
          <p>🛠 <span className="text-purple-300">{safe(profile?.skills, "—")}</span></p>
          <p>✨ <span className="text-pink-300 font-mono">Karma: {karma}</span></p>
          <p className="text-xs text-gray-500">
            Key: <span className="font-mono">{safe(profile?.guthiKey || profile?.guthi_key, "—")}</span>
          </p>
        </div>

        <div className="grid gap-4">
          <button
            onClick={() => router.push("/edit-profile")}
            className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-lg font-semibold"
          >
            ✏️ Edit Profile
          </button>
          <button
            onClick={() => router.push("/timeline")}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-semibold"
          >
            📜 My Timeline
          </button>
          <button
            onClick={() => router.push("/guthyars")}
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-semibold"
          >
            🧑‍🤝‍🧑 Guthyars
          </button>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              setLocal("guthiKey", "");
              router.replace("/signin");
            }}
            className="px-4 py-2 rounded-xl bg-zinc-700 hover:bg-zinc-600"
          >
            🚪 Sign Out
          </button>
        </div>

        <div className="mt-8 text-center text-sm italic text-gray-500">
          “Your path unfolds as you whisper, act, and listen.”
        </div>
      </div>
    </div>
  );
}
