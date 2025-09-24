// pages/signin.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

/* ------------------------ Base64URL helpers for WebAuthn ------------------------ */
const u8ToB64u = (u8) => {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    bin += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  }
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
  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} @ ${url}: ${body.slice(0, 240)}`);
  }
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const t = await res.text().catch(() => "");
    throw new Error(`Unexpected content-type: ${ct} @ ${url}: ${t.slice(0, 240)}`);
  }
  return res.json();
}

/* -------------------- Normalize assertion options (server → web) -------------------- */
function normalizeAssertionOptions(opts) {
  const out = structuredClone(opts);
  if (out.challenge && typeof out.challenge === "string") out.challenge = b64uToU8(out.challenge);

  if (Array.isArray(out.allowCredentials) && out.allowCredentials.length) {
    out.allowCredentials = out.allowCredentials.map((c) => ({
      ...c,
      id: typeof c.id === "string" ? b64uToU8(c.id) : c.id,
      transports: c.transports || ["internal"], // prefer on-device authenticator
    }));
  } else {
    // Prefer discoverable credentials to let OS choose the on-device key
    delete out.allowCredentials;
  }

  out.userVerification = "required";
  return out;
}

export default function SignIn() {
  const router = useRouter();

  // Biometric state
  const triedRef = useRef(false);
  const [bioBusy, setBioBusy] = useState(false);
  const [bioMsg, setBioMsg]   = useState("Scanning for your Guthi Key…");
  const [bioErr, setBioErr]   = useState("");

  // Phone OTP state
  const [phone, setPhone] = useState("");         // +97798...
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpErr, setOtpErr] = useState("");

  // GuthiKey + Password state
  const [guthiKey, setGuthiKey] = useState("");
  const [password, setPassword] = useState("");
  const [pwBusy, setPwBusy] = useState(false);
  const [pwErr, setPwErr] = useState("");

  // If WebAuthn is supported, auto-attempt on mount (no visible passkey popup text)
  useEffect(() => {
    if (triedRef.current) return;
    triedRef.current = true;

    (async () => {
      // If no WebAuthn support, don’t attempt; users will use Phone or GuthiKey
      if (!("PublicKeyCredential" in window)) {
        setBioMsg("This device does not support biometrics. Use Phone or GuthiKey.");
        return;
      }
      try {
        await attemptBiometric();
      } catch (e) {
        // stay on page; show message; user can Try Again or use other lanes
        console.error(e);
      }
    })();
  }, []);

  async function attemptBiometric() {
    setBioBusy(true); setBioErr(""); setBioMsg("Touch your fingerprint sensor or look at the camera…");

    // 1) Fetch options
    const raw = await getJSON("/api/auth/webauthn/challenge", { credentials: "include" });
    const options = normalizeAssertionOptions(raw);

    // 2) Conditional UI if supported
    let mediation = "required";
    try {
      const cond = await PublicKeyCredential.isConditionalMediationAvailable?.();
      if (cond) mediation = "conditional";
    } catch {}

    // 3) Get assertion
    const assertion = await navigator.credentials.get({ publicKey: options, mediation });
    if (!assertion) throw new Error("No credential returned from authenticator.");

    // 4) Send to server for verification
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
    if (result.guthiKey) localStorage.setItem("guthiKey", result.guthiKey); // display-only

    router.push("/dashboard");
  }

  /* -------------------------- Phone OTP (Sign-in) -------------------------- */
  async function sendOtp() {
    setOtpErr("");
    // Quick E.164 sanity check (very permissive; adjust as you like)
    if (!/^\+\d{8,15}$/.test(phone)) {
      setOtpErr("Enter phone as E.164 (e.g., +97798xxxxxxx).");
      return;
    }
    setOtpBusy(true);
    try {
      const res = await getJSON("/api/auth/otp/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (!res?.ok) throw new Error(res?.message || "Failed to send OTP.");
      setOtpSent(true);
    } catch (e) {
      setOtpErr(e.message || "Failed to send OTP.");
    } finally {
      setOtpBusy(false);
    }
  }

  async function verifyOtp() {
    setOtpBusy(true); setOtpErr("");
    try {
      const res = await getJSON("/api/auth/otp/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone, otp }),
      });
      if (!res?.ok) throw new Error(res?.message || "OTP verification failed.");
      if (res.guthiKey) localStorage.setItem("guthiKey", res.guthiKey);
      router.push("/dashboard");
    } catch (e) {
      setOtpErr(e.message || "OTP verification failed.");
    } finally {
      setOtpBusy(false);
    }
  }

  /* -------------------------- GuthiKey + Password -------------------------- */
  async function loginPassword() {
    setPwBusy(true); setPwErr("");
    try {
      const res = await getJSON("/api/auth/password-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ guthiKey, password }),
      });
      if (!res?.ok) throw new Error(res?.message || "Login failed.");
      if (res.guthiKey) localStorage.setItem("guthiKey", res.guthiKey);
      router.push("/dashboard");
    } catch (e) {
      setPwErr(e.message || "Login failed.");
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white grid place-items-center p-6">
      <div className="w-full max-w-2xl space-y-8">
        <header className="text-center space-y-1">
          <h1 className="text-3xl font-semibold">Enter the Digital Guthi</h1>
          <p className="text-zinc-400">Choose one: Biometric • Phone • GuthiKey</p>
        </header>

        {/* BIOMETRIC */}
        <section className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 grid place-items-center">🔒</div>
            <div className="flex-1">
              <p className="text-sm text-zinc-200">{bioMsg}</p>
              {bioBusy && <p className="text-xs text-zinc-500">Waiting for device…</p>}
              {bioErr && <p className="text-sm text-red-400 mt-2">{bioErr}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => attemptBiometric().catch((e) => { setBioErr(e.message); setBioBusy(false); setBioMsg("Tap Try Again or use another method."); })}
              disabled={bioBusy}
              className="flex-1 px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
            >
              {bioBusy ? "Authenticating…" : "Try Again"}
            </button>
            <a
              href="/recovery"
              className="px-4 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
            >
              Recovery
            </a>
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6">
          {/* PHONE OTP */}
          <section className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40 space-y-4">
            <h2 className="text-lg font-semibold">Phone Sign-in (OTP)</h2>
            <div className="space-y-3">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+97798XXXXXXXX"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none"
                inputMode="tel"
              />
              {otpSent && (
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none"
                  inputMode="numeric"
                />
              )}
              {otpErr && <p className="text-sm text-red-400">{otpErr}</p>}

              {!otpSent ? (
                <button
                  onClick={sendOtp}
                  disabled={otpBusy}
                  className="w-full px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {otpBusy ? "Sending…" : "Send OTP"}
                </button>
              ) : (
                <button
                  onClick={verifyOtp}
                  disabled={otpBusy || !otp}
                  className="w-full px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
                >
                  {otpBusy ? "Verifying…" : "Verify & Enter"}
                </button>
              )}
            </div>
          </section>

          {/* GUTHI KEY + PASSWORD */}
          <section className="rounded-2xl border border-zinc-800 p-6 bg-zinc-900/40 space-y-4">
            <h2 className="text-lg font-semibold">GuthiKey + Password</h2>
            <div className="space-y-3">
              <input
                value={guthiKey}
                onChange={(e) => setGuthiKey(e.target.value)}
                placeholder="Your GuthiKey (e.g., navin-xyz)"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none"
                autoCapitalize="none"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg bg-zinc-800 px-3 py-2 outline-none"
              />
              {pwErr && <p className="text-sm text-red-400">{pwErr}</p>}
              <button
                onClick={loginPassword}
                disabled={pwBusy || !guthiKey || !password}
                className="w-full px-4 py-3 rounded-xl bg-white text-black hover:bg-white/90 disabled:opacity-50"
              >
                {pwBusy ? "Signing in…" : "Enter"}
              </button>
            </div>
          </section>
        </div>

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
