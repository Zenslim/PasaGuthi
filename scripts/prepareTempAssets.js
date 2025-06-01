// scripts/prepareTempAssets.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const tempDir = path.join(__dirname, "../temp");
const scenesDir = path.join(tempDir, "scenes");
const assetsDir = path.join(__dirname, "../assets");
const fallbackJpg = path.join(assetsDir, "fallback.jpg");
const fallbackMp3 = path.join(assetsDir, "fallback.mp3");
const voiceDest = path.join(tempDir, "voice.mp3");

if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
if (!fs.existsSync(scenesDir)) fs.mkdirSync(scenesDir, { recursive: true });

// Copy fallback.mp3 as voice.mp3
fs.copyFileSync(fallbackMp3, voiceDest);
console.log("✅ voice.mp3 created from fallback.mp3");

// Create 10 fake scene mp4s using fallback.jpg
for (let i = 1; i <= 10; i++) {
  const sceneOut = path.join(scenesDir, `scene${i}.mp4`);
  const cmd = `
    ffmpeg -y -loop 1 -i "${fallbackJpg}" -t 1 \
    -vf "scale=800:600,format=yuv420p,fps=25" \
    -c:v libx264 -pix_fmt yuv420p "${sceneOut}"
  `;
  execSync(cmd, { stdio: "inherit", shell: "/bin/bash" });
  console.log(`✅ Created ${sceneOut}`);
}
