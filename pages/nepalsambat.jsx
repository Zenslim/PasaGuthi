import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function NepalSambatCalendar() {
  const [calendar, setCalendar] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [yearFilter, setYearFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');
  const [festivalOnly, setFestivalOnly] = useState(false);

  useEffect(() => {
    async function fetchCalendar() {
      const res = await fetch('/ns-calendar-2024-2034.json');
      const data = await res.json();
      setCalendar(data);
      setFiltered(data);
    }
    fetchCalendar();
  }, []);

  useEffect(() => {
    let result = calendar;
    if (yearFilter !== 'All') {
      result = result.filter(entry => entry.nepal_sambat.year.toString() === yearFilter);
    }
    if (monthFilter !== 'All') {
      result = result.filter(entry => entry.nepal_sambat.month === monthFilter);
    }
    if (festivalOnly) {
      result = result.filter(entry => entry.festival);
    }
    setFiltered(result);
  }, [yearFilter, monthFilter, festivalOnly, calendar]);

  const years = Array.from(new Set(calendar.map(e => e.nepal_sambat.year))).sort();
  const months = [
    "Kachhalā", "Thinlā", "Pohelā", "Sillā", "Chillā", "Chaulā",
    "Bachhalā", "Tachhalā", "Dilā", "Gunalā", "Yelā", "Gāunlā"
  ];

  return (
    <>
      <Head>
        <title>Nepal Sambat Calendar — Pasaguthi</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-white to-yellow-50 text-gray-900 px-4 py-8">
        <h1 className="text-3xl font-extrabold text-yellow-700 text-center mb-6">📅 Nepal Sambat Calendar (2024–2034)</h1>

        <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
          <select className="border px-2 py-1" onChange={e => setYearFilter(e.target.value)} value={yearFilter}>
            <option value="All">All Years</option>
            {years.map(y => <option key={y}>{y}</option>)}
          </select>
          <select className="border px-2 py-1" onChange={e => setMonthFilter(e.target.value)} value={monthFilter}>
            <option value="All">All Months</option>
            {months.map(m => <option key={m}>{m}</option>)}
          </select>
          <label className="flex items-center gap-1">
            <input type="checkbox" checked={festivalOnly} onChange={e => setFestivalOnly(e.target.checked)} />
            Festivals Only
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-yellow-200 text-yellow-900 text-sm">
                <th className="border p-2">Gregorian</th>
                <th className="border p-2">N.S. Date</th>
                <th className="border p-2">Tithi</th>
                <th className="border p-2">Weekday</th>
                <th className="border p-2">B.S. Date</th>
                <th className="border p-2">Festival</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, idx) => {
                const ns = entry.nepal_sambat;
                const bs = entry.bikram_sambat;
                return (
                  <tr key={idx} className="text-sm even:bg-yellow-50">
                    <td className="border px-2 py-1">{entry.gregorian}</td>
                    <td className="border px-2 py-1">
                      N.S. {ns.year} {ns.month}{ns.fortnight} {ns.day}
                    </td>
                    <td className="border px-2 py-1">{ns.tithi}</td>
                    <td className="border px-2 py-1">{ns.weekday}</td>
                    <td className="border px-2 py-1">B.S. {bs.year} {bs.month} {bs.day}</td>
                    <td className="border px-2 py-1">{entry.festival || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
