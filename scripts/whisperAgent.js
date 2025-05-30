const { generateWhisper } = require("./generateWhisper");
const { generateVoice } = require("./generateVoice");
const { generateVideo } = require("./generateVideo");
const { uploadToYouTube } = require("./uploadToYouTube");
const { notifyN8n } = require("./notifyN8n");
const fs = require("fs");

(async () => {
  try {
    const whisper = await generateWhisper();
    const voicePath = await generateVoice(whisper);
    const videoPath = await generateVideo(voicePath, whisper);

    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`);
    }

    const youtubeUrl = await uploadToYouTube(videoPath, whisper);

    await notifyN8n({ url: youtubeUrl, ...whisper });
    console.log("✅ Zen Whisper Agent pipeline completed.");
  } catch (err) {
    console.error("🔥 Pipeline failed:", err.message);
    process.exit(1);
  }
})();
