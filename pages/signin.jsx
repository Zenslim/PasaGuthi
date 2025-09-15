// pages/signin.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
// TEMP: keep bcrypt client-side until you move password verification server-side
import bcrypt from "bcryptjs";

/* ---------------- Base64URL helpers for WebAuthn ---------------- */
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

export default function SignIn() {
  const router = useRouter();

  // A) Guthi Key / Phone + Password
  const [identifier, setIdentifier] = useState(""); // guthiKey or +977...
  const [password, setPassword] = useState("");

  // B) Phone OTP
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // C) Passkeys
  const [canPasskey, setCanPasskey] = useState(false);

  // UI
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.PublicKeyCredential) setCanPasskey(true);
  }, []);

  /* ---------------- A) Password entry (server-first; client fallback) ---------------- */
  async function signInPassword(e) {
    e.preventDefault();
    setBusy(true); setErr(""); setMsg("");
    try {
      // Preferred: server route (implement when ready)
      const r = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      if (r.ok) {
        router.push("/dashboard");
        return;
      }

      // TEMP fallback: your existing client-side bcrypt flow
      const isPhone = identifier.trim().startsWith("+");
      const key = isPhone ? "phone" : "guthiKey";
      const { data, error } = await supabase
        .from("users").select("*").eq(key, identifier.trim()).limit(1);
      if (error || !data?.length) throw new Error("User not found");

      const user = data[0];
      if (!user.password) throw new Error("This Guthi identity has no password set");
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) throw new Error("Incorrect password");

      localStorage.setItem("guthiKey", user.guthiKey);
      router.push("/dashboard");
    } catch (e) {
      setErr(`❌ ${e.message || "Login failed"}`);
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- B) Phone OTP ---------------- */
  async function startOtp() {
    setBusy(true); setErr(""); setMsg("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: { channel: "sms" },
      });
      if (error) throw error;
      setOtpSent(true);
      setMsg("📲 OTP sent via SMS.");
    } catch (e) {
      setErr(`❌ ${e.message || "Failed to send OTP"}`);
    } finally {
      setBusy(false);
    }
  }
  async function verifyOtp() {
    setBusy(true); setErr(""); setMsg("");
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: otpCode.trim(),
        type: "sms",
      });
      if (error) throw error;
      if (!data?.session) throw new Error("OTP verified but session not issued");
      router.push("/dashboard");
    } catch (e) {
      setErr(`❌ ${e.message || "OTP verification failed"}`);
    } finally {
      setBusy(false);
    }
  }

  /* ---------------- C) Biometric / Passkey (discoverable) ---------------- */
  async function usePasskey() {
    setBusy(true); setErr(""); setMsg("");
    try {
      // No identifier needed: discoverable credentials
      const options = await getJSON("/api/auth/webauthn/challenge");

      const publicKey = {
        ...options,
        challenge: b64uToUint8(options.challenge),
        allowCredentials: (options.allowCredentials || []).map((c) => ({
          ...c,
          id: b64uToUint8(c.id),
        })),
      };

      const assertion = await navigator.credentials.get({ publicKey });

      const cred = {
        id: assertion.id,
        type: assertion.type,
        rawId: uint8ToB64u(new Uint8Array(assertion.rawId)),
        response: {
          authenticatorData: uint8ToB64u(new Uint8Array(assertion.response.authenticatorData)),
          clientDataJSON:    uint8ToB64u(new Uint8Array(assertion.response.clientDataJSON)),
          signature:         uint8ToB64u(new Uint8Array(assertion.response.signature)),
          userHandle: assertion.response.userHandle
            ? uint8ToB64u(new Uint8Array(assertion.response.userHandle))
            : null,
        },
        clientExtensionResults: assertion.getClientExtensionResults?.() || {},
      };

      const result = await getJSON("/api/auth/webauthn/assert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cred),
      });

      if (!result?.ok) throw new Error(result?.message || "Assertion rejected");
      if (result.guthiKey) localStorage.setItem("guthiKey", result.guthiKey);

      router.push("/dashboard");
    } catch (e) {
      setErr(`⚠️ Passkey login failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-black text-white px-4">
      <div className="w-full max-w-md space-y-6 bg-zinc-950/60 border border-zinc-800 p-6 rounded-2xl">
        <h1 className="text-2xl font-bold text-center">🔐 Enter PasaGuthi</h1>
        <p className="text-sm text-zinc-400 text-center">
          One door for everyone. Roles decide what you can do inside.
        </p>

        {/* A) Guthi Key / Phone + Password */}
        <form onSubmit={signInPassword} className="space-y-3">
          <input
            type="text"
            placeholder="maya-shrestha-bhaktapur-abc12 or +97798XXXXXXX"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl"
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl"
            autoComplete="current-password"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full px-4 py-2 rounded-xl bg-white/90 text-black hover:bg-white disabled:opacity-50"
          >
            🌀 Enter
          </button>
        </form>

        <div className="h-px bg-zinc-800" />

        {/* B) Phone OTP */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="tel"
              placeholder="+97798XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl"
              autoComplete="tel"
            />
            <button
              onClick={startOtp}
              disabled={busy || !phone.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              Send OTP
            </button>
          </div>

          {otpSent && (
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl"
              />
              <button
                onClick={verifyOtp}
                disabled={busy || !otpCode.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          )}
        </div>

        {/* C) Passkeys */}
        {canPasskey && (
          <button
            onClick={usePasskey}
            disabled={busy}
            className="w-full px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
          >
            🔓 Use Biometric / Passkey
          </button>
        )}

        {(msg || err) && (
          <p className={`text-sm ${err ? "text-red-400" : "text-emerald-300"}`}>{err || msg}</p>
        )}

        <p className="text-xs text-zinc-500 text-center">
          New here?{" "}
          <a href="/welcome" className="underline hover:no-underline">
            Create your Guthi identity
          </a>
        </p>
      </div>
    </main>
  );
}
