import { useEffect, useState } from 'react';

export default function WeekView({ calendar }) {
  const [weekData, setWeekData] = useState([]);

  useEffect(() => {
    if (!calendar || calendar.length === 0) return;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayIndex = calendar.findIndex(e => e.gregorian === todayStr);
    const start = Math.max(0, todayIndex - 3);
    const end = start + 7;
    setWeekData(calendar.slice(start, end));
  }, [calendar]);

  return (
    <div className="flex overflow-x-auto gap-4 p-2 pb-4">
      {weekData.map((entry, idx) => {
        const ns = entry.nepal_sambat;
        const isToday = entry.gregorian === new Date().toISOString().split('T')[0];
        return (
          <div key={idx} className={`min-w-[140px] rounded-xl p-3 shadow-md border ${isToday ? 'bg-yellow-300 text-black' : 'bg-white text-yellow-900'}`}>
            <div className="text-sm font-semibold text-center">
              {entry.gregorian} ({ns.weekday})
            </div>
            <div className="text-xs text-center mt-1">
              N.S. {ns.year} {ns.month}{ns.fortnight} {ns.day}<br />
              <span className="font-medium">{ns.tithi}</span>
            </div>
            {entry.festival && (
              <div className="mt-2 text-xs text-yellow-800 bg-yellow-100 rounded p-1 text-center">
                🎉 {entry.festival}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
