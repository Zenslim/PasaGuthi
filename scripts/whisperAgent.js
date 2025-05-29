const { generateWhisper } = require('./generateWhisper');
const { generateVoice } = require('./generateVoice');
const { generateVideo } = require('./generateVideo');
const { uploadToYouTube } = require('./uploadToYouTube');
const { notifyN8n } = require('./notifyN8n');

(async () => {
  try {
    console.log("🧠 Generating whisper script...");
    const whisper = await generateWhisper();

    console.log("🔊 Generating voice...");
    const voicePath = await generateVoice(whisper);

    console.log("🎥 Creating video...");
    const videoPath = await generateVideo(voicePath, whisper);

    console.log("📤 Uploading to YouTube...");
    const youtubeUrl = await uploadToYouTube(videoPath, whisper);

    console.log("🕸 Notifying n8n...");
    await notifyN8n({ url: youtubeUrl, ...whisper });

    console.log("✅ Whisper flow completed successfully.");
  } catch (err) {
    console.error("❌ Whisper flow failed:", err);
    process.exit(1);
  }
})();
