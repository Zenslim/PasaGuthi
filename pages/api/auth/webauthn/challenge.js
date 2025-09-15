import crypto from "crypto";

export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }

  // 32-byte random challenge → base64url
  const challenge = crypto.randomBytes(32).toString("base64url");

  // RP ID must match your domain (e.g., www.pasaguthi.org)
  const rpId =
    process.env.NEXT_PUBLIC_RP_ID ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : undefined);

  res.status(200).json({
    challenge,                 // client converts to Uint8Array
    timeout: 60000,
    userVerification: "preferred",
    rpId,
    allowCredentials: [],      // later: fill with saved credential IDs for that user
  });
}
