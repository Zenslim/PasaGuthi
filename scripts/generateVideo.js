// scripts/generateVideo.js
const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

module.exports.generateVideo = async (voicePath, whisper) => {
  const tempDir = path.join(__dirname, "../temp");
  const outputPath = path.join(tempDir, "video.mp4");
  const imagePath = path.join(__dirname, "../assets/placeholder.jpg"); // Replace with actual image
  const duration = 60; // fallback duration in seconds

  // Ensure voice file exists
  if (!fs.existsSync(voicePath)) {
    throw new Error(`Voice file not found: ${voicePath}`);
  }

  // Ensure fallback image exists
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Missing background image: ${imagePath}`);
  }

  // Generate video using ffmpeg
  try {
    console.log("🎬 Generating video with ffmpeg...");

    const cmd = `
      ffmpeg -y -loop 1 -i "${imagePath}" -i "${voicePath}" \
      -c:v libx264 -tune stillimage -c:a aac -b:a 192k \
      -pix_fmt yuv420p -shortest -movflags +faststart \
      -t ${duration} "${outputPath}"
    `;

    execSync(cmd, { stdio: "inherit" });
    console.log(`✅ Video created: ${outputPath}`);
    return outputPath;

  } catch (err) {
    console.error("🔥 ffmpeg video generation failed:", err.message);
    throw err;
  }
};
