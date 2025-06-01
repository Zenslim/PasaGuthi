// scripts/edgeTTS.js
const { exec } = require("child_process");

module.exports.generateEdgeVoice = (text, outputPath) => {
  return new Promise((resolve, reject) => {
    const safeText = text.replace(/"/g, "'"); // escape quotes
    const cmd = `npx edge-tts --voice en-US-AriaNeural --text "${safeText}" --write-media "${outputPath}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`edge-tts failed: ${stderr || error.message}`));
      }
      resolve();
    });
  });
};
