// scripts/edgeTTS.js
const fs = require("fs");
const edgeTTS = require("edge-tts");

module.exports.generateEdgeVoice = async (text, outputPath) => {
  try {
    const stream = await edgeTTS
      .synthesize({
        text,
        voice: "en-US-AriaNeural", // ✅ You can change this voice
      })
      .then((r) => r.stream());

    const writeStream = fs.createWriteStream(outputPath);
    for await (const chunk of stream) {
      writeStream.write(chunk);
    }
    writeStream.end();
  } catch (err) {
    throw new Error(`Edge TTS API failed: ${err.message}`);
  }
};
