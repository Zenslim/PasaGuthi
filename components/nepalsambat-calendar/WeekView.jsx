import React from 'react';

export default function WeekView({ calendar }) {
  const today = new Date().toISOString().split('T')[0];
  const todayIndex = calendar.findIndex(entry => entry.gregorian === today);
  const weekRange = calendar.slice(Math.max(0, todayIndex - 3), todayIndex + 4);

  return (
    <div className="flex flex-col gap-3 max-w-5xl mx-auto px-4">
      {weekRange.map((entry, idx) => {
        const isToday = entry.gregorian === today;
        return (
          <div key={idx} className={`p-4 rounded shadow-md ${isToday ? 'bg-yellow-100 border-l-4 border-yellow-500' : 'bg-white'}`}>
            <h3 className="font-semibold text-lg text-yellow-800">
              {entry.nepal_sambat.year} {entry.nepal_sambat.month}{entry.nepal_sambat.fortnight} {entry.nepal_sambat.day} ({entry.nepal_sambat.tithi}) - {entry.nepal_sambat.weekday}
            </h3>
            <p className="text-sm text-gray-600">Gregorian: {entry.gregorian}</p>
            {entry.festival && (
              <div className="mt-1 text-sm text-yellow-700">
                {entry.festival.split(" | ").map((f, i) => (
                  <div key={i}>🎉 {f}</div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}