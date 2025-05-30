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

  fs.mkdirSync('temp', { recursive: true });

  return new Promise((resolve, reject) => {
    ffmpeg()
      .addInput(inputImage)
      .loop(5) // Duration in seconds
      .addInput(inputAudio)
      .outputOptions('-shortest')
      .output(outputPath)
      .on('end', () => {
        console.log(`✅ Video created: ${outputPath}`);
        resolve();
      })
      .on('error', reject)
      .run();
  });
};
