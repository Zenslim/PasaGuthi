const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const ffmpeg = require('fluent-ffmpeg');

// Point to ffmpeg-static binary
ffmpeg.setFfmpegPath(ffmpegPath);

module.exports.generateVoice = async (text) => {
  const fallbackInput = path.join('assets', 'fallback.mp3');
  const outputPath = path.join('temp', 'voice.mp3');

  fs.mkdirSync('temp', { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg(fallbackInput)
      .output(outputPath)
      .on('end', () => {
        console.log(`🔉 Voice file ready: ${outputPath}`);
        resolve();
      })
      .on('error', (err) => {
        console.error("❌ Failed to re-encode fallback.mp3:", err.message);
        reject(err);
      })
      .run();
  });
};
