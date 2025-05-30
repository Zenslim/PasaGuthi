const fs = require('fs');
const path = require('path');
module.exports.generateVoice = async (whisper) => {
  const output = path.join(__dirname, '../temp/voice.mp3');
  fs.writeFileSync(output, 'FAKE_MP3_DATA'); // Replace with actual ElevenLabs API
  return output;
};
