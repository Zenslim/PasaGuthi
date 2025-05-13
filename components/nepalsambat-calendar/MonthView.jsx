import { useState, useEffect } from 'react';
import { resolveNSDate } from '@/lib/resolveNSDate';

export default function MonthView() {
  const [days, setDays] = useState([]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-indexed

    const numDays = new Date(year, month + 1, 0).getDate();

    const monthDays = [];
    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      const iso = date.toISOString().split('T')[0];
      const ns = resolveNSDate(iso);
      monthDays.push({ date: iso, ns });
    }

    setDays(monthDays);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-center text-indigo-500">📅 This Month in Nepal Sambat</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 text-sm text-gray-700 dark:text-gray-200">
        {days.map(({ date, ns }) => (
          <div
            key={date}
            className="p-3 border border-gray-300 dark:border-gray-700 rounded hover:bg-indigo-50 dark:hover:bg-slate-800"
          >
            <div className="font-semibold">{date}</div>
            {ns ? (
              <>
                <div className="text-green-500">📅 NS: {ns.ns}</div>
                {ns.events?.length > 0 && (
                  <ul className="mt-1 list-disc list-inside text-xs text-pink-400">
                    {ns.events.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="text-red-500 text-xs">NS date not found</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
