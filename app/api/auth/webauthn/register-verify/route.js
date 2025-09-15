// app/api/auth/webauthn/register-verify/route.js
import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ---------- CORS helper ---------- */
function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

/* ---------- Lazy-init Supabase (runtime only) ---------- */
function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missing = [];
  if (!url) missing.push("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length) throw new Error(`Server misconfig: missing ${missing.join(", ")}`);
  const { createClient } = require("@supabase/supabase-js");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function OPTIONS() {
  return cors(NextResponse.json({ ok: true }));
}

export async function POST(request) {
  try {
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL; // e.g., https://www.pasaguthi.org
    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (expectedOrigin ? new URL(expectedOrigin).hostname : undefined);

    const body = await request.json().catch(() => null);
    if (!body) return cors(NextResponse.json({ ok: false, message: "Bad JSON" }, { status: 400 }));

    // Cookies set by /register-challenge
    const chal = request.cookies.get("pg_webauthn_reg_chal")?.value;
    const guthiKeyCookie = request.cookies.get("pg_webauthn_gk")?.value;
    const guthiKey = guthiKeyCookie ? decodeURIComponent(guthiKeyCookie) : null;

    if (!chal)     return cors(NextResponse.json({ ok: false, message: "Missing registration challenge" }, { status: 400 }));
    if (!guthiKey) return cors(NextResponse.json({ ok: false, message: "Missing guthiKey cookie" }, { status: 400 }));

    // Verify attestation
    const verification = await verifyRegistrationResponse({
      response: body,                // raw credential object from client
      expectedChallenge: chal,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return cors(NextResponse.json({ ok: false, message: "Registration verification failed" }, { status: 400 }));
    }

    const reg = verification.registrationInfo;
    const credentialIDb64u = isoBase64URL.fromBuffer(reg.credentialID);
    const publicKeyB64u    = isoBase64URL.fromBuffer(reg.credentialPublicKey);
    const counter          = reg.counter ?? 0;

    // ✅ transports as a plain JS array (JSONB column in DB)
    const transports = body?.transports || body?.response?.transports || [];

    // Save to Supabase
    const supabase = getAdminClient();
    const { error: upsertErr } = await supabase
      .from("webauthn_credentials")
      .upsert(
        {
          guthi_key: guthiKey,
          credential_id: credentialIDb64u,
          public_key: publicKeyB64u,
          counter,
          transports, // <-- no JSON.stringify(); DB column must be jsonb
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
    const status = String(e?.message || "").includes("Server misconfig") ? 500 : 400;
    return cors(NextResponse.json({ ok: false, message: e?.message || "Invalid registration" }, { status }));
  }
}
