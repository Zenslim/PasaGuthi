// pages/api/auth/webauthn/register-options.js
import { generateRegistrationOptions } from "@simplewebauthn/server";

function setCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_SITE_URL || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });

  try {
    const { guthiKey } = req.body || {};
    if (!guthiKey) return res.status(400).json({ ok: false, message: "Missing guthiKey" });

    const expectedOrigin = process.env.NEXT_PUBLIC_SITE_URL; // e.g., https://www.pasaguthi.org
    const rpID =
      process.env.NEXT_PUBLIC_RP_ID ||
      (expectedOrigin ? new URL(expectedOrigin).hostname : undefined);

    const publicKey = await generateRegistrationOptions({
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

    // Set challenge cookie for verify step
    res.setHeader(
      "Set-Cookie",
      `pg_webauthn_reg_chal=${encodeURIComponent(publicKey.challenge)}; Path=/; HttpOnly; SameSite=Lax`
    );

    return res.status(200).json({ ok: true, publicKey });
  } catch (e) {
    return res.status(400).json({ ok: false, message: e?.message || "Options error" });
  }
}
