import crypto from "crypto";
import { generateRegistrationOptions } from "@simplewebauthn/server";

/**
 * Start passkey registration for a user.
 * Expects ?guthiKey=<string>
 * Stores challenge + guthiKey in HttpOnly cookies.
 */
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  const guthiKey = (req.query.guthiKey || "").toString().trim();
  if (!guthiKey) {
    res.status(400).json({ ok: false, message: "Missing guthiKey" });
    return;
  }

  const rpID =
    process.env.NEXT_PUBLIC_RP_ID ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : undefined);

  const options = await generateRegistrationOptions({
    rpName: "PasaGuthi",
    rpID,
    userID: guthiKey,            // for discoverable creds, this can be stable user ref
    userName: guthiKey,          // shown in native UI
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",   // discoverable credentials
      userVerification: "preferred",
      authenticatorAttachment: "platform", // device biometrics; change to "cross-platform" to allow security keys
    },
  });

  // Store challenge + guthiKey so we can verify later
  res.setHeader("Set-Cookie", [
    `pg_reg_chal=${options.challenge}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
    `pg_reg_gk=${encodeURIComponent(guthiKey)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
  ]);

  res.status(200).json(options);
}
