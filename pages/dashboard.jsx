// pages/dashboard.jsx
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import withAuth from "../components/withAuth";
import DAOGate from "../components/DAOGate";

function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const loadUser = useCallback(async () => {
    try {
      // 1) Who is signed in (post-passkey)?
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user || null;

      // 2) Ensure we have a guthiKey (localStorage or DB lookup).
      let guthiKey = localStorage.getItem("guthiKey");

      if (!guthiKey) {
        // Prefer a direct match on your users table by auth_uid
        let { data: row, error: e1 } = await supabase
          .from("users")
          .select("*")
          .eq("auth_uid", user?.id ?? "")
          .single();

        if (!row && user?.email) {
          // Fallback: find by email
          const { data: byEmail } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();
          row = byEmail || null;
        }

        if (row?.guthiKey) {
          guthiKey = row.guthiKey;
          localStorage.setItem("guthiKey", guthiKey);
          setUserData(row);
        } else {
          // No profile yet → finish onboarding
          router.replace("/welcome");
          return;
        }
      }

      // 3) If we still don’t have the full row, fetch by guthiKey
      if (!userData && guthiKey) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("guthiKey", guthiKey)
          .single();

        if (error) throw error;
        setUserData(data);
      }
    } catch (e) {
      setErr(e?.message || "Something went wrong loading your dashboard.");
    } finally {
      setLoading(false);
    }
  }, [router, userData]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const NavButton = ({ label, href, locked, emoji }) => (
    <button
      onClick={() => !locked && router.push(href)}
      className={`w-full py-3 px-4 rounded-xl text-white text-lg font-semibold transition shadow-md ${
        locked ? "bg-gray-600 cursor-not-allowed" : "bg-violet-600 hover:bg-violet-700"
      }`}
    >
      {emoji} {label} {locked ? "🔒" : ""}
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>🌿 Loading your Dashboard…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
        <div>
          <div className="text-2xl mb-2">⚠️ Can’t load dashboard</div>
          <p className="opacity-80">{err}</p>
          <button
            onClick={() => router.replace("/welcome")}
            className="mt-4 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg"
          >
            Finish onboarding
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    // Safety net (shouldn’t happen)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>No profile found. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-800 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-yellow-300 mb-1">
            🌸 Welcome, {userData.name} {userData.thar}!
          </h1>
          <p className="text-sm italic text-gray-400">
            Let your journey begin with presence and purpose.
          </p>
        </div>

        <div className="grid gap-2 text-center text-base mb-10">
          <p>
            📍 <span className="text-blue-300">{userData.region}</span>
          </p>
          <p>
            📱 <span className="text-orange-300">{userData.phone}</span>
          </p>
          <p>
            🛠 <span className="text-purple-300">{userData.skills}</span>
          </p>
          <p>
            ✨ <span className="text-pink-300 font-mono">Karma: {userData.karma}</span>
          </p>
        </div>

        <div className="grid gap-4">
          <NavButton emoji="🔙" label="Back to Profile" href="/edit-profile" />
          <NavButton emoji="🌌" label="Guthi Echoes" href="/network/echoes" />
          <NavButton emoji="📜" label="My Timeline" href="/timeline" />
          <NavButton emoji="🧘" label="Reflect Again" href="/reflect" />
          <NavButton emoji="🕸" label="Enter Guthi Circle" href="/network/circle" />
          <NavButton emoji="🌿" label="Visit Ritual Garden" href="/grove/ritual" />
        </div>

        <div className="mt-10">
          <DAOGate />
        </div>

        <div className="mt-8 text-center text-sm italic text-gray-500">
          “Your path unfolds as you whisper, act, and listen.”
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);
