// pages/signin.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";

/* ------------------------ Base64URL helpers for WebAuthn ------------------------ */
const u8ToB64u = (u8) => {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) bin += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  const b64 = (typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bin, "binary").toString("base64"));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
const b64uToU8 = (b64u) => {
  const pad = (s) => s + "===".slice((s.length + 3) % 4);
  const b64 = pad(String(b64u).replace(/-/g, "+").replace(/_/g, "/"));
  const bin = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
};

/* ---------------------------------- fetch JSON --------------------------------- */
async function getJSON(url, init) {
  const res = await fetch(url, init);
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} @ ${url}: ${text.slice(0, 240)}`);
  }
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Unexpected content-type: ${ct} @ ${url}: ${text.slice(0, 240)}`);
  }
  return res.json();
}

/* -------------------- Normalize assertion options (server → web) ---------------- */
function normalizeAssertionOptions(opts) {
  const out = structuredClone(opts || {});
  if (out.challenge && typeof out.challenge === "string") out.challenge = b64uToU8(out.challenge);
  if (Array.isArray(out.allowCredentials) && out.allowCredentials.length) {
    out.allowCredentials = out.allowCredentials.map((c) => ({
      ...c,
      id: typeof c.id === "string" ? b64uToU8(c.id) : c.id,
      transports: c.transports || ["internal"],
    }));
  } else delete out.allowCredentials; // discoverable creds → on-device key
  out.userVerification = "required";
  return out;
}

/* ------------------------------- Country options ------------------------------- */
const COUNTRIES = [
  { code: "NP", name: "Nepal", dial: "+977" },
  { code: "IN", name: "India", dial: "+91" },
  { code: "US", name: "United States", dial: "+1" },
  { code: "GB", name: "United Kingdom", dial: "+44" },
  { code: "AE", name: "UAE", dial: "+971" },
  { code: "MY", name: "Malaysia", dial: "+60" },
  { code: "EU", name: "Europe (generic)", dial: "+43" }, // fallback; adjust per need
];

export default function SignIn() {
  const router = useRouter();

  // Phone path
  const [cc, setCc] = useState(COUNTRIES[0].dial); // default +977
  const [phoneLocal, setPhoneLocal] = useState(""); // 98xxxxxxx (no +)
  const [password, setPassword] = useState("");

  // GuthiKey path
  const [guthiKey, setGuthiKey] = useState("");

  // States
  const [busy, setBusy] = useState(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [bioMsg, setBioMsg] = useState("");

  const phoneE164 = () => {
    const digits = phoneLocal.replace(/\D/g, "");
    return `${cc}${digits}`;
  };

  /* --------------------------- Password login (server) -------------------------- */
  async function doPasswordLogin() {
    setBusy(true); setMsg("");
    try {
      const identifier = guthiKey?.trim() ? guthiKey.trim() : phoneE164();
      const res = await getJSON("/api/auth/password-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier, password }),
      });
      if (!res?.ok) throw new Error(res?.message || "Login failed.");
      if (res.guthiKey) localStorage.setItem("guthiKey", res.guthiKey); // display-only
      router.push("/dashboard");
    } catch (e) {
      setMsg(e.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  /* ------------------------------ Biometric login ------------------------------ */
  async function doBiometricLogin() {
    setBioBusy(true); setBioMsg(""); setMsg("");
    try {
      if (!("PublicKeyCredential" in window)) throw new Error("Device does not support biometrics.");
      const raw = await getJSON("/api/auth/webauthn/challenge", { credentials: "include" });
      const options = normalizeAssertionOptions(raw);
      const assertion = await navigator.credentials.get({ publicKey: options, mediation: "required" });
      if (!assertion) throw new Error("No credential returned.");

      const payload = {
        id: assertion.id,
        type: assertion.type,
        rawId: u8ToB64u(new Uint8Array(assertion.rawId)),
        response: {
          clientDataJSON:    u8ToB64u(new Uint8Array(assertion.response.clientDataJSON)),
          authenticatorData: u8ToB64u(new Uint8Array(assertion.response.authenticatorData)),
          signature:         u8ToB64u(new Uint8Array(assertion.response.signature)),
          userHandle: assertion.response.userHandle
            ? u8ToB64u(new Uint8Array(assertion.response.userHandle))
            : null,
        },
        clientExtensionResults: assertion.getClientExtensionResults?.() || {},
      };

      const res = await getJSON("/api/auth/webauthn/assert", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res?.ok) throw new Error(res?.message || "Biometric login failed.");
      if (res.guthiKey) localStorage.setItem("guthiKey", res.guthiKey);
      router.push("/dashboard");
    } catch (e) {
      setBioMsg(e.message || "Biometric login failed.");
    } finally {
      setBioBusy(false);
    }
  }

  const loginDisabled = (!password) || ( !guthiKey.trim() && phoneLocal.replace(/\D/g, "").length < 8 ) || busy;

  return (
    <main className="min-h-screen bg-[#0b0b0b] text-white grid place-items-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-left">
          <h1 className="text-3xl font-semibold">Welcome to Pasaguthi</h1>
          <p className="text-zinc-400">Login with Phone or GuthiKey — or use Biometric</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40 space-y-4">
          {/* Phone (with country selector) */}
          <label className="text-sm text-zinc-300">Mobile Number</label>
          <div className="flex gap-2">
            <select
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="w-32 rounded-xl bg-zinc-800 px-3 py-3 outline-none"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.dial}>{c.name} {c.dial}</option>
              ))}
            </select>
            <input
              value={phoneLocal}
              onChange={(e) => setPhoneLocal(e.target.value)}
              placeholder="98XXXXXXXX"
              className="flex-1 rounded-xl bg-zinc-800 px-4 py-3 outline-none"
              inputMode="tel"
            />
          </div>

          {/* OR GuthiKey */}
          <div className="text-center text-xs text-zinc-500">— OR —</div>
          <label className="text-sm text-zinc-300">GuthiKey</label>
          <input
            value={guthiKey}
            onChange={(e) => setGuthiKey(e.target.value)}
            placeholder="e.g., navin-xyz"
            className="w-full rounded-xl bg-zinc-800 px-4 py-3 outline-none"
            autoCapitalize="none"
          />

          {/* Password */}
          <label className="text-sm text-zinc-300 mt-2">Password</label>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl bg-zinc-800 px-4 py-3 outline-none pr-24"
            />
            <a href="/recovery" className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-300 hover:text-white">
              Forgot?
            </a>
          </div>

          {msg && <p className="text-sm text-red-400">{msg}</p>}

          <button
            onClick={doPasswordLogin}
            disabled={loginDisabled}
            className="w-full px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Login"}
          </button>

          <div className="relative my-1 h-px bg-zinc-800" />

          <button
            onClick={doBiometricLogin}
            disabled={bioBusy}
            className="w-full px-4 py-3 rounded-xl border border-zinc-700 hover:bg-zinc-800"
          >
            {bioBusy ? "Authenticating…" : "Use Biometric"}
          </button>
          {bioMsg && <p className="text-sm text-red-400">{bioMsg}</p>}
        </div>

        <div className="text-center text-sm text-zinc-500">
          Don’t have a login?{" "}
          <a className="underline hover:no-underline" href="/welcome">Create your Guthi identity</a>
        </div>
      </div>
    </main>
  );
}
