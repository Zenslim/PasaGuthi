// app/api/auth/webauthn/assert/route.js
export const runtime = "nodejs"; // required for @simplewebauthn/server

import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { createClient } from "@supabase/supabase-js";

/* ---------- CORS ---------- */
const CORS = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_SITE_URL || "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
function withCORS(init) {
  const base = typeof init === "number" ? { status: init } : init || {};
  return {
    ...base,
    headers: {
      ...(base && base.headers ? base.headers : {}),
      ...CORS,
      "Content-Type": "application/json",
    },
  };
}

/* ---------- Supabase (service role) ---------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

/* ---------- Cookie reader ---------- */
function getCookie(headers, name) {
  const raw = headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const s = part.trim();
    const i = s.indexOf("=");
    if (i > -1) {
      const k = s.slice(0, i);
      const v = s.slice(i + 1);
      if (k === name) return decodeURIComponent(v);
    }
  }
  return null;
}

/* ---------- OPTIONS (preflight) ---------- */
export function OPTIONS() {
  return new NextResponse(null, withCORS(200));
}

/* ---------- POST (assertion verify) ---------- */
export async function POST(req) {
  try {
    console.log("ASSERT HIT:", req.method, new URL(req.url).pathname);

    const headers = req.headers;
    const body = await req.json(); // PublicKeyCredential JSON from navigator.credentials.get()

    const expectedChallenge = getCookie(headers, "pg_webauthn_chal");
    if (!expectedChallenge) {
      return NextResponse.json(
        { ok: false, message: "Challenge missing/expired" },
        withCORS({ status: 400 })
      );
    }

    // find authenticator by credential ID (discoverable)
    const { data: rows, error } = await supabase
      .from("webauthn_credentials")
      .select("id, guthi_key, credential_id, public_key, counter")
      .eq("credential_id", body.id)
      .limit(1);

    if (error) throw new Error(error.message);
    const cred = rows && rows[0];
    if (!cred) {
      return NextResponse.json(
        { ok: false, message: "Credential not registered" },
        withCORS({ status: 400 })
      );
    }

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
          userHandle: body.response.userHandle
            ? isoBase64URL.toBuffer(body.response.userHandle)
            : undefined,
        },
        clientExtensionResults: body.clientExtensionResults || {},
      },
      expectedChallenge,
      expectedOrigin: process.env.NEXT_PUBLIC_SITE_URL, // e.g., "https://www.pasaguthi.org"
      expectedRPID: rpID,
      authenticator: {
        credentialPublicKey: isoBase64URL.toBuffer(cred.public_key),
        credentialID: isoBase64URL.toBuffer(cred.credential_id),
        counter: Number(cred.counter || 0),
      },
    });

    if (!verification.verified) {
      return NextResponse.json(
        { ok: false, message: "Verification failed" },
        withCORS({ status: 400 })
      );
    }

    const newCounter = verification.authenticationInfo.newCounter ?? cred.counter;
    await supabase.from("webauthn_credentials").update({ counter: newCounter }).eq("id", cred.id);

    // clear challenge cookie
    const res = NextResponse.json(
      { ok: true, guthiKey: cred.guthi_key },
      withCORS({ status: 200 })
    );
    res.headers.append(
      "Set-Cookie",
      "pg_webauthn_chal=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );
    return res;
  } catch (e) {
    console.error("ASSERT ERROR:", e && e.message ? e.message : e);
    return NextResponse.json(
      { ok: false, message: (e && e.message) || "Invalid assertion" },
      withCORS({ status: 400 })
    );
    }
}
