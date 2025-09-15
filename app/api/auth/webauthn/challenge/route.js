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

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const qpKey = url.searchParams.get("guthiKey");
    const cookieKey = request.cookies.get("pg_webauthn_gk")?.value
      ? decodeURIComponent(request.cookies.get("pg_webauthn_gk").value)
      : null;

    const guthiKey = (qpKey || cookieKey || "").trim();
    if (!guthiKey) {
      return cors(NextResponse.json({ ok: false, message: "Missing guthiKey" }, { status: 400 }));
    }

    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL;
    const rpID = process.env.NEXT_PUBLIC_RP_ID || new URL(expectedOrigin).hostname;

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "preferred",
    });

    const res = NextResponse.json(options);
    res.cookies.set("pg_webauthn_assert_chal", options.challenge, {
      httpOnly: true, sameSite: "lax", path: "/",
    });
    res.cookies.set("pg_webauthn_gk", encodeURIComponent(guthiKey), {
      httpOnly: true, sameSite: "lax", path: "/",
    });
    return cors(res);
  } catch (e) {
    return cors(NextResponse.json({ ok: false, message: e?.message || "challenge error" }, { status: 400 }));
  }
}
