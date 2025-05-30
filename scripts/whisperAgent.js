const { generateWhisper } = require("./generateWhisper");
const { generateVoice } = require("./generateVoice");
const { generateVideo } = require("./generateVideo");
const { uploadToYouTube } = require("./uploadToYouTube");
const { notifyN8n } = require("./notifyN8n");

// Timeout safeguard: exit after 10 minutes
setTimeout(() => {
  console.error("⏰ Timeout: Force exit after 10 minutes.");
  process.exit(1);
}, 10 * 60 * 1000);

(async () => {
  try {
    console.log("🌀 Generating whisper...");
    const whisper = await generateWhisper();

    console.log("🔊 Generating voice...");
    const voice = await generateVoice(whisper);

    console.log("🎬 Generating video...");
    const video = await generateVideo(voice, whisper);

    console.log("📤 Uploading to YouTube...");
    const url = await uploadToYouTube(video, whisper);

    console.log("📩 Notifying n8n...");
    await notifyN8n({ url, ...whisper });

    console.log("✅ Zen Whisper Agent finished successfully.");
    process.exit(0); // <-- required
  } catch (err) {
    console.error("🔥 Pipeline failed:", err);
    process.exit(1); // <-- fail fast
  }
})();
