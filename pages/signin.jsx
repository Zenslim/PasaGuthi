// pages/signin.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/router";

/* ---------- Helpers for base64url <-> Uint8 ---------- */
const b64uToUint8 = (b64u) => {
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
  for (let i = 0; i < u8.length; i++) str += String.fromCharCode(u8[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

/* Normalize server options: decode challenge + allowCredentials IDs */
function normalizeAssertOptions(opts) {
  return {
    ...opts,
    challenge: b64uToUint8(opts.challenge),
    allowCredentials: (opts.allowCredentials || []).map((cred) => ({
      ...cred,
      id: b64uToUint8(cred.id),
    })),
  };
}

export default function SignIn() {
  const router = useRouter();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setErr("");
    // Replace with your server API call
    const res = await fetch("/api/auth/password-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ mobile, password }),
    });
    if (res.ok) router.push("/dashboard");
    else setErr("Invalid credentials.");
  }

  async function handleBiometric() {
    setErr("");
    try {
      // 1) Ask server for assertion options
      const raw = await fetch("/api/auth/webauthn/challenge", {
        credentials: "include",
      }).then((r) => r.json());

      const opts = normalizeAssertOptions(raw);

      // 2) Call WebAuthn API
      const assertion = await navigator.credentials.get({ publicKey: opts });
      if (!assertion) throw new Error("No credential returned.");

      // 3) Send to server
      const cred = {
        id: assertion.id,
        type: assertion.type,
        rawId: uint8ToB64u(new Uint8Array(assertion.rawId)),
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

      const res = await fetch("/api/auth/webauthn/assert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(cred),
      });
      if (!res.ok) throw new Error("Biometric login failed.");
      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setErr(e.message);
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
            className="w-full border rounded-lg px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
          />

          <label className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" /> Remember Me
          </label>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold"
          >
            Login
          </button>
        </form>

        <button
          onClick={handleBiometric}
          className="w-full flex justify-center items-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-50"
        >
          <span role="img" aria-label="fingerprint">
            🔒
          </span>{" "}
          Use Biometric
        </button>

        {err && <p className="text-red-500 text-sm text-center">{err}</p>}

        <div className="text-center text-sm text-gray-500">
          New here? <a href="/welcome" className="text-blue-600">Register</a> |{" "}
          <a href="/recovery" className="text-blue-600">Forgot Password?</a>
        </div>
      </div>
    </main>
  );
}
