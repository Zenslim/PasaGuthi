const axios = require("axios");
const notifyN8n = async ({ url, title, description }) => {
  try {
    const payload = {
      youtubeUrl: url,
      title,
      description,
      triggeredAt: new Date().toISOString()
    };
    const webhookUrl = process.env.N8N_WEBHOOK_URL || "https://example.com/webhook/notify";
    const response = await axios.post(webhookUrl, payload);
    console.log("✅ Notified n8n:", response.status, response.statusText);
  } catch (error) {
    console.error("❌ Failed to notify n8n:", error.message);
  }
};
module.exports = { notifyN8n };