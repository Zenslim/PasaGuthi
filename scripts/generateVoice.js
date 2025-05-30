const fs = require("fs");
const path = require("path");

module.exports.generateVoice = async ({ description }) => {
  const voicePath = path.join(__dirname, "../temp/voice.mp3");
  fs.mkdirSync(path.dirname(voicePath), { recursive: true });

  const fallback = path.join(__dirname, "../assets/fallback.mp3");
  if (!fs.existsSync(fallback)) {
    throw new Error("❌ Missing fallback.mp3 for voice generation at: " + fallback);
  }

  fs.copyFileSync(fallback, voicePath);
  console.log("🔉 Voice file ready:", voicePath);
  return voicePath;
};
