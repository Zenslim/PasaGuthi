// scripts/mergeVideoAssets.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const tempDir = path.join(__dirname, "../temp");
const sceneDir = path.join(tempDir, "scenes");
const voicePath = path.join(tempDir, "voice.mp3");
const concatListPath = path.join(tempDir, "scenes.txt");
const outputPath = path.join(tempDir, "final-video.mp4");

// STEP 1: Build scenes.txt for ffmpeg concat
function buildConcatFile() {
  const files = fs
    .readdirSync(sceneDir)
    .filter(f => f.endsWith(".mp4"))
    .sort((a, b) => {
      const num = name => parseInt(name.match(/\d+/)?.[0] || 0, 10);
      return num(a) - num(b);
    });

  const list = files.map(file => `file '${path.join(sceneDir, file)}'`).join("\n");
  fs.writeFileSync(concatListPath, list);
  console.log("✅ scenes.txt created for ffmpeg");
}

// STEP 2: Run ffmpeg to merge scenes + voice
function merge() {
  try {
    const cmd = `
      ffmpeg -y -f concat -safe 0 -i "${concatListPath}" -i "${voicePath}" \
      -c:v libx264 -c:a aac -b:a 192k -pix_fmt yuv420p -shortest \
      "${outputPath}"
    `;
    execSync(cmd, { stdio: "inherit", shell: "/bin/bash" });
    console.log("✅ final-video.mp4 created:", outputPath);
  } catch (err) {
    console.error("❌ Failed to merge:", err.message);
    process.exit(1);
  }
}

buildConcatFile();
merge();
