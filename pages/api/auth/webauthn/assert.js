import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // in prod, prefer SERVICE_ROLE key set as server env (NOT public)
  { auth: { persistSession: false } }
);

// Helper to read cookies
function getCookie(req, name) {
  const list = (req.headers.cookie || "").split(";").map((c) => c.trim());
  for (const c of list) {
    const [k, ...rest] = c.split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const body = req.body; // JSON with base64url strings

    // 1) Load challenge + guthiKey from cookie
    const expectedChallenge = getCookie(req, "pg_webauthn_chal");
    const guthiKey = getCookie(req, "pg_webauthn_gk");
    if (!expectedChallenge || !guthiKey) {
      return res.status(400).json({ ok: false, message: "Challenge missing/expired" });
    }

    // 2) Find the stored credential for this response.id
    const { data: creds, error } = await supabase
      .from("webauthn_credentials")
      .select("id, credential_id, public_key, counter")
      .eq("guthi_key", guthiKey);

    if (error) throw new Error(error.message);
    const cred = (creds || []).find((c) => c.credential_id === body.id);
    if (!cred) throw new Error("Credential not found for user");

    // 3) Build verification params
    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (process.env.NEXT_PUBLIC_SITE_URL
        ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
        : undefined);

    const verification = await verifyAuthenticationResponse({
      response: {
        id: body.id,
        rawId: isoBase64URL.toBuffer(body.rawId),
        type: body.type,
        response: {
          authenticatorData: isoBase64URL.toBuffer(body.response.authenticatorData),
          clientDataJSON: isoBase64URL.toBuffer(body.response.clientDataJSON),
          signature: isoBase64URL.toBuffer(body.response.signature),
          userHandle: body.response.userHandle ? isoBase64URL.toBuffer(body.response.userHandle) : undefined,
        },
        clientExtensionResults: body.clientExtensionResults || {},
      },
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL, // e.g., https://www.pasaguthi.org
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: isoBase64URL.toBuffer(cred.public_key),
        credentialID: isoBase64URL.toBuffer(cred.credential_id),
        counter: Number(cred.counter || 0),
      },
      // requireUserVerification: 'preferred' matches your options
    });

    if (!verification.verified) {
      return res.status(400).json({ ok: false, message: "Verification failed" });
    }

    // 4) Update counter
    const newCounter = verification.authenticationInfo.newCounter ?? cred.counter;
    await supabase
      .from("webauthn_credentials")
      .update({ counter: newCounter })
      .eq("id", cred.id);

    // 5) Clear challenge cookie to prevent replay
    res.setHeader(
      "Set-Cookie",
      [
        "pg_webauthn_chal=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax",
        "pg_webauthn_gk=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax",
      ]
    );

    // 6) TODO (optional): start your app session here
    // - Set your own secure session cookie, or
    // - Use a Supabase Admin API to mint a session (if you maintain users in Supabase Auth)
    // For now, return ok=true and let the client route to /dashboard
    return res.status(200).json({ ok: true });

  } catch (e) {
    return res.status(400).json({ ok: false, message: e?.message || "Invalid assertion" });
  }
}
