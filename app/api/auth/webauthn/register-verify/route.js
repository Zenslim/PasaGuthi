// app/api/auth/webauthn/register-verify/route.js
import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---- CORS helper ---- */
function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

/* ---- IMPORTANT: lazy-init Supabase at runtime, not at module scope ---- */
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    // Don’t throw during module import; only here when function is actually called
    throw new Error("Server misconfig: SUPABASE env missing");
  }
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function OPTIONS() {
  return cors(NextResponse.json({ ok: true }));
}

export async function POST(request) {
  try {
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL;
    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (expectedOrigin ? new URL(expectedOrigin).hostname : undefined);

    const body = await request.json().catch(() => null);
    if (!body) return cors(NextResponse.json({ ok: false, message: "Bad JSON" }, { status: 400 }));

    // Read cookies set by /register-challenge
    const chal = request.cookies.get("pg_webauthn_reg_chal")?.value;
    const guthiKeyCookie = request.cookies.get("pg_webauthn_gk")?.value;
    const guthiKey = guthiKeyCookie ? decodeURIComponent(guthiKeyCookie) : null;

    if (!chal)     return cors(NextResponse.json({ ok: false, message: "Missing registration challenge" }, { status: 400 }));
    if (!guthiKey) return cors(NextResponse.json({ ok: false, message: "Missing guthiKey cookie" }, { status: 400 }));

    // Verify WebAuthn attestation
    const verification = await verifyRegistrationResponse({
      response: body,                 // client sends the raw credential object
      expectedChallenge: chal,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return cors(NextResponse.json({ ok: false, message: "Registration verification failed" }, { status: 400 }));
    }

    const reg = verification.registrationInfo;
    const credentialIDb64u   = isoBase64URL.fromBuffer(reg.credentialID);
    const publicKeyB64u      = isoBase64URL.fromBuffer(reg.credentialPublicKey);
    const counter            = reg.counter ?? 0;
    const transportsFromBody =
      body?.transports || body?.response?.transports || [];

    // 👉 Lazy-create the Supabase admin client here (runtime only)
    const supabase = getAdminClient();

    const { error: upsertErr } = await supabase
      .from("webauthn_credentials")
      .upsert(
        {
          guthi_key: guthiKey,
          credential_id: credentialIDb64u,
          public_key: publicKeyB64u,
          counter,
          transports: JSON.stringify(transportsFromBody),
        },
        { onConflict: "credential_id" }
      );

    if (upsertErr) throw new Error(upsertErr.message);

    // Clear cookies after success
    const res = NextResponse.json({ ok: true, credentialID: credentialIDb64u, guthiKey });
    res.cookies.set("pg_webauthn_reg_chal", "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
    res.cookies.set("pg_webauthn_gk", "",       { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
    return cors(res);
  } catch (e) {
    // If envs are missing at runtime, show a clean 500 (not a build-time crash)
    const status = String(e?.message || "").includes("misconfig") ? 500 : 400;
    return cors(NextResponse.json({ ok: false, message: e?.message || "Invalid registration" }, { status }));
  }
}
