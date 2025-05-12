import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function NepalSambatCalendar() {
  const [calendar, setCalendar] = useState([]);

  useEffect(() => {
    async function fetchCalendar() {
      const res = await fetch('/ns-calendar-2024-2034.json');
      const data = await res.json();
      setCalendar(data);
    }
    fetchCalendar();
  }, []);

  return (
    <>
      <Head>
        <title>Nepal Sambat Calendar — Pasaguthi</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-white to-yellow-50 text-gray-900 px-4 py-8">
        <h1 className="text-3xl font-extrabold text-yellow-700 text-center mb-6">📅 Nepal Sambat Calendar (2024–2034)</h1>

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
              {calendar.map((entry, idx) => {
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
