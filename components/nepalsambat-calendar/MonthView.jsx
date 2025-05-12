import React from 'react';

export default function MonthView({ calendar, currentMonth }) {
  const filtered = calendar.filter(e => e.nepal_sambat.month === currentMonth);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4">
      {filtered.map((entry, idx) => (
        <div key={idx} className="p-3 border border-yellow-400 bg-white rounded shadow-sm">
          <h3 className="text-yellow-700 font-semibold">
            {entry.nepal_sambat.month}{entry.nepal_sambat.fortnight} {entry.nepal_sambat.day}
          </h3>
          <p className="text-sm text-gray-700">{entry.nepal_sambat.tithi}, {entry.nepal_sambat.weekday}</p>
          <p className="text-xs text-gray-500">AD: {entry.gregorian}</p>
          {entry.festival && (
            <div className="mt-1 text-yellow-700 text-xs">
              {entry.festival.split(" | ").map((f, i) => (
                <div key={i}>🎉 {f}</div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}