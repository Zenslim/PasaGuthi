import crypto from "crypto";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  const challenge = crypto.randomBytes(32).toString("base64url");
  const rpId =
    process.env.NEXT_PUBLIC_RP_ID ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : undefined);

  // Store only the challenge; user will be inferred later from credentialID
  res.setHeader(
    "Set-Cookie",
    `pg_webauthn_chal=${challenge}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`
  );

  res.status(200).json({
    challenge,
    timeout: 60000,
    userVerification: "preferred",
    rpId,
    // Empty allowCredentials => discoverable credentials (account chooser)
    allowCredentials: [],
  });
}
