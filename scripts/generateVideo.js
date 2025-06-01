const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

module.exports.generateVideo = async (voicePath, whisper) => {
  const tempDir = path.join(__dirname, "../temp");
  const outputPath = path.join(tempDir, "video.mp4");
  const imagePath = path.join(__dirname, "../assets/fallback.jpg");

  if (!fs.existsSync(voicePath)) {
    throw new Error(`Voice file not found: ${voicePath}`);
  }

  if (!fs.existsSync(imagePath)) {
    throw new Error(`Missing background image: ${imagePath}`);
  }

  try {
    console.log("🎬 Generating video with ffmpeg...");

    const cmd = `
      ffmpeg -y -loop 1 -i "${imagePath}" -i "${voicePath}" \
      -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
      -pix_fmt yuv420p -shortest -movflags +faststart \
      "${outputPath}"
    `;

    execSync(cmd, { stdio: "inherit" });
    console.log(`✅ Video created: ${outputPath}`);
    return outputPath;

  } catch (err) {
    console.error("🔥 ffmpeg video generation failed:", err.message);
    throw err;
  }
};
