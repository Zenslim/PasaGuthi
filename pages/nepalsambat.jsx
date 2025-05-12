
import React, { useState, useEffect } from 'react';
import { resolveNSDate } from '@/lib/resolveNSDate';
import { motion } from 'framer-motion';

export default function NepalSambatPage() {
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const result = resolveNSDate(today);
    if (result) setEntry(result);
  }, []);

  if (!entry) return <div className="text-center p-6">📭 No NS data found for today.</div>;

  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 p-4">
      <motion.h1
        className="text-3xl font-bold text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        📅 Nepal Sambat — {entry.ns.month} {entry.ns.day}, NS {entry.ns.year}
      </motion.h1>

      <motion.div
        className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 border border-yellow-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <p><strong>Gregorian:</strong> {entry.ad}</p>
        <p><strong>Bikram Sambat:</strong> {entry.bs.year} {entry.bs.month} {entry.bs.day}</p>
        <p><strong>Weekday:</strong> {entry.weekday}</p>
        <p><strong>Tithi:</strong> {entry.tithi}</p>
        {entry.festival && (
          <p className="text-red-600 mt-3 font-semibold">🎉 {entry.festival}</p>
        )}
      </motion.div>
    </div>
  );
}
