// pages/signin.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

/* ---------------- Base64URL helpers for WebAuthn ---------------- */
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
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${url}: ${t.slice(0,180)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const head = await res.text().catch(() => "");
    throw new Error(`Unexpected content-type: ${ct}. Body: ${head.slice(0,180)}`);
  }
  return res.json();
}

export default function SignIn() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [hint, setHint] = useState("Scanning for your Guthi Key…");
  const triedRef = useRef(false);

  // Single path: Platform passkey (fingerprint/face). OTP/password live in /recovery.
  useEffect(() => {
    if (triedRef.current) return;
    triedRef.current = true;
    attemptLogin().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function attemptLogin() {
    setBusy(true); setErr(""); setHint("Touch your fingerprint sensor or look at the camera…");

    try {
      if (!("PublicKeyCredential" in window)) {
        throw new Error("This device doesn't support WebAuthn / passkeys.");
      }

      // 1) Ask server for assertion options (challenge, rpId, etc.)
      const opts = await getJSON("/api/auth/webauthn/challenge", { credentials: "include" });

      // 2) Prefer Conditional UI (inline hint for returning users)
      let mediation = "required";
      try {
        const cond = await PublicKeyCredential.isConditionalMediationAvailable?.();
        if (cond) mediation = "conditional";
      } catch {}

      // 3) Trigger platform biometric
      const assertion = await navigator.credentials.get({ publicKey: opts, mediation });
      if (!assertion) throw new Error("No credential returned.");

      // 4) Send result to server to verify and create session
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
        credentials: "include",
        body: JSON.stringify(cred),
      });

      if (!result?.ok) throw new Error(result?.message || "Assertion rejected");
      if (result.guthiKey) localStorage.setItem("guthiKey", result.guthiKey); // display-only handle

      router.push("/dashboard");
    } catch (e) {
      console.error(e);
      setErr(e.message || "Passkey login failed.");
      setHint("Tap Try Again or use recovery.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-zinc-100 grid place-items-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Enter the Digital Guthi</h1>
          <p className="text-zinc-400">Fingerprint or Face ID will open the gate.</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 grid place-items-center">🔒</div>
            <div className="flex-1">
              <p className="text-sm text-zinc-300">{hint}</p>
              {busy && <p className="text-xs text-zinc-500">Waiting for device…</p>}
              {err && <p className="text-sm text-red-400 mt-1">{err}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={attemptLogin}
              disabled={busy}
              className="flex-1 px-4 py-3 rounded-xl bg-white/90 text-black hover:bg-white disabled:opacity-50"
            >
              {busy ? "Authenticating…" : "Try Again"}
            </button>
            <a
              href="/recovery"
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 whitespace-nowrap"
            >
              Recovery
            </a>
          </div>
        </div>

        <p className="text-xs text-zinc-500 text-center">
          New here? <a className="underline hover:no-underline" href="/welcome">Create your Guthi identity</a>
        </p>
      </div>
    </main>
  );
}
