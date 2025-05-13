import { useEffect, useState } from 'react';
import { resolveNSDate } from '@/lib/resolveNSDate';

export default function TodayCard() {
  const [todayInfo, setTodayInfo] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const ns = resolveNSDate(today);
    setTodayInfo({ date: today, ns });
  }, []);

  if (!todayInfo) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow text-gray-900 dark:text-white">
      <h2 className="text-xl font-bold mb-2 text-indigo-600">📅 Today: {todayInfo.date}</h2>
      {todayInfo.ns ? (
        <>
          <p className="text-green-600">NS Date: {todayInfo.ns.ns}</p>
          {todayInfo.ns.events?.length > 0 ? (
            <ul className="mt-2 list-disc list-inside text-sm text-pink-500">
              {todayInfo.ns.events.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No events today</p>
          )}
        </>
      ) : (
        <p className="text-red-500 text-sm mt-1">⚠️ NS date not found in database.</p>
      )}
    </div>
  );
}
