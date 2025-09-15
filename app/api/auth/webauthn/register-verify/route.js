// app/api/auth/webauthn/register-verify/route.js
import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return cors(NextResponse.json({ ok: true }));
}

export async function POST(request) {
  try {
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL;
    const rpID = process.env.NEXT_PUBLIC_RP_ID || (expectedOrigin ? new URL(expectedOrigin).hostname : undefined);

    const body = await request.json().catch(() => null);
    if (!body) return cors(NextResponse.json({ ok: false, message: "Bad JSON" }, { status: 400 }));

    // Read cookies set in the challenge step
    const chal = request.cookies.get("pg_webauthn_reg_chal")?.value;
    const guthiKeyCookie = request.cookies.get("pg_webauthn_gk")?.value;
    const guthiKey = guthiKeyCookie ? decodeURIComponent(guthiKeyCookie) : null;

    if (!chal)   return cors(NextResponse.json({ ok: false, message: "Missing registration challenge" }, { status: 400 }));
    if (!guthiKey) return cors(NextResponse.json({ ok: false, message: "Missing guthiKey cookie" }, { status: 400 }));

    const verification = await verifyRegistrationResponse({
      response: body,                // your frontend sends the raw WebAuthn credential object
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
    const publicKeyB64u = isoBase64URL.fromBuffer(reg.credentialPublicKey);
    const counter = reg.counter ?? 0;

    const { error: upsertErr } = await supabase
      .from("webauthn_credentials")
      .upsert(
        {
          guthi_key: guthiKey,
          credential_id: credentialIDb64u,
          public_key: publicKeyB64u,
          counter,
          transports: JSON.stringify(body?.transports || body?.response?.transports || []),
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
    return cors(NextResponse.json({ ok: false, message: e?.message || "Invalid registration" }, { status: 400 }));
  }
}
