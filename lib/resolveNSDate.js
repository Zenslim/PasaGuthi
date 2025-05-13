export default async function resolveNSDate(gregorianDate) {
  try {
    const res = await fetch('/ns-calendar-2025-2026.json');
    const calendarData = await res.json();
    const entry = calendarData.find(d => d.ad === gregorianDate);
    return entry || null;
  } catch (err) {
    console.warn("Failed to load or resolve NS date:", err);
    return null;
  }
}
