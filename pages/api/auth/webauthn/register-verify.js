// pages/api/auth/webauthn/register-verify.js
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // server-only, set in Vercel
  { auth: { persistSession: false } }
);

function getCookie(req, name) {
  const list = (req.headers.cookie || "").split(";").map((c) => c.trim());
  for (const c of list) {
    const [k, ...rest] = c.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export default async function handler(req, res) {
  // Allow CORS preflight (if you’re testing from a different origin/host)
  if (req.method === "OPTIONS") {
    const origin = process.env.NEXT_PUBLIC_SITE_URL;
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    // Log so you can see the unexpected method in Vercel logs
    console.warn("register-verify received non-POST method:", req.method);
    return res.status(405).json({ ok: false, message: "Method not allowed" });
  }

  try {
    const body = req.body; // JSON

    const expectedChallenge = getCookie(req, "pg_reg_chal");
    const guthiKey = getCookie(req, "pg_reg_gk");
    if (!expectedChallenge || !guthiKey) {
      return res.status(400).json({ ok: false, message: "Challenge missing/expired" });
    }

    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (process.env.NEXT_PUBLIC_SITE_URL
        ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
        : undefined);

    const verification = await verifyRegistrationResponse({
      response: {
        id: body.id,
        rawId: isoBase64URL.toBuffer(body.rawId),
        response: {
          attestationObject: isoBase64URL.toBuffer(body.response.attestationObject),
          clientDataJSON:    isoBase64URL.toBuffer(body.response.clientDataJSON),
          transports: body.response.transports || [],
        },
        type: body.type,
        clientExtensionResults: body.clientExtensionResults || {},
      },
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL, // e.g. https://www.pasaguthi.org
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return res.status(400).json({ ok: false, message: "Registration verification failed" });
    }

    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    const { error } = await supabase.from("webauthn_credentials").insert({
      guthi_key: guthiKey,
      credential_id: isoBase64URL.fromBuffer(credentialID),
      public_key: isoBase64URL.fromBuffer(credentialPublicKey),
      counter: Number(counter || 0),
      transports: body.response.transports || [],
    });
    if (error) throw new Error(error.message);

    // Clear cookies
    res.setHeader("Set-Cookie", [
      "pg_reg_chal=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax",
      "pg_reg_gk=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax",
    ]);

    return res.status(200).json({ ok: true, guthiKey });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e?.message || "Invalid registration" });
  }
}
