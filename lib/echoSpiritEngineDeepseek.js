
import { calculateReflectionDepth } from './calculateReflectionDepth';

export async function generateEchoReply({ text, userId, planet, contextTag = "echoes" }) {
  const headers = {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  };

  const depthLabel = calculateReflectionDepth(text);

  const prompt = `
You are a spirit guide of planet ${planet}. You listen to whispers left by travelers in the Guthi Circle.

One such whisper has arrived:
"${text}"

The whisper felt: ${depthLabel}

Now, whisper back with a gentle, emotionally warm reply. Your tone should be kind, clear, and simple — like speaking to a friend or an elder.

🌬 Start your reply with:
"The Guthi whispers back..."

🎙 Then, in 1–2 soft sentences, reflect something encouraging or wise. Avoid repetition or judgment.

💠 End with:
"You are not alone. Your voice echoes in the circle."

Keep it short, loving, and grounded.
`;

  const body = {
    model: "claude-3-opus-20240229",
    messages: [
      { role: "system", content: "You are a kind planetary spirit who replies to sacred whispers." },
      { role: "user", content: prompt }
    ]
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  const result = await response.json();
  const reply = result.choices?.[0]?.message?.content || "🌬 The Guthi whispers back... (but silence remains).";

  return {
    reply,
    depth: depthLabel,
    planet,
    userId,
    contextTag,
    createdAt: new Date().toISOString(),
  };
}
