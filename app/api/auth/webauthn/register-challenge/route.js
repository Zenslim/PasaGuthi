// app/api/auth/webauthn/register-challenge/route.js
import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cors(res) {
  res.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

async function buildOptions(guthiKey) {
  if (!guthiKey) throw new Error("Missing guthiKey");

  const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL;
  const rpID =
    process.env.NEXT_PUBLIC_RP_ID ||
    (expectedOrigin ? new URL(expectedOrigin).hostname : undefined);

  const options = await generateRegistrationOptions({
    rpName: "Pasaguthi",
    rpID,
    userName: guthiKey,
    userID: new TextEncoder().encode(guthiKey), // stable, per-user
    attestationType: "none",
    // Force on-device biometrics + discoverable creds for smooth sign-in later
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      residentKey: "required",
      userVerification: "required",
    },
  });

  const res = NextResponse.json(options);
  // Tie challenge to this client
  res.cookies.set("pg_webauthn_reg_chal", options.challenge, {
    httpOnly: true, sameSite: "lax", path: "/",
  });
  res.cookies.set("pg_webauthn_gk", encodeURIComponent(guthiKey), {
    httpOnly: true, sameSite: "lax", path: "/",
  });
  return cors(res);
}

export async function OPTIONS() {
  return cors(NextResponse.json({ ok: true }));
}

export async function GET(request) {
  try {
    const guthiKey = new URL(request.url).searchParams.get("guthiKey");
    return await buildOptions(guthiKey);
  } catch (e) {
    return cors(NextResponse.json({ ok: false, message: e?.message || "options error" }, { status: 400 }));
  }
}

export async function POST(request) {
  try {
    const { guthiKey } = (await request.json().catch(() => ({}))) || {};
    return await buildOptions(guthiKey);
  } catch (e) {
    return cors(NextResponse.json({ ok: false, message: e?.message || "options error" }, { status: 400 }));
  }
}
