
// NSDateUtils.js — Nepal Sambat date conversion & lookup utilities

import enrichedCalendar from '/public/ns-calendar-enriched-2024-2034.json';

export function getTodayNS() {
  const today = new Date().toISOString().slice(0, 10);
  return enrichedCalendar.find(entry => entry.gregorian === today);
}

export function convertDate({ from, to, date }) {
  if (!['AD', 'NS', 'BS'].includes(from) || !['AD', 'NS', 'BS'].includes(to)) return null;
  if (from === 'AD') {
    const entry = enrichedCalendar.find(d => d.gregorian === date);
    return entry ? entry[to.toLowerCase().replace('ad', 'gregorian')] : null;
  } else if (from === 'NS') {
    const entry = enrichedCalendar.find(d =>
      d.nepal_sambat.year === date.year &&
      d.nepal_sambat.month === date.month &&
      d.nepal_sambat.day === date.day
    );
    return entry ? entry[to.toLowerCase().replace('ad', 'gregorian')] : null;
  } else if (from === 'BS') {
    const entry = enrichedCalendar.find(d =>
      d.bikram_sambat.year === date.year &&
      d.bikram_sambat.month === date.month &&
      d.bikram_sambat.day === date.day
    );
    return entry ? entry[to.toLowerCase().replace('ad', 'gregorian')] : null;
  }
  return null;
}

export function getFestivalsForYear(nsYear) {
  return enrichedCalendar.filter(entry => entry.nepal_sambat.year === nsYear && entry.festival);
}
