const fs = require("fs");
const axios = require("axios");
const path = require("path");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // default: Rachel

module.exports.generateVoice = async (whisper) => {
  const text = whisper.body;
  const voiceName = "Rachel"; // optional, change as needed

  console.log(`🎙️ Generating voice with ${voiceName}...`);

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7
        }
      },
      {
        headers: {
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"
      }
    );

    const outPath = path.join(__dirname, "../temp/voice.mp3");
    fs.writeFileSync(outPath, response.data);
    console.log(`🔉 Voice file ready: ${outPath}`);
    return outPath;
  } catch (err) {
    console.error("🔥 Voice generation failed:", err.response?.data || err.message);
    throw err;
  }
};
