// pages/signin.jsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient"; // still needed for OTP until edge wired
// TEMPORARY: keep bcrypt client-side only until /auth/password-login is live
import bcrypt from "bcryptjs";

export default function SignIn() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");  // guthiKey or +977...
  const [password, setPassword]   = useState("");
  const [phone, setPhone]         = useState("");    // for OTP
  const [busy, setBusy]           = useState(false);
  const [msg, setMsg]             = useState("");
  const [err, setErr]             = useState("");
  const [canPasskey, setCanPasskey] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.PublicKeyCredential) setCanPasskey(true);
  }, []);

  // --- A) Guthi Key / Phone + Password (server-first; client fallback) ---
  async function signInPassword(e) {
    e.preventDefault();
    setBusy(true); setErr(""); setMsg("");

    try {
      // 1) Preferred: server verifies and starts session
      const r = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({ identifier, password })
      });
      if (r.ok) {
        router.push("/dashboard"); return;
      }

      // 2) Temporary fallback to your existing client flow (until Edge is live)
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

  // --- B) Phone OTP (no email, no Google) ---
  async function startOtp() {
    setBusy(true); setErr(""); setMsg("");
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.trim(),
        options: { channel: "sms" }
      });
      if (error) throw error;
      setMsg("📲 OTP sent via SMS. Enter the code in the system prompt if asked.");
    } catch (e) {
      setErr(`❌ ${e.message || "Failed to send OTP"}`);
    } finally {
      setBusy(false);
    }
  }

  // --- C) Biometric / Passkey (WebAuthn) ---
  async function usePasskey() {
    setBusy(true); setErr(""); setMsg("");
    try {
      const pre = await fetch("/api/auth/webauthn/challenge");
      const opts = await pre.json();
      // navigator.credentials.get with server-provided "publicKey" options
      const assertion = await navigator.credentials.get({ publicKey: opts });
      const res = await fetch("/api/auth/webauthn/assert", {
        method: "POST",
        body: JSON.stringify(assertion),
      });
      if (!res.ok) throw new Error("Passkey assertion failed");
      router.push("/dashboard");
    } catch (e) {
      setErr(`⚠️ ${e.message || "Biometric login failed or was cancelled"}`);
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
            required
            placeholder="maya-shrestha-bhaktapur-abc12 or +97798XXXXXXX"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-full bg-zinc-900/70 border border-zinc-800 p-3 rounded-xl"
            autoComplete="username"
          />
          <input
            type="password"
            required
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
          New here? <a href="/welcome" className="underline hover:no-underline">Create your Guthi identity</a>
        </p>
      </div>
    </main>
  );
}
