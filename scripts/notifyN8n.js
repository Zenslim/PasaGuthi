const axios = require("axios");
module.exports.notifyN8n = async ({ url, title, description }) => {
  const payload = { youtubeUrl: url, title, description, triggeredAt: new Date().toISOString() };
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  await axios.post(webhookUrl, payload);
};
