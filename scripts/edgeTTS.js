// scripts/edgeTTS.js
const { exec } = require("child_process");

module.exports.generateEdgeVoice = (text, outputPath) => {
  return new Promise((resolve, reject) => {
    const safeText = text.replace(/"/g, "'"); // escape quotes
    const cmd = `edge-tts --text "${safeText}" --voice en-US-AriaNeural --write-media "${outputPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Edge TTS CLI failed: ${stderr || error.message}`));
      }
      resolve();
    });
  });
};
