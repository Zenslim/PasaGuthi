import React from 'react';

export default function MonthGrid({ calendar }) {
  const todayDate = new Date().toISOString().split('T')[0];
  const todayObj = calendar.find(e => e.gregorian === todayDate);
  if (!todayObj) return <p className="text-center">Today's date not found in calendar.</p>;

  const currentMonth = todayObj.nepal_sambat.month;
  const currentYear = todayObj.nepal_sambat.year;

  const filtered = calendar.filter(e =>
    e.nepal_sambat.year === currentYear &&
    e.nepal_sambat.month === currentMonth &&
    e.gregorian >= todayDate
  );

  return (
    <div className="p-4">
      <h2 className="text-center text-xl font-bold text-yellow-800 mb-4">
        {currentMonth} {currentYear}
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map((entry, idx) => (
          <div key={idx} className="bg-white border rounded shadow p-3 hover:shadow-lg transition">
            <div className="text-yellow-700 font-semibold text-sm">
              N.S. {entry.nepal_sambat.day} {entry.nepal_sambat.fortnight}
            </div>
            <div className="text-xs text-gray-600">
              {entry.nepal_sambat.tithi}, {entry.nepal_sambat.weekday}
            </div>
            <div className="text-xs text-gray-500">AD: {entry.gregorian}</div>
            {entry.festival && (
              <div className="mt-1 text-yellow-700 text-xs">
                {entry.festival.split(" | ").map((f, i) => (
                  <div key={i}>🎊 {f}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
