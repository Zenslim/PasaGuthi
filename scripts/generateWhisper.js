exports.generateWhisper = async () => {
  const prompts = [
    "🌿 Walk slowly. The earth is sacred.",
    "🌀 Your breath is a portal to clarity.",
    "🪷 Even the lotus blooms from mud.",
    "🔥 Burn illusions, not bridges.",
    "🕊 You are not late. You are timeless."
  ];
  const pick = prompts[Math.floor(Math.random() * prompts.length)];
  console.log("🧘 Whisper:", pick);
  return { title: "Zen Whisper", description: pick };
};
