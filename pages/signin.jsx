// pages/signin.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

/* -------------------------- Base64URL helpers -------------------------- */
// Uint8Array  -> base64url
const u8ToB64u = (u8) => {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    bin += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  }
  const b64 = (typeof btoa !== "undefined" ? btoa(bin) : Buffer.from(bin, "binary").toString("base64"));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};
// base64url -> Uint8Array
const b64uToU8 = (b64u) => {
  const pad = (s) => s + "===".slice((s.length + 3) % 4);
  const b64 = pad(String(b64u).replace(/-/g, "+").replace(/_/g, "/"));
  const bin = typeof atob !== "undefined" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8;
};

/* -------------------------- Fetch JSON helper -------------------------- */
async function getJSON(url, init) {
  const res = await fetch(url, init);
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} @ ${url}: ${body.slice(0, 240)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const body = await res.text().catch(() => "");
    throw new Error(`Unexpected content-type: ${ct} @ ${url}: ${body.slice(0, 240)}`);
  }
  return res.json();
}

/* -------------- Convert server options -> WebAuthn-friendly ------------- */
function normalizeAssertionOptions(opts) {
  // We expect server to send base64url strings for binary fields.
  const out = structuredClone(opts);
  if (out.challenge && typeof out.challenge === "string") {
    out.challenge = b64uToU8(out.challenge);
  }
  if (Array.isArray(out.allowCredentials)) {
    out.allowCredentials = out.allowCredentials.map((c) => ({
      ...c,
      id: typeof c.id === "string" ? b64uToU8(c.id) : c.id,
      // Force platform authenticator only (biometrics)
      transports: c.transports || ["internal"],
    }));
  } else {
    // Discoverable creds: let OS pick on-device key
    delete out.allowCredentials;
  }
  // Enforce user verification for biometrics
  out.userVerification = "required";
  return out;
}

/* --------------------------------- UI ---------------------------------- */
export default function SignIn() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("Scanning for your Guthi Key…");
  const [err, setErr] = useState("");
  const bootRef = useRef(false);

  useEffect(() => {
    if (bootRef.current) return;
    bootRef.current = true;
    // fire-and-forget
    (async () => {
      try { await attemptBiometric(); } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function attemptBiometric() {
    setBusy(true);
    setErr("");
    setMsg("Touch your fingerprint sensor or look at the camera…");

    if (!("PublicKeyCredential" in window)) {
      setBusy(false);
      throw new Error("This device/browser doesn't support WebAuthn.");
    }

    // 1) Fetch assertion (challenge) options from server
    const raw = await getJSON("/api/auth/webauthn/challenge", {
      credentials: "include",
    });
    const options = normalizeAssertionOptions(raw);

    // 2) Prefer Conditional UI (no intrusive popup; shows account hint/autofill)
    let mediation = "required";
    try {
      const cond = await PublicKeyCredential.isConditionalMediationAvailable?.();
      if (cond) mediation = "conditional";
    } catch {}

    // 3) Trigger platform biometric flow
    const assertion = await navigator.credentials.get({ publicKey: options, mediation });
    if (!assertion) throw new Error("No credential returned from authenticator.");

    // 4) Pack result and send to server for verification + session creation
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

    const result = await getJSON("/api/auth/webauthn/assert", {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!result?.ok) throw new Error(result?.message || "Assertion rejected.");
    if (result.guthiKey) {
      // Display-only; never use as auth token
      localStorage.setItem("guthiKey", result.guthiKey);
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-semibold">Enter the Digital Guthi</h1>
          <p className="text-zinc-400">Biometric sign-in (Fingerprint / Face ID)</p>
        </header>

        <section className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 grid place-items-center">🔒</div>
            <div className="flex-1">
              <p className="text-sm text-zinc-200">{msg}</p>
              {busy && <p className="text-xs text-zinc-500">Waiting for device…</p>}
              {err && <p className="text-sm text-red-400 mt-2">{err}</p>}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => attemptBiometric().catch((e) => { setErr(e.message); setBusy(false); setMsg("Tap Try Again or use recovery."); })}
              disabled={busy}
              className="flex-1 px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
            >
              {busy ? "Authenticating…" : "Try Again"}
            </button>
            <a
              href="/recovery"
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
            >
              Recovery
            </a>
          </div>
        </section>

        <p className="text-center text-xs text-zinc-500">
          New here?{" "}
          <a className="underline hover:no-underline" href="/welcome">
            Create your Guthi identity
          </a>
        </p>
      </div>
    </main>
  );
}
