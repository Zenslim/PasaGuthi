// pages/dashboard.jsx
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";

/* ------------ tiny utils ------------ */
const safe = (v, d = "") => (v === null || v === undefined ? d : v);
const getLocal = (k) => (typeof window !== "undefined" ? localStorage.getItem(k) : null);
const setLocal = (k, v) => (typeof window !== "undefined" ? localStorage.setItem(k, v) : void 0);

/* generic “first row” fetch with a builder; swallow errors so we can try other paths */
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
    return data?.[0] || null;
  } catch {
    return null;
  }
}

/* upsert into profiles (RLS owner policies now allow id = auth.uid()) */
async function upsertMyProfile(row) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(row, { onConflict: "id", ignoreDuplicates: false })
    .select()
    .limit(1);
  if (error) throw error;
  return data?.[0] || null;
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

  // 1) load session + local key
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

  // 2) try fetch profile by id first (RLS-friendly), then by guthiKey
  const tryLoadProfile = useCallback(async () => {
    if (!userId) return null;
    const key = safe(guthiKey, "").trim();

    const row =
      (await selectFirst("profiles", (q) => q.eq("id", userId))) ||
      (key &&
        (await selectFirst("profiles", (q) => q.or(`guthiKey.eq.${key},guthi_key.eq.${key}`))));
    return row;
  }, [userId, guthiKey]);

  // 3) if missing, AUTO-CREATE in profiles (now allowed by your RLS policies)
  const loadOrCreate = useCallback(async () => {
    if (!userId) return;

    setBusy(true);
    setErr("");
    setMsg("");

    let row = await tryLoadProfile();

    if (!row) {
      const key = safe(guthiKey, "").trim();
      const seed = {
        id: userId,
        email: userEmail || null,
        name: guessedName || null,
        guthi_key: key || null,
        guthiKey: key || null,
        // leave phone/skills/thar/region null until user fills them
        updated_at: new Date().toISOString(),
      };
      try {
        row = await upsertMyProfile(seed);
        if (row) setMsg("✅ Profile created.");
      } catch (e) {
        setErr(`Could not create your profile (RLS/schema). ${e.message || e}`);
      }
    }

    if (row) {
      const dbKey = row.guthiKey || row.guthi_key || guthiKey;
      if (dbKey && dbKey !== guthiKey) {
        setLocal("guthiKey", dbKey);
        setGuthiKey(dbKey);
      }
      setProfile(row);
      if (!msg) setMsg("✅ Profile loaded.");
    }

    setBusy(false);
  }, [userId, userEmail, guessedName, guthiKey, tryLoadProfile, msg]);

  useEffect(() => {
    if (ready && userId) loadOrCreate();
  }, [ready, userId, loadOrCreate]);

  // 4) sign out helper
  const signOut = async () => {
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      ["guthiKey", "name", "thar", "region", "phone", "skills"].forEach((k) =>
        localStorage.removeItem(k)
      );
    }
    router.replace("/signin");
  };

  /* ---------------- UI ---------------- */
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
    // Only shown if RLS/schema blocked creation (should be rare now)
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 text-white p-6">
        <div className="max-w-md mx-auto text-center space-y-3">
          <h1 className="text-2xl font-bold">We couldn’t access your profile yet.</h1>
          <p className="text-sm text-gray-300">
            We tried to auto-create it but were blocked. Please finish welcome or edit profile.
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
            🌸 Welcome, {safe(profile?.name, guessedName || "Friend")} {safe(profile?.thar)}
          </h1>
          <p className="text-sm italic text-gray-400">Your circle remembers you.</p>
        </div>

        {(msg || err) && (
          <p className={`text-sm mb-6 text-center ${err ? "text-red-400" : "text-emerald-300"}`}>
            {err || msg}
          </p>
        )}

        <div className="grid gap-2 text-center text-base mb-10">
          <p>📧 <span className="text-blue-300">{safe(profile?.email, userEmail || "—")}</span></p>
          <p>📍 <span className="text-blue-300">{safe(profile?.region, "—")}</span></p>
          <p>📱 <span className="text-orange-300">{safe(profile?.phone, "—")}</span></p>
          <p>🛠 <span className="text-purple-300">{safe(profile?.skills, "—")}</span></p>
          <p>✨ <span className="text-pink-300 font-mono">Karma: {karma}</span></p>
          <p className="text-xs text-gray-500">
            Key:{" "}
            <span className="font-mono">
              {safe(profile?.guthiKey || profile?.guthi_key || guthiKey, "—")}
            </span>
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
