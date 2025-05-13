export default async function resolveNSDate(gregorianDate) {
  try {
    const res = await fetch('/ns-calendar-2025-2026.json');
    const calendarData = await res.json();
    return calendarData.find(d => d.ad === gregorianDate) || null;
  } catch (err) {
    console.warn("Failed to resolve NS date:", err);
    return null;
  }
}
