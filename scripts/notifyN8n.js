const axios = require("axios");
module.exports.notifyN8n = async ({ url, title, description }) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  const payload = { url, title, description, triggeredAt: new Date().toISOString() };
  try {
    const res = await axios.post(webhookUrl, payload);
    console.log("📡 Notified n8n:", res.status);
  } catch (err) {
    console.error("❌ Webhook failed:", err.message);
  }
};
