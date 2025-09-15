export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, message: "Method not allowed" });
    return;
  }
  try {
    // The client sends JSON with base64url strings for ArrayBuffers
    const body = req.body;
    // TODO: verify with @simplewebauthn/server against your stored public key,
    // then create your session (Supabase admin API or your own cookie).

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(400).json({ ok: false, message: e?.message || "Invalid assertion" });
  }
}
