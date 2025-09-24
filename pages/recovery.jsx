// pages/recovery.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";

async function getJSON(url, init) {
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} @ ${url}: ${t.slice(0,200)}`);
  }
  if (!ct.includes("application/json")) {
    const t = await res.text().catch(() => "");
    throw new Error(`Unexpected content-type: ${ct}: ${t.slice(0,200)}`);
  }
  return res.json();
}

export default function Recovery() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function send() {
    setErr(""); setMsg(""); setBusy(true);
    try {
      const r = await getJSON("/api/auth/otp/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!r?.ok) throw new Error(r?.message || "Failed to send OTP.");
      setMsg("OTP sent. Check your phone.");
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  }

  async function verify() {
    setErr(""); setMsg(""); setBusy(true);
    try {
      const r = await getJSON("/api/auth/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp: code }),
      });
      if (!r?.ok) throw new Error(r?.message || "OTP verification failed.");
      router.push("/dashboard");
    } catch (e) {
      setErr(e.message);
    } finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold text-center">Account Recovery</h1>

        <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40 space-y-3">
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (E.164, e.g., +97798XXXXXXXX)"
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none"
            inputMode="tel"
          />
          <div className="flex gap-2">
            <button
              onClick={send}
              disabled={busy || !phone}
              className="flex-1 px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send OTP"}
            </button>
          </div>

          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter OTP code"
            className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none"
            inputMode="numeric"
          />
          <button
            onClick={verify}
            disabled={busy || !code}
            className="w-full px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify & Continue"}
          </button>

          {msg && <p className="text-sm text-emerald-400">{msg}</p>}
          {err && <p className="text-sm text-red-400">{err}</p>}
        </div>

        <p className="text-center text-xs text-zinc-500">
          Prefer biometrics? <a className="underline hover:no-underline" href="/signin">Go back to Sign-in</a>
        </p>
      </div>
    </main>
  );
}
