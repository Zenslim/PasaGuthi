const { google } = require("googleapis");
const fs = require("fs");

module.exports.uploadToYouTube = async (videoPath, { title, description }) => {
  if (!videoPath || !fs.existsSync(videoPath)) {
    throw new Error("Video file not found: " + videoPath);
  }

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
