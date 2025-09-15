// pages/api/auth/webauthn/register-verify.js
import { verifyRegistrationResponse } from "@simplewebauthn/server";
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

  // ✅ Always answer preflight to avoid 405
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    // You set this in your /register-options endpoint
    const challenge = getCookie(req, "pg_webauthn_reg_chal");
    if (!challenge) {
      return res.status(400).json({ ok: false, message: "Missing registration challenge" });
    }

    // You should include your app's user key in the request body (e.g., guthiKey)
    const guthiKey = body?.guthiKey;
    if (!guthiKey) {
      return res.status(400).json({ ok: false, message: "Missing guthiKey" });
    }

    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL; // e.g., https://www.pasaguthi.org
    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (expectedOrigin ? new URL(expectedOrigin).hostname : undefined);

    const verification = await verifyRegistrationResponse({
      response: body.credential, // client sends { credential, guthiKey }
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res.status(400).json({ ok: false, message: "Registration verification failed" });
    }

    const regInfo = verification.registrationInfo;
    if (!regInfo) {
      return res.status(400).json({ ok: false, message: "No registration info" });
    }

    const credentialIDb64u = isoBase64URL.fromBuffer(regInfo.credentialID);
    const publicKeyB64u = isoBase64URL.fromBuffer(regInfo.credentialPublicKey);
    const counter = regInfo.counter ?? 0;

    // Persist the credential
    const { error: upsertErr } = await supabase
      .from("webauthn_credentials")
      .upsert(
        {
          guthi_key: guthiKey,
          credential_id: credentialIDb64u,
          public_key: publicKeyB64u,
          counter,
          transports: JSON.stringify(body.credential?.transports || []),
        },
        { onConflict: "credential_id" }
      );

    if (upsertErr) throw new Error(upsertErr.message);

    // Clear the challenge cookie
    res.setHeader(
      "Set-Cookie",
      "pg_webauthn_reg_chal=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    return res.status(200).json({ ok: true, credentialID: credentialIDb64u });
  } catch (e) {
    console.error("REGISTER-VERIFY ERROR:", e?.message || e);
    return res.status(400).json({ ok: false, message: e?.message || "Invalid registration" });
  }
}
