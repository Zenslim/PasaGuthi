// pages/dashboard.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

/* ---------------- Base64URL helpers ---------------- */
const b64uToUint8 = (b64u) => {
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
  const b64 = (typeof btoa !== "undefined" ? btoa(str) : Buffer.from(str, "binary").toString("base64"))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return b64;
};
async function getJSON(url, init) {
  const res = await fetch(url, init);
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
  const [ready, setReady] = useState(false);
  const [guthiKey, setGuthiKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [canPasskey, setCanPasskey] = useState(false);

  // Gate: user must be "in" (Guthi Key or Supabase session from phone OTP)
  useEffect(() => {
    (async () => {
      const lk = localStorage.getItem("guthiKey") || "";
      if (lk) {
        setGuthiKey(lk);
        setReady(true);
        return;
      }
      // If no Guthi Key, allow Supabase session (e.g., phone OTP path)
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setReady(true);
      } else {
        router.replace("/signin");
      }
    })();
  }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.PublicKeyCredential) setCanPasskey(true);
  }, []);

  async function registerPasskey() {
    setBusy(true); setMsg(""); setErr("");
    try {
      // Need a guthiKey to bind the passkey; prompt if not found
      let key = guthiKey?.trim();
      if (!key) {
        const prompted = prompt("Enter your Guthi Key to register a passkey:");
        if (!prompted) throw new Error("Guthi Key is required");
        key = prompted.trim();
      }

      // 1) Get registration options
      const options = await getJSON(`/api/auth/webauthn/register-challenge?guthiKey=${encodeURIComponent(key)}`);

      // Some browsers require user.id as Uint8Array
      const publicKey = {
        ...options,
        challenge: b64uToUint8(options.challenge),
        user: { ...options.user, id: b64uToUint8(options.user.id) },
      };

      // 2) Native prompt to create credential
      const att = await navigator.credentials.create({ publicKey });
      if (!att) throw new Error("User cancelled or no authenticator available");

      // 3) Serialize for JSON
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

      // 4) Verify & store on server
      const result = await getJSON("/api/auth/webauthn/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });
      if (!result?.ok) throw new Error(result?.message || "Registration failed");

      localStorage.setItem("guthiKey", result.guthiKey || key);
      setGuthiKey(result.guthiKey || key);
      setMsg("✅ Passkey registered. Next time you can sign in with one tap.");
    } catch (e) {
      setErr(`❌ ${e.message}`);
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
            <p className="text-sm text-zinc-400">Signed in as <span className="font-mono">{guthiKey}</span></p>
          ) : (
            <p className="text-sm text-zinc-400">Signed in via phone session</p>
          )}
        </header>

        {/* Register Passkey */}
        <section className="space-y-2 bg-zinc-950/60 border border-zinc-800 p-4 rounded-2xl">
          <h2 className="text-lg font-semibold">Biometric sign-in</h2>
          <p className="text-sm text-zinc-400">
            Add a passkey to unlock one-tap logins on this device.
          </p>

          {canPasskey ? (
            <button
              onClick={registerPasskey}
              disabled={busy}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
            >
              {busy ? "Registering…" : "Register Passkey"}
            </button>
          ) : (
            <p className="text-sm text-amber-400">
              This browser/device doesn’t support passkeys (WebAuthn).
            </p>
          )}

          {(msg || err) && (
            <p className={`text-sm ${err ? "text-red-400" : "text-emerald-300"}`}>{err || msg}</p>
          )}
        </section>

        {/* …your dashboard content here… */}
      </div>
    </main>
  );
}
