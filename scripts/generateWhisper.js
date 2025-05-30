const axios = require("axios");

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

module.exports.generateWhisper = async () => {
  const prompt = `
You are a visionary narrator crafting a 2–3 minute cinematic script.
Your mission is to awaken hearts and minds with a poetic, emotionally resonant narrative
that explores transformation, impermanence, or purpose in a way that can go viral.
Use rhythm, space, and emotionally powerful phrasing. End with a goosebump-worthy thought.

Write ~400–500 words. No labels or titles. Just the raw whisper.
  `.trim();

  const headers = {
    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
    "HTTP-Referer": "https://pasaguthi.org/",
    "X-Title": "Zen Whisper Generator"
  };

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "deepseek-chat", // or "mistralai/mixtral-8x7b"
        messages: [{ role: "user", content: prompt }],
        temperature: 0.85,
        max_tokens: 700
      },
      { headers }
    );

    const fullScript = response.data.choices[0].message.content.trim();
    console.log("📜 Whisper script generated:", fullScript.slice(0, 100), "...");
    return {
      title: "Zen Whisper",
      body: fullScript
    };
  } catch (err) {
    console.error("🔥 OpenRouter Whisper generation failed:", err.message);
    throw err;
  }
};
