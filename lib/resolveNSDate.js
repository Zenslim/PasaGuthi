
// resolveNSDate.js — dynamic Panchanga-based NS/BS/AD resolver

// Example: uses GitHub static JSON as pseudo API (future: switch to live API or scraper backend)
const BS_DATA_URL = 'https://raw.githubusercontent.com/bibhuticoder/nepali-calendar-api/main/calendar/bs/2082.json';

export async function resolveNSDate(gregorianDate) {
  const [year, month, day] = gregorianDate.split('-');
  const bsYear = parseInt(year) + 57; // basic BS shift

  try {
    const res = await fetch(BS_DATA_URL);
    const bsCalendar = await res.json();

    const entry = bsCalendar.find(d => d.engDate === gregorianDate);
    if (!entry) return null;

    // Fake Nepal Sambat conversion (real logic requires lunar engine or HamroPatro)
    const nsYear = parseInt(year) - 879; // NS starts 879 AD
    const nsMonth = 'Kachhalā'; // Placeholder
    const nsDay = day; // Approx
    const tithi = entry.tithi || 'Ashtamī'; // Placeholder fallback

    return {
      ad: gregorianDate,
      bs: { year: entry.bsYear, month: entry.bsMonth, day: entry.bsDate },
      ns: { year: nsYear, month: nsMonth, day: parseInt(nsDay) },
      tithi: tithi,
      weekday: entry.weekDay,
      festival: entry.event || ''
    };
  } catch (e) {
    console.error('Failed to resolve NS date:', e);
    return null;
  }
}

// resolveNSDate.js — dynamic Panchanga-based NS/BS/AD resolver

// Example: uses GitHub static JSON as pseudo API (future: switch to live API or scraper backend)
const BS_DATA_URL = 'https://raw.githubusercontent.com/bibhuticoder/nepali-calendar-api/main/calendar/bs/2082.json';

export async function resolveNSDate(gregorianDate) {
  const [year, month, day] = gregorianDate.split('-');
  const bsYear = parseInt(year) + 57; // basic BS shift

  try {
    const res = await fetch(BS_DATA_URL);
    const bsCalendar = await res.json();

    const entry = bsCalendar.find(d => d.engDate === gregorianDate);
    if (!entry) return null;

    // Fake Nepal Sambat conversion (real logic requires lunar engine or HamroPatro)
    const nsYear = parseInt(year) - 879; // NS starts 879 AD
    const nsMonth = 'Kachhalā'; // Placeholder
    const nsDay = day; // Approx
    const tithi = entry.tithi || 'Ashtamī'; // Placeholder fallback

    return {
      ad: gregorianDate,
      bs: { year: entry.bsYear, month: entry.bsMonth, day: entry.bsDate },
      ns: { year: nsYear, month: nsMonth, day: parseInt(nsDay) },
      tithi: tithi,
      weekday: entry.weekDay,
      festival: entry.event || ''
    };
  } catch (e) {
    console.error('Failed to resolve NS date:', e);
    return null;
  }
}
