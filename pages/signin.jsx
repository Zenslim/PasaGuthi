// pages/signin.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";

/* ---------- b64url <-> Uint8 helpers ---------- */
const b64uToUint8 = (b64u = "") => {
  const pad = (s) => s + "===".slice((s.length + 3) % 4);
  const b64 = pad(String(b64u).replace(/-/g, "+").replace(/_/g, "/"));
  const bin =
    typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};
const uint8ToB64u = (u8) => {
  let s = "";
  for (let i = 0; i < u8.length; i++) s += String.fromCharCode(u8[i]);
  return (typeof btoa !== "undefined" ? btoa(s) : Buffer.from(s, "binary").toString("base64"))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

/* Normalize server options for WebAuthn.get */
function normalizeAssertOptions(server) {
  const out = { ...server };
  out.challenge = b64uToUint8(server.challenge);
  if (Array.isArray(server.allowCredentials)) {
    out.allowCredentials = server.allowCredentials.map((c) => ({ ...c, id: b64uToUint8(c.id) }));
  }
  return out;
}

export default function SignIn() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  /* -------- Password lane (kept simple; handled by your API) -------- */
  async function handlePasswordLogin(e) {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const r = await fetch("/api/auth/password-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ mobile, password }),
      });
      if (!r.ok) throw new Error("Invalid credentials.");
      router.push("/dashboard");
    } catch (e) {
      setErr(e.message || "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  /* -------- Biometric lane (WebAuthn) -------- */
  async function handleBiometric() {
    setErr(""); setBusy(true);
    try {
      if (!("PublicKeyCredential" in window)) {
        throw new Error("This device/browser doesn’t support biometrics (WebAuthn).");
      }

      // 1) Get assertion options from server
      const raw = await fetch("/api/auth/webauthn/challenge", { credentials: "include" })
        .then((r) => r.json());
      const publicKey = normalizeAssertOptions(raw);

      // 2) Trigger OS biometric sheet
      const assertion = await navigator.credentials.get({ publicKey });
      if (!assertion) throw new Error("No credential returned. (Is a passkey registered on this device?)");

      // 3) Post back to server
      const payload = {
        id: assertion.id,
        type: assertion.type,
        rawId: uint8ToB64u(new Uint8Array(assertion.rawId)),
        response: {
          clientDataJSON:    uint8ToB64u(new Uint8Array(assertion.response.clientDataJSON)),
          authenticatorData: uint8ToB64u(new Uint8Array(assertion.response.authenticatorData)),
          signature:         uint8ToB64u(new Uint8Array(assertion.response.signature)),
          userHandle: assertion.response.userHandle
            ? uint8ToB64u(new Uint8Array(assertion.response.userHandle))
            : null,
        },
      };

      const res = await fetch("/api/auth/webauthn/assert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Biometric verification failed.");
      router.push("/dashboard");
    } catch (e) {
      // Common causes: no passkey enrolled on this device; wrong rpId/origin on server
      setErr(e.message || "Biometric login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 grid place-items-center p-6">
      <div className="w-full max-w-sm rounded-2xl shadow bg-white p-6 space-y-4">
        <h2 className="text-center text-lg font-semibold">Good Evening</h2>

        <form onSubmit={handlePasswordLogin} className="space-y-3">
          <input
            type="tel"
            placeholder="Mobile Number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 bg-white"
          />

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="accent-red-600" /> Remember Me
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        <button
          onClick={handleBiometric}
          disabled={busy}
          className="w-full flex justify-center items-center gap-2 border border-gray-300 py-2 rounded-lg
                     bg-white text-gray-900 hover:bg-gray-50 disabled:opacity-50"
          title="Use fingerprint/face (platform passkey)"
        >
          <span aria-hidden>🔒</span>
          Use Biometric
        </button>

        {err && <p className="text-red-600 text-sm text-center">{err}</p>}

        <div className="text-center text-sm text-gray-600">
          New here? <a href="/welcome" className="text-blue-600">Register</a> |{" "}
          <a href="/recovery" className="text-blue-600">Forgot Password?</a>
        </div>
      </div>
    </main>
  );
}
