import { useEffect, useState } from 'react';
import { resolveNSDate } from '@/lib/resolveNSDate';

export default function MonthView() {
  const [days, setDays] = useState([]);

  useEffect(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth(); // 0-indexed
    const daysInMonth = new Date(y, m + 1, 0).getDate();

    const allDays = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(y, m, i);
      const ad = date.toISOString().split('T')[0];
      const ns = resolveNSDate(ad);
      allDays.push({ ad, ns });
    }

    setDays(allDays);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 text-sm">
      {days.map((d, idx) => (
        <div
          key={idx}
          className="p-3 border rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
        >
          <div className="font-bold text-yellow-300">{d.ad}</div>
          <div className="text-green-300 text-xs">{d.ns?.ns || '—'}</div>
          {d.ns?.events?.length > 0 && (
            <ul className="text-pink-400 text-xs mt-1 list-disc pl-4">
              {d.ns.events.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
