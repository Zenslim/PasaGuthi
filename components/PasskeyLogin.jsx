// components/PasskeyLogin.jsx
import { useState } from "react";

// Helper: safely base64url → ArrayBuffer
const b64uToBuf = (b64u) => {
  const pad = (s) => s + "===".slice((s.length + 3) % 4);
  const b64 = pad(String(b64u).replace(/-/g, "+").replace(/_/g, "/"));
  const raw = atob(b64);
  const buf = new ArrayBuffer(raw.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < raw.length; i++) view[i] = raw.charCodeAt(i);
  return buf;
};

export default function PasskeyLogin() {
  const [status, setStatus] = useState("");

  const loginWithPasskey = async () => {
    try {
      setStatus("Getting challenge…");

      // 1) Get challenge from your API — THIS SETS THE COOKIE
      const chalRes = await fetch("/api/auth/webauthn/challenge", {
        method: "GET",
        credentials: "include", // 🔑 carry/set cookies
      });
      if (!chalRes.ok) throw new Error("Failed to get challenge");
      const { publicKeyRequestOptions } = await chalRes.json();

      // 2) Fix up binary fields for WebAuthn
      const options = {
        ...publicKeyRequestOptions,
        challenge: b64uToBuf(publicKeyRequestOptions.challenge),
        allowCredentials: (publicKeyRequestOptions.allowCredentials || []).map((c) => ({
          ...c,
          id: b64uToBuf(c.id),
        })),
      };

      setStatus("Asking your passkey…");
      const assertion = await navigator.credentials.get({ publicKey: options });
      if (!assertion) throw new Error("No assertion from authenticator");

      // 3) Send the assertion back to your API — INCLUDE COOKIE
      setStatus("Verifying…");
      const body = {
        id: assertion.id,
        rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId)))
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/g, ""),
        type: assertion.type,
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertion.response.clientDataJSON)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, ""),
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertion.response.authenticatorData)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, ""),
          signature: btoa(String.fromCharCode(...new Uint8Array(assertion.response.signature)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, ""),
          userHandle: assertion.response.userHandle
            ? btoa(String.fromCharCode(...new Uint8Array(assertion.response.userHandle)))
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/g, "")
            : null,
        },
      };

      const verifyRes = await fetch("/api/auth/webauthn/assert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 🔑 bring the cookie back
        body: JSON.stringify(body),
      });

      const data = await verifyRes.json();
      if (!verifyRes.ok || !data.ok) {
        throw new Error(data?.message || "Verification failed");
      }

      setStatus("✅ Logged in with passkey!");
      // TODO: redirect to dashboard, etc.
      // router.push("/dashboard");
    } catch (e) {
      setStatus(`❌ ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <button onClick={loginWithPasskey} className="px-4 py-2 rounded bg-black text-white">
        Continue with Passkey
      </button>
      <p className="text-sm opacity-80">{status}</p>
    </div>
  );
}
