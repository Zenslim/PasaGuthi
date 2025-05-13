import calendarData from '../public/ns-calendar-2025-2026.json';

export function resolveNSDate(gregorianDate) {
  const entry = calendarData.find(d => d.ad === gregorianDate);
  if (!entry) {
    console.warn("NS date not found for:", gregorianDate);
    return null;
  }
  return entry;
}
