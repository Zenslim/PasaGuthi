
import React, { useEffect, useState } from 'react';
import { resolveNSDate } from '@/lib/resolveNSDate';
import { motion } from 'framer-motion';

export default function WeekView() {
  const [weekDays, setWeekDays] = useState([]);

  useEffect(() => {
    const today = new Date();
    const weekEntries = [];

    for (let offset = -3; offset <= 3; offset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + offset);
      const iso = date.toISOString().slice(0, 10);
      const entry = resolveNSDate(iso);
      if (entry) weekEntries.push(entry);
    }

    setWeekDays(weekEntries);
  }, []);

  return (
    <motion.div
      className="bg-white border border-yellow-300 rounded-xl p-4 mt-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-lg font-bold mb-3 text-center">🗓️ This Week (Nepal Sambat)</h3>
      <div className="grid grid-cols-7 gap-2 text-sm">
        {weekDays.map((entry, idx) => (
          <div
            key={idx}
            className="p-2 rounded-lg border bg-yellow-50 hover:border-yellow-500"
          >
            <div className="font-bold">{entry.weekday}</div>
            <div>NS: {entry.ns.day} {entry.ns.month}</div>
            <div className="text-xs text-gray-600">{entry.tithi}</div>
            {entry.festival && (
              <div className="text-red-600 text-xs mt-1">🎉 {entry.festival}</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
