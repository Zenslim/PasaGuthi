// pages/api/auth/webauthn/assert.js
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

/* ---------- CORS helper (handles preflight, avoids 405) ---------- */
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/* ---------- SERVER-ONLY Supabase client (Service Role) ---------- */
/* Vercel env required:
   - NEXT_PUBLIC_SUPABASE_URL
   - SUPABASE_SERVICE_ROLE_KEY
*/
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

/* ---------- Cookie reader ---------- */
function getCookie(req, name) {
  const list = (req.headers.cookie || "").split(";").map((c) => c.trim());
  for (const c of list) {
    const [k, ...rest] = c.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/* ---------- WebAuthn assertion verifier (discoverable creds) ---------- */
export default async function handler(req, res) {
  // CORS + preflight
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();

  // Only POST allowed
  if (req.method !== "POST") {
    console.error("ASSERT WRONG METHOD:", req.method, "URL:", req.url);
    res.setHeader("Allow", "POST, OPTIONS");
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  // Minimal logging to prove we hit this exact handler
  console.log("ASSERT HIT:", req.method, req.url, req.headers["content-type"]);

  try {
    const body = req.body; // JSON with base64url strings from navigator.credentials.get()

    // Challenge issued during /generate/assertion-options stored in cookie
    const expectedChallenge = getCookie(req, "pg_webauthn_chal");
    if (!expectedChallenge) {
      return res.status(400).json({ ok: false, message: "Challenge missing/expired" });
    }

    // Find authenticator by credential ID (discoverable credentials)
    const { data: rows, error } = await supabase
      .from("webauthn_credentials")
      .select("id, guthi_key, credential_id, public_key, counter")
      .eq("credential_id", body.id)
      .limit(1);

    if (error) throw new Error(error.message);
    const cred = rows?.[0];
    if (!cred) throw new Error("Credential not registered");

    // RP ID: explicit env or derived from site URL
    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : undefined);

    // Perform WebAuthn assertion verification
    const verification = await verifyAuthenticationResponse({
      response: {
        id: body.id,
        rawId: isoBase64URL.toBuffer(body.rawId),
        type: body.type,
        response: {
          authenticatorData: isoBase64URL.toBuffer(body.response.authenticatorData),
          clientDataJSON: isoBase64URL.toBuffer(body.response.clientDataJSON),
          signature: isoBase64URL.toBuffer(body.response.signature),
          userHandle: body.response.userHandle
            ? isoBase64URL.toBuffer(body.response.userHandle)
            : undefined,
        },
        clientExtensionResults: body.clientExtensionResults || {},
      },
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL, // e.g. "https://www.pasaguthi.org"
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: isoBase64URL.toBuffer(cred.public_key),
        credentialID: isoBase64URL.toBuffer(cred.credential_id),
        counter: Number(cred.counter || 0),
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ ok: false, message: "Verification failed" });
    }

    // Update counter
    const newCounter = verification.authenticationInfo.newCounter ?? cred.counter;
    await supabase
      .from("webauthn_credentials")
      .update({ counter: newCounter })
      .eq("id", cred.id);

    // Clear challenge cookie
    res.setHeader(
      "Set-Cookie",
      "pg_webauthn_chal=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    // TODO: Start your app session here (set your own cookie / Supabase session)
    return res.status(200).json({ ok: true, guthiKey: cred.guthi_key });
  } catch (e) {
    console.error("ASSERT ERROR:", e?.message || e);
    return res.status(400).json({ ok: false, message: e?.message || "Invalid assertion" });
  }
}
