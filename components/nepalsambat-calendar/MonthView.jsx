
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import enrichedCalendar from '../../public/ns-calendar-enriched-2024-2034.json';

export default function MonthView() {
  const today = new Date().toISOString().slice(0, 10);
  const [currentMonth, setCurrentMonth] = useState([]);
  const [monthName, setMonthName] = useState('');
  const [nsYear, setNsYear] = useState('');

  useEffect(() => {
    const todayEntry = enrichedCalendar.find(entry => entry.gregorian === today);
    if (todayEntry) {
      const { year, month } = todayEntry.nepal_sambat;
      const monthData = enrichedCalendar.filter(
        entry => entry.nepal_sambat.year === year && entry.nepal_sambat.month === month
      );
      setCurrentMonth(monthData);
      setMonthName(month);
      setNsYear(year);
    }
  }, []);

  return (
    <motion.div
      className="bg-white border border-yellow-300 rounded-xl p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h3 className="text-lg font-bold mb-4 text-center">
        📆 {monthName} {nsYear}
      </h3>
      <div className="grid grid-cols-4 gap-3 text-sm">
        {currentMonth.map((entry, idx) => (
          <div
            key={idx}
            className="p-2 rounded-lg border hover:border-yellow-400 shadow-sm bg-yellow-50"
          >
            <div className="font-bold">NS: {entry.nepal_sambat.day}</div>
            <div className="text-xs text-gray-600">Tithi: {entry.nepal_sambat.tithi}</div>
            {entry.festival && (
              <div className="text-red-500 text-xs mt-1">🎉 {entry.festival}</div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
