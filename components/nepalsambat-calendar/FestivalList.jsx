import { useEffect, useState } from 'react';

export default function FestivalList() {
  const [festivals, setFestivals] = useState([]);

  useEffect(() => {
    // Attempt to fetch the festival JSON if available
    fetch('/ns-calendar-enriched-2024-2034.json')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => {
        const flatList = data.flatMap(entry =>
          (entry.events || []).map(event => ({
            ad: entry.ad,
            ns: entry.ns,
            event,
          }))
        );
        setFestivals(flatList);
      })
      .catch(() => {
        console.warn('📭 Festival list not available.');
        setFestivals([]);
      });
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-center text-indigo-500">🎉 Upcoming Festivals</h2>

      {festivals.length === 0 ? (
        <p className="text-gray-500 text-center italic">No festivals available.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {festivals.slice(0, 30).map(({ ad, ns, event }, idx) => (
            <li key={idx} className="border-l-4 border-pink-400 pl-2">
              <span className="text-gray-500">{ad} / NS: {ns}</span><br />
              <span className="text-pink-600 dark:text-pink-400 font-semibold">{event}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
