const axios = require("axios");
const fs = require("fs");
const path = require("path");

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_NAME = "Anjali"; // Make sure this exists in your ElevenLabs dashboard

async function getVoiceIdByName(name) {
  const res = await axios.get("https://api.elevenlabs.io/v1/voices", {
    headers: {
      "xi-api-key": ELEVENLABS_API_KEY
    }
  });
  const voice = res.data.voices.find(v => v.name.toLowerCase() === name.toLowerCase());
  if (!voice) throw new Error(`Voice "${name}" not found in ElevenLabs.`);
  return voice.voice_id;
}

module.exports.generateVoice = async (whisper) => {
  const voiceId = await getVoiceIdByName(VOICE_NAME);
  const outputPath = path.join("temp", "voice.mp3");

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: whisper.body,
      model_id: "eleven_monolingual_v1", // safe default
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.75
      }
    },
    {
      responseType: "stream",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  await new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outputPath);
    response.data.pipe(stream);
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });

  console.log("🔉 Voice file ready:", outputPath);
  return outputPath;
};
