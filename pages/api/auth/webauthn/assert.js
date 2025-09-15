import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,     // server-only
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
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  try {
    const body = req.body;
    const expectedChallenge = getCookie(req, "pg_webauthn_chal");
    if (!expectedChallenge) {
      return res.status(400).json({ ok: false, message: "Challenge missing/expired" });
    }

    // 🔎 Identify authenticator by credential ID
    const { data: creds, error } = await supabase
      .from("webauthn_credentials")
      .select("id, guthi_key, credential_id, public_key, counter")
      .eq("credential_id", body.id)
      .limit(1);

    if (error) throw new Error(error.message);
    const cred = creds?.[0];
    if (!cred) throw new Error("Credential not registered");

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
          clientDataJSON:    isoBase64URL.toBuffer(body.response.clientDataJSON),
          signature:         isoBase64URL.toBuffer(body.response.signature),
          userHandle: body.response.userHandle
            ? isoBase64URL.toBuffer(body.response.userHandle)
            : undefined,
        },
        clientExtensionResults: body.clientExtensionResults || {},
      },
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL,
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: isoBase64URL.toBuffer(cred.public_key),
        credentialID:        isoBase64URL.toBuffer(cred.credential_id),
        counter: Number(cred.counter || 0),
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ ok: false, message: "Verification failed" });
    }

    // Update signature counter
    const newCounter = verification.authenticationInfo.newCounter ?? cred.counter;
    await supabase
      .from("webauthn_credentials")
      .update({ counter: newCounter })
      .eq("id", cred.id);

    // Clear the challenge cookie
    res.setHeader(
      "Set-Cookie",
      "pg_webauthn_chal=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );

    // TODO: start your app session here (cookie or Supabase session)
    return res.status(200).json({ ok: true, guthiKey: cred.guthi_key });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e?.message || "Invalid assertion" });
  }
}
