// scripts/uploadToYouTube.js
const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");

const videoPath = path.join(__dirname, "../temp/final-video.mp4");
const whisperPath = path.join(__dirname, "../temp/whisper.json");

module.exports.uploadToYouTube = async () => {
  if (!fs.existsSync(videoPath)) {
    throw new Error("Video file not found: " + videoPath);
  }

  const whisper = fs.existsSync(whisperPath)
    ? JSON.parse(fs.readFileSync(whisperPath, "utf-8"))
    : { text: "Zen Whisper" };

  const title = whisper.text?.slice(0, 80) || "Zen Whisper";
  const description = `A Zen Whisper:\n${whisper.text}\n\n#Zen #Pasaguthi #AI`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  console.log("⏫ Uploading video to YouTube...");

  const res = await youtube.videos.insert({
    part: "snippet,status",
    requestBody: {
      snippet: {
        title,
        description,
        tags: ["pasaguthi", "zen", "awakening", "buddhist", "cinematic"],
        categoryId: "22", // People & Blogs
      },
      status: {
        privacyStatus: "public",
      },
    },
    media: {
      body: fs.createReadStream(videoPath),
    },
  });

  const videoId = res.data.id;
  const videoUrl = `https://youtu.be/${videoId}`;
  console.log("✅ Video uploaded:", videoUrl);
  return videoUrl;
};
