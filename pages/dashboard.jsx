"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- Base64URL helpers ---------------- */
const b64uToUint8 = (b64u) => {
  if (b64u instanceof Uint8Array) return b64u;
  if (Array.isArray(b64u)) return new Uint8Array(b64u);
  if (b64u && typeof b64u === "object" && Array.isArray(b64u.data)) return new Uint8Array(b64u.data);
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

/* ---- helper for fetch w/ cookies ---- */
async function getJSON(url, init = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} on ${url}: ${text.slice(0, 180)}`);
  }
  return res.json();
}

export default function Dashboard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [guthiKey, setGuthiKey] = useState("");
  const [userId, setUserId] = useState(null);

  const [browserSupportsPasskey, setBrowserSupportsPasskey] = useState(false);
  const [hasPasskey, setHasPasskey] = useState(false);

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

  useEffect(() => {
    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      setBrowserSupportsPasskey(true);
    }
  }, []);

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
    } catch {
      setHasPasskey(false);
    }
  }, [guthiKey]);

  useEffect(() => {
    if (ready) refreshHasPasskey();
  }, [ready, refreshHasPasskey]);

  /* 2) Register passkey */
  async function registerPasskey() {
    setBusy(true); setMsg(""); setErr("");
    try {
      let key = guthiKey || "";
      if (!key) throw new Error("Missing guthiKey");

      const options = await getJSON(`/api/auth/webauthn/register-challenge?guthiKey=${encodeURIComponent(key)}`);

      const publicKey = {
        ...options,
        challenge: b64uToUint8(options.challenge),
        user: {
          ...options.user,
          id: new TextEncoder().encode(key), // ✅ always encode fresh
          name: key,
          displayName: key,
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
          clientDataJSON:    uint8ToB64u(new Uint8Array(att.response.clientDataJSON)),
          transports: att.response.getTransports?.() || [],
        },
      };

      const result = await getJSON("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });

      if (!result?.ok) throw new Error(result?.message || "Registration failed");

      localStorage.setItem("guthiKey", result.guthiKey || key);
      setGuthiKey(result.guthiKey || key);

      setMsg("✅ Passkey registered. Next time you can sign in with one tap.");
      setHasPasskey(true);
    } catch (e) {
      setErr(`❌ ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  /* 3) Login with passkey */
  async function loginWithPasskey() {
    setBusy(true); setMsg(""); setErr("");
    try {
      const key = guthiKey || "";
      if (!key) throw new Error("Missing guthiKey");

      const options = await getJSON(`/api/auth/webauthn/challenge?guthiKey=${encodeURIComponent(key)}`);

      const publicKey = {
        ...options,
        challenge: b64uToUint8(options.challenge),
        allowCredentials: (options.allowCredentials || []).map(c => ({
          ...c,
          id: b64uToUint8(c.id),
        })),
      };

      const assertion = await navigator.credentials.get({ publicKey });
      if (!assertion) throw new Error("No credential or user cancelled");

      const cred = {
        id: assertion.id,
        rawId: uint8ToB64u(new Uint8Array(assertion.rawId)),
        type: assertion.type,
        response: {
          authenticatorData: uint8ToB64u(new Uint8Array(assertion.response.authenticatorData)),
          clientDataJSON:   uint8ToB64u(new Uint8Array(assertion.response.clientDataJSON)),
          signature:        uint8ToB64u(new Uint8Array(assertion.response.signature)),
          userHandle: assertion.response.userHandle
            ? uint8ToB64u(new Uint8Array(assertion.response.userHandle))
            : null,
        },
      };

      const result = await getJSON("/api/auth/webauthn/assert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });

      if (!result?.ok) throw new Error(result?.message || "Authentication failed");

      setMsg("✅ Logged in with passkey!");
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
            <p className="text-sm text-zinc-400">Signed in via session</p>
          )}
        </header>

        <section className="space-y-3 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl">
          <h2 className="text-lg font-semibold">Biometric sign-in</h2>
          {!browserSupportsPasskey && (
            <p className="text-sm text-amber-400">This browser/device doesn’t support passkeys.</p>
          )}

          {browserSupportsPasskey && (
            <div className="space-y-2">
              {hasPasskey ? (
                <>
                  <p className="text-sm text-emerald-300">
                    ✅ A passkey is already registered for this account.
                  </p>
                  <button
                    type="button"
                    onClick={loginWithPasskey}
                    disabled={busy}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                  >
                    {busy ? "Signing in…" : "Sign in with Passkey"}
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}

          {(msg || err) && (
            <p className={`text-sm ${err ? "text-red-400" : "text-emerald-300"}`}>{err || msg}</p>
          )}
        </section>
      </div>
    </main>
  );
}
