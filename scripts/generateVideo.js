module.exports.generateVideo = async (voicePath, whisper) => {
  return voicePath.replace('voice.mp3', 'video.mp4');
};