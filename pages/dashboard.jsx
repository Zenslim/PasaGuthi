// pages/dashboard.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "../lib/supabaseClient";
import withAuth from "../components/withAuth";
import DAOGate from "../components/DAOGate";

/* ---------------- Base64URL helpers ---------------- */
const b64uToUint8 = (b64u) => {
  if (b64u instanceof Uint8Array) return b64u;
  if (Array.isArray(b64u)) return new Uint8Array(b64u);
  if (b64u && typeof b64u === "object" && Array.isArray(b64u.data))
    return new Uint8Array(b64u.data);
  if (typeof b64u !== "string") throw new Error("Expected base64url string");
  const pad = (s) => s + "===".slice((s.length + 3) % 4);
  const b64 = pad(b64u.replace(/-/g, "+").replace(/_/g, "/"));
  const str =
    typeof atob !== "undefined"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("binary");
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i);
  return bytes;
};

const uint8ToB64u = (u8) => {
  let str = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    str += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  }
  const b64 =
    typeof btoa !== "undefined"
      ? btoa(str)
      : Buffer.from(str, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

/* ---- Always bring/set cookies + expect JSON ---- */
async function getJSON(url, init = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json", ...(init.headers || {}) },
    ...init,
  });
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${url}: ${text.slice(0, 180)}`);
  }
  if (!ct.includes("application/json")) {
    const head = await res.text().catch(() => "");
    throw new Error(`Unexpected content-type: ${ct}. Body: ${head.slice(0, 180)}`);
  }
  return res.json();
}

function Dashboard() {
  const router = useRouter();

  // Identity state
  const [ready, setReady] = useState(false);
  const [guthiKey, setGuthiKey] = useState("");
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  // Passkey capability & existence
  const [browserSupportsPasskey, setBrowserSupportsPasskey] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);

  // UI
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  /* 1) Gate access */
  useEffect(() => {
    (async () => {
      const localGuthiKey =
        (typeof window !== "undefined" && localStorage.getItem("guthiKey")) || "";
      if (localGuthiKey) {
        setGuthiKey(localGuthiKey);
        setReady(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user?.id) {
        setUserId(data.session.user.id);
        setReady(true);
      } else {
        router.replace("/signin");
      }
    })();
  }, [router]);

  /* 2) Detect WebAuthn/Passkey capability */
  useEffect(() => {
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      setBrowserSupportsPasskey(true);
    }
  }, []);

  /* 3) Fetch profile when guthiKey is set */
  useEffect(() => {
    if (!guthiKey) return;
    (async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("guthiKey", guthiKey)
        .single();
      if (!error && data) setUserData(data);
    })();
  }, [guthiKey]);

  /* 4) Check if a passkey already exists */
  const refreshHasPasskey = useCallback(async () => {
    try {
      if (guthiKey) {
        const { data, error } = await supabase
          .from("webauthn_credentials")
          .select("id")
          .eq("guthi_key", guthiKey)
          .limit(1);
        if (error) throw error;
        setHasPasskey(!!(data && data.length));
      }
    } catch (e) {
      console.warn("Passkey existence check failed:", e.message);
      setHasPasskey(false);
    }
  }, [guthiKey]);

  useEffect(() => {
    if (ready) refreshHasPasskey();
  }, [ready, refreshHasPasskey]);

  /* 5) Register a passkey */
  async function registerPasskey() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      let key = (guthiKey || "").trim();
      if (!key) throw new Error("Guthi Key is required");

      const options = await getJSON(
        `/api/auth/webauthn/register-challenge?guthiKey=${encodeURIComponent(key)}`
      );

      const publicKey = {
        ...options,
        challenge: b64uToUint8(options.challenge),
        user: {
          ...options.user,
          id: new TextEncoder().encode(key),
          name: key,
          displayName: options?.user?.displayName || key,
        },
      };

      const att = await navigator.credentials.create({ publicKey });
      if (!att) throw new Error("User cancelled or no authenticator available");

      const cred = {
        id: att.id,
        type: att.type,
        rawId: uint8ToB64u(new Uint8Array(att.rawId)),
        response: {
          attestationObject: uint8ToB64u(new Uint8Array(att.response.attestationObject)),
          clientDataJSON: uint8ToB64u(new Uint8Array(att.response.clientDataJSON)),
          transports: att.response.getTransports?.() || [],
        },
      };

      const result = await getJSON("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });
      if (!result?.ok) throw new Error(result?.message || "Registration failed");

      const finalKey = result.guthiKey || key;
      localStorage.setItem("guthiKey", finalKey);
      setGuthiKey(finalKey);

      setMsg("✅ Passkey registered.");
      setHasPasskey(true);
    } catch (e) {
      setErr(`❌ ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  /* 6) Sign in with Passkey */
  async function loginWithPasskey() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      let key = (guthiKey || "").trim();
      if (!key) throw new Error("Guthi Key is required");

      const options = await getJSON(
        `/api/auth/webauthn/challenge?guthiKey=${encodeURIComponent(key)}`
      );

      const publicKey = {
        ...options,
        challenge: b64uToUint8(options.challenge),
        allowCredentials: (options.allowCredentials || []).map((c) => ({
          ...c,
          id: b64uToUint8(c.id),
        })),
      };

      const assertion = await navigator.credentials.get({ publicKey });
      if (!assertion) throw new Error("User cancelled or no authenticator available");

      const body = {
        id: assertion.id,
        rawId: uint8ToB64u(new Uint8Array(assertion.rawId)),
        type: assertion.type,
        response: {
          authenticatorData: uint8ToB64u(
            new Uint8Array(assertion.response.authenticatorData)
          ),
          clientDataJSON: uint8ToB64u(
            new Uint8Array(assertion.response.clientDataJSON)
          ),
          signature: uint8ToB64u(new Uint8Array(assertion.response.signature)),
          userHandle: assertion.response.userHandle
            ? uint8ToB64u(new Uint8Array(assertion.response.userHandle))
            : null,
        },
      };

      const result = await getJSON("/api/auth/webauthn/assert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!result?.ok) throw new Error(result?.message || "Authentication failed");

      localStorage.setItem("guthiKey", key);
      setGuthiKey(key);
      setMsg("✅ Signed in with your passkey.");
    } catch (e) {
      setErr(`❌ ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  /* Render */
  if (!userData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>🌿 Loading your Dashboard...</p>
      </div>
    );
  }

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
          <p>📍 <span className="text-blue-300">{userData.region}</span></p>
          <p>📱 <span className="text-orange-300">{userData.phone}</span></p>
          <p>🛠 <span className="text-purple-300">{userData.skills}</span></p>
          <p>✨ <span className="text-pink-300 font-mono">Karma: {userData.karma}</span></p>
        </div>

        {/* Passkey section */}
        <section className="space-y-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl mb-10">
          <h2 className="text-lg font-semibold">Biometric sign-in</h2>
          {!browserSupportsPasskey && (
            <p className="text-sm text-amber-400">
              This browser/device doesn’t support passkeys (WebAuthn).
            </p>
          )}

          {browserSupportsPasskey && (
            <div className="space-y-2">
              {hasPasskey ? (
                <p className="text-sm text-emerald-300">
                  ✅ A passkey is already registered for this account.
                </p>
              ) : (
                <p className="text-sm text-zinc-400">
                  Add a passkey to unlock one-tap logins on this device.
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {!hasPasskey && (
                  <button
                    type="button"
                    onClick={registerPasskey}
                    disabled={busy}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                  >
                    {busy ? "Registering…" : "Register Passkey"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={loginWithPasskey}
                  disabled={busy}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                >
                  {busy ? "Signing in…" : "Sign in with Passkey"}
                </button>
              </div>
            </div>
          )}

          {(msg || err) && (
            <p className={`text-sm ${err ? "text-red-400" : "text-emerald-300"}`}>
              {err || msg}
            </p>
          )}
        </section>

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
