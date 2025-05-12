
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import enrichedCalendar from '../../public/ns-calendar-enriched-2024-2034.json';

export default function WeekView() {
  const today = new Date().toISOString().slice(0, 10);
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const todayIndex = enrichedCalendar.findIndex(entry => entry.gregorian === today);
    if (todayIndex >= 0) {
      const week = enrichedCalendar.slice(Math.max(0, todayIndex - 3), todayIndex + 4);
      setWeekDays(week);
    }
  }, []);

  return (
    <motion.div
      className="bg-white border border-yellow-300 rounded-xl p-4 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-bold mb-3 text-center">🗓️ This Week</h3>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {weekDays.map((entry, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-lg border ${
              entry.gregorian === today ? 'border-yellow-500 bg-yellow-100' : 'bg-yellow-50'
            }`}
          >
            <div className="font-bold">{entry.nepal_sambat.weekday}</div>
            <div>NS: {entry.nepal_sambat.day}</div>
            <div className="text-xs text-gray-500">{entry.nepal_sambat.tithi}</div>
            {entry.festival && (
              <div className="text-red-600 text-xs mt-1">🎉 {entry.festival}</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
