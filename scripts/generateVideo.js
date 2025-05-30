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

  // Log file size for debugging
  const stats = fs.statSync(inputAudio);
  console.log("🎧 MP3 size:", stats.size, "bytes");

  fs.mkdirSync('temp', { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputImage)
      .inputOptions(['-loop 1', '-framerate 1']) // Loop static image at 1 FPS
      .input(inputAudio)
      .outputOptions([
        '-c:v libx264',        // use H.264 codec
        '-t 5',                // total duration
        '-pix_fmt yuv420p',    // ensure compatibility
        '-shortest'            // stop at shortest input
      ])
      .output(outputPath)
      .on('start', (cmd) => console.log("🎞️ FFmpeg started:", cmd))
      .on('progress', (p) => {
        const percent = p.percent?.toFixed(2) ?? '?';
        console.log(`⏱️ Progress: ${percent}%`);
      })
      .on('end', () => {
        console.log(`✅ Video created: ${outputPath}`);
        resolve(outputPath); // Return the path to the generated video
      })
      .on('error', (err) => {
        console.error("❌ FFmpeg error:", err.message);
        reject(err);
      })
      .run();
  });
};
