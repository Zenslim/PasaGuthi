// pages/dashboard.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- Base64URL helpers ---------------- */
const b64uToUint8 = (b64u) => {
  if (b64u instanceof Uint8Array) return b64u;
  if (Array.isArray(b64u)) return new Uint8Array(b64u);
  if (b64u && typeof b64u === "object" && Array.isArray(b64u.data)) return new Uint8Array(b64u.data); // Node Buffer JSON
  if (typeof b64u !== "string") throw new Error("Expected base64url string");
  const pad = (s) => s + "===".slice((s.length + 3) % 4);
  const b64 = pad(b64u.replace(/-/g, "+").replace(/_/g, "/"));
  const str = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
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
  const b64 = (typeof btoa !== "undefined" ? btoa(str) : Buffer.from(str, "binary").toString("base64"));
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

export default function Dashboard() {
  const router = useRouter();

  // Identity state
  const [ready, setReady] = useState(false);
  const [guthiKey, setGuthiKey] = useState("");
  const [userId, setUserId] = useState(null);

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
      const localGuthiKey = (typeof window !== "undefined" && localStorage.getItem("guthiKey")) || "";
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

  /* 3) Check if a passkey already exists */
  const refreshHasPasskey = useCallback(async () => {
    try {
      setErr("");
      if (guthiKey) {
        const { data, error } = await supabase
          .from("webauthn_credentials")
          .select("id")
          .eq("guthi_key", guthiKey)
          .limit(1);
        if (error) throw error;
        setHasPasskey(!!(data && data.length));
        return;
      }
      if (userId) {
        const { data, error } = await supabase
          .from("webauthn_credentials")
          .select("id")
          .eq("user_id", userId)
          .limit(1);
        if (error) throw error;
        setHasPasskey(!!(data && data.length));
      }
    } catch (e) {
      console.warn("Passkey existence check failed:", e.message);
      setHasPasskey(false);
    }
  }, [guthiKey, userId]);

  useEffect(() => {
    if (ready) refreshHasPasskey();
  }, [ready, refreshHasPasskey]);

  /* 4) Register a passkey (resident/discoverable) */
  async function registerPasskey() {
    setBusy(true); setMsg(""); setErr("");
    try {
      let key = (guthiKey || "").trim();
      if (!key) {
        const prompted = prompt("Enter your Guthi Key to register a passkey:");
        if (!prompted) throw new Error("Guthi Key is required");
        key = prompted.trim();
      }

      // 4.1 Get options (server sets cookies; we keep GET support)
      const options = await getJSON(`/api/auth/webauthn/register-challenge?guthiKey=${encodeURIComponent(key)}`);

      // 4.2 Build a clean PublicKeyCredentialCreationOptions:
      //     - challenge comes as base64url string -> decode to bytes
      //     - ALWAYS rebuild user.id from guthiKey (bytes), avoiding bad types from JSON
      const publicKey = {
        ...options,
        challenge: b64uToUint8(options.challenge),
        user: {
          ...options.user,
          id: new TextEncoder().encode(key), // ✅ critical fix: never b64-decode JSON user.id
          name: key,
          displayName: options?.user?.displayName || key,
        },
      };

      // 4.3 Ask authenticator
      const att = await navigator.credentials.create({ publicKey });
      if (!att) throw new Error("User cancelled or no authenticator available");

      // 4.4 Serialize for JSON
      const cred = {
        id: att.id,
        type: att.type,
        rawId: uint8ToB64u(new Uint8Array(att.rawId)),
        response: {
          attestationObject: uint8ToB64u(new Uint8Array(att.response.attestationObject)),
          clientDataJSON:    uint8ToB64u(new Uint8Array(att.response.clientDataJSON)),
          transports: att.response.getTransports?.() || [],
        },
        clientExtensionResults: att.getClientExtensionResults?.() || {},
      };

      // 4.5 Verify & store on server (cookies ride along)
      const result = await getJSON("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });
      if (!result?.ok) throw new Error(result?.message || "Registration failed");

      const finalKey = result.guthiKey || key;
      localStorage.setItem("guthiKey", finalKey);
      setGuthiKey(finalKey);

      setMsg("✅ Passkey registered. Next time you can sign in with one tap.");
      setHasPasskey(true);
    } catch (e) {
      setErr(`❌ ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <main className="min-h-screen grid place-items-center bg-black text-white">
        <p>Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold">Welcome to your Guthi Dashboard</h1>
          {guthiKey ? (
            <p className="text-sm text-zinc-400">
              Signed in as <span className="font-mono">{guthiKey}</span>
            </p>
          ) : (
            <p className="text-sm text-zinc-400">Signed in via phone session</p>
          )}
        </header>

        {/* Passkey section */}
        <section className="space-y-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl">
          <h2 className="text-lg font-semibold">Biometric sign-in</h2>
          {!browserSupportsPasskey && (
            <p className="text-sm text-amber-400">
              This browser/device doesn’t support passkeys (WebAuthn).
            </p>
          )}

          {browserSupportsPasskey && hasPasskey ? (
            <p className="text-sm text-emerald-300">
              ✅ A passkey is already registered for this account on the server.
            </p>
          ) : browserSupportsPasskey ? (
            <div className="space-y-2">
              <p className="text-sm text-zinc-400">
                Add a passkey to unlock one-tap logins on this device.
              </p>
              <button
                type="button"
                onClick={registerPasskey}
                disabled={busy}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
              >
                {busy ? "Registering…" : "Register Passkey"}
              </button>
            </div>
          ) : null}

          {(msg || err) && (
            <p className={`text-sm ${err ? "text-red-400" : "text-emerald-300"}`}>{err || msg}</p>
          )}
        </section>

        {/* …your other dashboard content… */}
      </div>
    </main>
  );
}
