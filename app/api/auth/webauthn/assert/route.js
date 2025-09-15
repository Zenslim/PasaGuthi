// app/api/auth/webauthn/assert/route.js
import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

function getAdminClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Server misconfig: Supabase envs missing");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function OPTIONS() {
  return cors(NextResponse.json({ ok: true }));
}

export async function POST(request) {
  try {
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL; // e.g., https://www.pasaguthi.org
    const rpID = process.env.NEXT_PUBLIC_RP_ID || new URL(expectedOrigin).hostname;

    const body = await request.json().catch(() => null);
    if (!body) return cors(NextResponse.json({ ok: false, message: "Bad JSON" }, { status: 400 }));

    // Challenge cookie from /challenge
    const chal = request.cookies.get("pg_webauthn_assert_chal")?.value;
    if (!chal) return cors(NextResponse.json({ ok: false, message: "Missing login challenge" }, { status: 400 }));

    // Lookup authenticator purely by credential ID (discoverable creds)
    const supabase = getAdminClient();
    const { data: creds, error } = await supabase
      .from("webauthn_credentials")
      .select("*")
      .eq("credential_id", body.id)
      .limit(1);

    if (error || !creds?.length) {
      return cors(NextResponse.json({ ok: false, message: "Credential not found" }, { status: 400 }));
    }
    const cred = creds[0];

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: chal,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: isoBase64URL.toBuffer(cred.credential_id),
        credentialPublicKey: isoBase64URL.toBuffer(cred.public_key),
        counter: cred.counter || 0,
      },
      requireUserVerification: false,
    });

    if (!verification.verified) {
      return cors(NextResponse.json({ ok: false, message: "Authentication failed" }, { status: 400 }));
    }

    // Update counter
    await supabase
      .from("webauthn_credentials")
      .update({ counter: verification.authenticationInfo.newCounter })
      .eq("credential_id", cred.credential_id);

    const res = NextResponse.json({ ok: true, guthiKey: cred.guthi_key });
    // Clear used challenge
    res.cookies.set("pg_webauthn_assert_chal", "", { httpOnly: true, path: "/", maxAge: 0 });
    return cors(res);
  } catch (e) {
    return cors(NextResponse.json({ ok: false, message: e?.message || "assert error" }, { status: 400 }));
  }
}
