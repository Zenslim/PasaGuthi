const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const VOICE_ID = 'Anjali-YourVoiceID'; // Replace with actual Anjali voice ID in secrets or code

module.exports.generateVoice = async (whisper) => {
  const voiceText = whisper.body;
  const outputPath = path.join('temp', 'voice.mp3');
  fs.mkdirSync('temp', { recursive: true });

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

  const payload = {
    text: voiceText,
    voice_settings: {
      stability: 0.25,         // More expressive variation
      similarity_boost: 0.9,   // Keep Anjali’s tone consistent
      style: 1.4,              // Slightly dramatic
      use_speaker_boost: true
    },
    model_id: "eleven_monolingual_v1"
  };

  const headers = {
    'xi-api-key': ELEVENLABS_API_KEY,
    'Content-Type': 'application/json'
  };

  console.log("🎙️ Generating voice with Anjali...");
  const response = await axios.post(url, payload, { headers, responseType: 'stream' });

  const writer = fs.createWriteStream(outputPath);
  await new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  console.log(`✅ Anjali voice file ready: ${outputPath}`);
  return outputPath;
};