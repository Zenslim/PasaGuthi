const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

module.exports.generateVideo = async () => {
  const outputPath = path.join('temp', 'video.mp4');
  const inputImage = path.join('assets', 'fallback.jpg');
  const inputAudio = path.join('temp', 'voice.mp3');

  // Check file existence
  if (!fs.existsSync(inputAudio)) throw new Error("❌ Missing: temp/voice.mp3");
  if (!fs.existsSync(inputImage)) throw new Error("❌ Missing: assets/fallback.jpg");

  const stats = fs.statSync(inputAudio);
  console.log("🎧 MP3 size:", stats.size, "bytes");

  fs.mkdirSync('temp', { recursive: true });

  const args = [
    '-loop', '1',
    '-framerate', '1',
    '-i', inputImage,
    '-i', inputAudio,
    '-y',
    '-c:v', 'libx264',
    '-t', '5',
    '-pix_fmt', 'yuv420p',
    '-shortest',
    outputPath
  ];

  console.log("🎞️ Running FFmpeg:", ffmpegPath, args.join(' '));

  return new Promise((resolve, reject) => {
    const ffmpeg = spawn(ffmpegPath, args);

    ffmpeg.stdout.on('data', (data) => {
      console.log(`🌀 stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`🛠️ stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ Video created: ${outputPath}`);
        resolve(outputPath);
      } else {
        reject(new Error(`❌ FFmpeg exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (err) => {
      reject(new Error(`❌ FFmpeg failed to start: ${err.message}`));
    });
  });
};
