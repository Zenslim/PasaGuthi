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

  const tryModel = async (model) => {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 700
    });
    return response.choices[0].message.content.trim();
  };

  try {
    console.log("🌀 Trying GPT-4...");
    const gpt4 = await tryModel("gpt-4");
    console.log("✅ GPT-4 succeeded.");
    return { title: "Zen Whisper", body: gpt4 };
  } catch (err) {
    if (err.code === "model_not_found" || err.status === 404) {
      console.warn("⚠️ GPT-4 unavailable. Falling back to GPT-3.5.");
      const gpt35 = await tryModel("gpt-3.5-turbo");
      console.log("✅ GPT-3.5-turbo succeeded.");
      return { title: "Zen Whisper", body: gpt35 };
    } else {
      throw err;
    }
  }
};
