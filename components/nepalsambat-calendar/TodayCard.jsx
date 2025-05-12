
import React, { useEffect, useState } from 'react';
import { resolveNSDate } from '../lib/resolveNSDate';
import { motion } from 'framer-motion';

export default function TodayCard() {
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    resolveNSDate(today).then(setEntry);
  }, []);

  if (!entry) return <div className="text-center">🔄 Loading today's Panchanga...</div>;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-2">📍 Today</h2>
      <p><strong>Gregorian:</strong> {entry.ad}</p>
      <p><strong>BS:</strong> {entry.bs.year} {entry.bs.month} {entry.bs.day}</p>
      <p><strong>NS:</strong> {entry.ns.year} {entry.ns.month} {entry.ns.day}</p>
      <p><strong>Tithi:</strong> {entry.tithi}</p>
      <p><strong>Weekday:</strong> {entry.weekday}</p>
      {entry.festival && (
        <p className="mt-3 text-red-600 font-semibold">🎉 Festival: {entry.festival}</p>
      )}
    </motion.div>
  );
}
