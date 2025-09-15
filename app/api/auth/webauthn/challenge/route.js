// app/api/auth/webauthn/challenge/route.js
import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return cors(NextResponse.json({ ok: true }));
}

export async function GET() {
  try {
    // No guthiKey required for discoverable credentials
    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL;
    const rpID = process.env.NEXT_PUBLIC_RP_ID || new URL(expectedOrigin).hostname;

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
      // For discoverable credentials, allowCredentials can be empty.
      // If you later want to restrict to a known list, populate it here.
    });

    const res = NextResponse.json(options);
    // Store the challenge for the assert step
    res.cookies.set("pg_webauthn_assert_chal", options.challenge, {
      httpOnly: true, sameSite: "lax", path: "/",
    });
    return cors(res);
  } catch (e) {
    return cors(NextResponse.json({ ok: false, message: e?.message || "challenge error" }, { status: 400 }));
  }
}
