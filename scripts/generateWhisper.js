const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

module.exports.generateWhisper = async () => {
  const prompt = `
You are a visionary narrator crafting a 2–3 minute cinematic script.
Your mission is to awaken hearts and minds with a poetic, emotionally resonant narrative
that explores transformation, impermanence, or purpose in a way that can go viral.
Use rhythm, space, and emotionally powerful phrasing. End with a goosebump-worthy thought.

Write ~400–500 words. No labels or titles. Just the raw whisper.
  `.trim();

  const chatCompletion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.85,
    max_tokens: 700
  });

  const fullScript = chatCompletion.choices[0].message.content.trim();
  console.log("📜 Whisper script generated:", fullScript.slice(0, 100), "...");

  return {
    title: "Zen Whisper",
    body: fullScript,
  };
};
