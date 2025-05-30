const fs = require('fs');
const path = require('path');
const tempDir = path.join(__dirname, '..', 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
const voicePath = path.join(tempDir, 'voice.mp3');
fs.writeFileSync(voicePath, 'Fake voice data');
module.exports.generateVoice = async () => voicePath;