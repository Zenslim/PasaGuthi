// pages/api/auth/webauthn/assert.js
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

/* ---------- CORS ---------- */
function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

/* ---------- Supabase (server-only) ---------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

/* ---------- Cookie helper ---------- */
function getCookie(req, name) {
  const list = (req.headers.cookie || "").split(";").map((c) => c.trim());
  for (const c of list) {
    const [k, ...rest] = c.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export default async function handler(req, res) {
  setCORS(res);

  // Handle preflight to avoid 405
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    const challenge = getCookie(req, "pg_webauthn_chal");
    if (!challenge) {
      return res.status(400).json({ ok: false, message: "Missing challenge" });
    }

    // Find credential by ID
    const rawId = body.rawId || body.id;
    if (!rawId) return res.status(400).json({ ok: false, message: "Missing credential id" });

    const credentialIDb64u = typeof rawId === "string" ? rawId : "";
    const { data: creds, error: selErr } = await supabase
      .from("webauthn_credentials")
      .select("*")
      .eq("credential_id", credentialIDb64u)
      .limit(1);

    if (selErr) throw new Error(selErr.message);
    const cred = creds?.[0];
    if (!cred) return res.status(400).json({ ok: false, message: "Unknown credential" });

    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : undefined);

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challenge,
      expectedRPID: rpID,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL,
      authenticator: {
        credentialPublicKey: isoBase64URL.toBuffer(cred.public_key),
        credentialID: isoBase64URL.toBuffer(cred.credential_id),
        counter: Number(cred.counter || 0),
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res.status(400).json({ ok: false, message: "Verification failed" });
    }

    // Update counter
    const newCounter = verification.authenticationInfo?.newCounter ?? (cred.counter || 0);
    const { error: updErr } = await supabase
      .from("webauthn_credentials")
      .update({ counter: newCounter })
      .eq("credential_id", cred.credential_id);
    if (updErr) throw new Error(updErr.message);

    // Clear challenge cookie
    res.setHeader(
      "Set-Cookie",
      "pg_webauthn_chal=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    // TODO: set your app/session cookie here if needed
    return res.status(200).json({ ok: true, guthiKey: cred.guthi_key });
  } catch (e) {
    console.error("ASSERT ERROR:", e?.message || e);
    return res.status(400).json({ ok: false, message: e?.message || "Invalid assertion" });
  }
}
