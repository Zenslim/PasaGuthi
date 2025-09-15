// app/api/auth/webauthn/register-challenge/route.js
import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
    const url = new URL(request.url);
    const body = await request.json().catch(() => ({}));
    const guthiKey = body.guthiKey || url.searchParams.get("guthiKey");
    if (!guthiKey) {
      return cors(NextResponse.json({ ok: false, message: "Missing guthiKey" }, { status: 400 }));
    }

    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL;
    const rpID = process.env.NEXT_PUBLIC_RP_ID || (expectedOrigin ? new URL(expectedOrigin).hostname : undefined);

    const options = await generateRegistrationOptions({
      rpName: "Pasaguthi",
      rpID,
      userName: guthiKey,
      userID: new TextEncoder().encode(guthiKey),
      attestationType: "none",
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
      },
    });

    // Set cookies so verify step works WITHOUT frontend changes
    const res = NextResponse.json(options);
    res.cookies.set("pg_webauthn_reg_chal", options.challenge, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    res.cookies.set("pg_webauthn_gk", encodeURIComponent(guthiKey), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
    return cors(res);
  } catch (e) {
    return cors(NextResponse.json({ ok: false, message: e?.message || "options error" }, { status: 400 }));
  }
}
