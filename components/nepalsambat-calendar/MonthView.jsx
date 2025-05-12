import { useEffect, useState } from 'react';

export default function MonthView({ calendar }) {
  const [monthData, setMonthData] = useState([]);

  useEffect(() => {
    if (!calendar || calendar.length === 0) return;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const todayEntry = calendar.find(e => e.gregorian === todayStr);
    if (!todayEntry) return;

    const { year, month } = todayEntry.nepal_sambat;
    const filtered = calendar.filter(e => e.nepal_sambat.year === year && e.nepal_sambat.month === month);
    setMonthData(filtered);
  }, [calendar]);

  const getGrid = () => {
    const rows = [];
    let row = [];
    monthData.forEach((day, i) => {
      row.push(day);
      if (row.length === 7) {
        rows.push(row);
        row = [];
      }
    });
    if (row.length > 0) rows.push(row);
    return rows;
  };

  const grid = getGrid();

  return (
    <div className="w-full max-w-5xl mx-auto p-2">
      <div className="grid grid-cols-7 text-center font-semibold text-yellow-900 border-b">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>
      {grid.map((week, i) => (
        <div key={i} className="grid grid-cols-7 text-xs">
          {week.map((entry, j) => {
            const ns = entry.nepal_sambat;
            const isToday = entry.gregorian === new Date().toISOString().split('T')[0];
            return (
              <div key={j} className={`border p-2 h-24 ${isToday ? 'bg-yellow-300' : 'bg-white'} relative`}>
                <div className="font-bold text-yellow-800">{ns.day}</div>
                <div className="text-gray-500 text-[10px]">{ns.tithi}</div>
                {entry.festival && (
                  <div className="absolute bottom-1 left-1 right-1 text-[10px] text-yellow-700 truncate">
                    🎊 {entry.festival}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
