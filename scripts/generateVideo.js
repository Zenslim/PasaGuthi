const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

// Point fluent-ffmpeg to ffmpeg-static binary
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports.generateVideo = async () => {
  const outputPath = path.join('temp', 'video.mp4');
  const inputImage = path.join('assets', 'fallback.jpg');
  const inputAudio = path.join('temp', 'voice.mp3');

  // Check existence of required files
  if (!fs.existsSync(inputAudio)) throw new Error("❌ Missing input audio: temp/voice.mp3");
  if (!fs.existsSync(inputImage)) throw new Error("❌ Missing image: assets/fallback.jpg");

  fs.mkdirSync('temp', { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputImage)
      .loop(5) // Duration in seconds
      .input(inputAudio)
      .outputOptions('-shortest')
      .output(outputPath)
      .on('start', (cmd) => console.log("🎞️ FFmpeg started:", cmd))
      .on('progress', (p) => console.log(`⏱️ Progress: ${p.percent?.toFixed(2) || '?'}%`))
      .on('end', () => {
        console.log(`✅ Video created: ${outputPath}`);
        resolve(outputPath); // IMPORTANT: return the path!
      })
      .on('error', (err) => {
        console.error("❌ FFmpeg error:", err.message);
        reject(err);
      })
      .run();
  });
};
