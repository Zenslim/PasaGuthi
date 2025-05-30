const { generateWhisper } = require('./generateWhisper');
const { generateVoice } = require('./generateVoice');
const { generateVideo } = require('./generateVideo');
const { uploadToYouTube } = require('./uploadToYouTube');
const { notifyN8n } = require('./notifyN8n');

(async () => {
  const whisper = await generateWhisper();
  const voicePath = await generateVoice(whisper);
  const videoPath = await generateVideo(voicePath, whisper);
  const youtubeUrl = await uploadToYouTube(videoPath, whisper);
  await notifyN8n({ url: youtubeUrl, ...whisper });
})();