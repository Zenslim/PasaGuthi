
import React, { useEffect, useState } from 'react';
import { resolveNSDate } from '@/lib/resolveNSDate';
import { motion } from 'framer-motion';

export default function MonthView() {
  const [days, setDays] = useState([]);

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth(); // 0-based
    const currentMonth = [];

    for (let day = 1; day <= 31; day++) {
      const date = new Date(year, month, day);
      if (date.getMonth() !== month) break;
      const iso = date.toISOString().slice(0, 10);
      const entry = resolveNSDate(iso);
      if (entry) currentMonth.push(entry);
    }

    setDays(currentMonth);
  }, []);

  return (
    <motion.div
      className="bg-white border border-yellow-300 rounded-xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-lg font-bold mb-4 text-center">
        📆 This Month (Nepal Sambat)
      </h3>
      <div className="grid grid-cols-4 gap-3 text-sm">
        {days.map((entry, idx) => (
          <div key={idx} className="p-2 rounded-lg border hover:border-yellow-400 shadow-sm bg-yellow-50">
            <div className="font-bold">NS: {entry.ns.day} {entry.ns.month}</div>
            <div className="text-xs text-gray-600">Tithi: {entry.tithi}</div>
            {entry.festival && (
              <div className="text-red-500 text-xs mt-1">🎉 {entry.festival}</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
