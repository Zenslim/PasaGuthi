// scripts/generateVoice.js
const path = require("path");
const fs = require("fs");
const { generateEdgeVoice } = require("./edgeTTS");

module.exports.generateVoice = async (whisper) => {
  const voicePath = path.join(__dirname, "../temp/voice.mp3");

  const tempDir = path.dirname(voicePath);
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  console.log("🎙️ Generating voice with Edge TTS...");

  try {
    await generateEdgeVoice(whisper.body, voicePath);
    console.log(`🔉 Voice file ready: ${voicePath}`);
    return voicePath;
  } catch (err) {
    console.error("🔥 Voice generation failed:", err.message);
    throw err;
  }
};
