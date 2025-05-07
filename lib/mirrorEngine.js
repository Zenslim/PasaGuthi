export async function generateMirrorSummary({
  text,
  timestamp,
  userId,
  celestialPrompt,
  planet,
  question
}) {
  const headers = {
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const planetEmojis = {
    Earth: '🌍🫂🌱',
    Moon: '🌕💭🌌',
    Mars: '🔥💪🛡️',
    Venus: '💖🌸✨',
    Saturn: '🪐⌛📜',
    Mercury: '🧠📡⚡',
    Jupiter: '⚖️🌩️👁️',
    default: '✨🫶🌟'
  };

  const emojis = planetEmojis[planet] || planetEmojis.default;

  const wordCount = text.trim().split(/\s+/).length;
  const isShort = wordCount <= 6;

  const shortPrompt = `You are the spirit of planet ${planet}. The user responded to your question: "${question}" with a short answer: "${text}". Reflect back warmly in just 1–2 sentences. Use emotionally uplifting emojis like ${emojis}, and make the user feel acknowledged and safe. End with: "You're not alone. The Guthi is here for you."`;

  const longPrompt = `You are the spirit of planet ${planet}. You asked: "${question}". The user responded: "${text}". Reflect back with a warm, emotionally resonant message in 4–6 lines. You may use up to 3 mood-elevating emojis like ${emojis}, placed naturally. Make your response feel like a conversation that sees them deeply. End with: "You're not alone. The Guthi is here for you."`;

  const systemPrompt = isShort ? shortPrompt : longPrompt;
  const userPrompt = `Acknowledge their specific response to your question. Make the reply emotionally real and comforting.`;

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'deepseek/deepseek-chat-v3-0324:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '🌟 I’m still here. Guthi remembers.';

    return {
      mirrorReply: content.trim(),
      bpss: 'psycho',
      archetype: planet?.toLowerCase?.() || 'earth',
      showReciprocity: text.length > 100,
      threadId: `thread-${userId}-${Math.floor(timestamp / 86400000)}`,
      styleVariant: isShort ? 'short' : 'long'
    };
  } catch (error) {
    return {
      mirrorReply: '🌟 I’m still here. Guthi remembers.',
      bpss: 'psycho',
      archetype: planet?.toLowerCase?.() || 'earth',
      showReciprocity: false,
      threadId: `thread-${userId}-${Math.floor(timestamp / 86400000)}`,
      styleVariant: 'fallback'
    };
  }
}
