import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function NepalSambatToday() {
  const [todayData, setTodayData] = useState(null);

  useEffect(() => {
    async function fetchCalendar() {
      const res = await fetch('/ns-calendar-2024-2034.json');
      const data = await res.json();
      const today = new Date().toISOString().split('T')[0];
      const match = data.find(entry => entry.gregorian === today);
      setTodayData(match);
    }
    fetchCalendar();
  }, []);

  if (!todayData) {
    return (
      <div className="min-h-screen bg-yellow-50 text-center flex items-center justify-center">
        <p className="text-gray-600">Loading Nepal Sambat date...</p>
      </div>
    );
  }

  const ns = todayData.nepal_sambat;
  const bs = todayData.bikram_sambat;

  return (
    <>
      <Head>
        <title>Nepal Sambat Today — Pasaguthi</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 via-white to-yellow-50 text-gray-900 p-6">
        <h1 className="text-3xl font-extrabold text-yellow-700 text-center mb-6">📆 Nepal Sambat Today</h1>

        <div className="bg-white rounded-xl shadow-lg max-w-md mx-auto p-6 border border-yellow-300 text-center">
          <p className="text-lg font-semibold text-yellow-800 mb-2">
            N.S. {ns.year} {ns.month}{ns.fortnight} {ns.tithi}, {ns.weekday}
          </p>
          <p className="text-sm text-gray-600 mb-1">
            B.S. {bs.year} {bs.month} {bs.day}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            Gregorian: {todayData.gregorian}
          </p>

          {todayData.festival && (
            <div className="bg-yellow-200 text-yellow-900 px-3 py-2 rounded text-sm font-medium">
              🎉 {todayData.festival}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
