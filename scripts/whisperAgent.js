const { generateWhisper } = require("./generateWhisper");
const { generateVoice } = require("./generateVoice");
const { generateVideo } = require("./generateVideo");
const { uploadToYouTube } = require("./uploadToYouTube");
const { notifyN8n } = require("./notifyN8n");

(async () => {
  try {
    const whisper = await generateWhisper();
    const voice = await generateVoice(whisper);
    const video = await generateVideo(voice, whisper);
    const url = await uploadToYouTube(video, whisper);
    await notifyN8n({ url, ...whisper });
  } catch (err) {
    console.error("🔥 Pipeline failed:", err.message);
  }
})();
