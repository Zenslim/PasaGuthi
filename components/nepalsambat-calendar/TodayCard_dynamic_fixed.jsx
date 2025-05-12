
import React, { useEffect, useState } from 'react';
import { resolveNSDate } from '@/lib/resolveNSDate';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

export default function TodayCard() {
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const result = resolveNSDate(today);
    setEntry(result);
  }, []);

  if (!entry) return <div className="text-center">🔄 Loading today’s date...</div>;

  return (
    <motion.div
      className="bg-white border border-yellow-300 rounded-xl shadow-lg p-6 flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <CalendarDays size={36} className="text-yellow-500 mb-2" />
      <h2 className="text-xl font-bold mb-1">Nepal Sambat — {entry.ns.month} {entry.ns.day}, NS {entry.ns.year}</h2>
      <p className="text-gray-700"><strong>Gregorian:</strong> {entry.ad}</p>
      <p className="text-gray-700"><strong>Bikram Sambat:</strong> {entry.bs.year} {entry.bs.month} {entry.bs.day}</p>
      <p className="text-gray-700"><strong>Weekday:</strong> {entry.weekday}</p>
      <p className="text-gray-700"><strong>Tithi:</strong> {entry.tithi}</p>
      {entry.festival && (
        <p className="text-red-600 font-medium mt-2">🎉 {entry.festival}</p>
      )}
    </motion.div>
  );
}
