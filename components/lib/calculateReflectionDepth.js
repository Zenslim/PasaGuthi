
export function calculateReflectionDepth(text) {
  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 5) return '🪶 Very Light';
  if (wordCount < 15) return '🌿 Light';
  if (wordCount < 30) return '🔥 Deep';
  return '🌌 Very Deep';
}
