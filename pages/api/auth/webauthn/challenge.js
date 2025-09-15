import crypto from "crypto";
// If you’re not using Supabase server SDK here, use a DB client you already have.
// For demo, we’ll stub a tiny fetch; replace with real query to your DB.
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, // for production, use service role key via server-only env
  { auth: { persistSession: false } }
);

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

  const challenge = crypto.randomBytes(32).toString("base64url");
  const rpId =
    process.env.NEXT_PUBLIC_RP_ID ||
    (process.env.NEXT_PUBLIC_SITE_URL
      ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
      : undefined);

  // Fetch stored credential IDs for this user
  const { data: creds, error } = await supabase
    .from("webauthn_credentials")
    .select("credential_id, transports")
    .eq("guthi_key", guthiKey);

  if (error) {
    res.status(500).json({ ok: false, message: error.message });
    return;
  }

  // Build allowCredentials from DB (can be empty if using discoverable creds)
  const allowCredentials = (creds || []).map((c) => ({
    id: c.credential_id, // base64url string, client will convert to Uint8Array
    type: "public-key",
    transports: c.transports || undefined,
  }));

  // Store challenge + guthiKey in an HttpOnly cookie (short TTL)
  res.setHeader("Set-Cookie", [
    `pg_webauthn_chal=${challenge}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
    `pg_webauthn_gk=${encodeURIComponent(guthiKey)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=300`,
  ]);

  res.status(200).json({
    challenge,
    timeout: 60000,
    userVerification: "preferred",
    rpId,
    allowCredentials, // can be []
  });
}
