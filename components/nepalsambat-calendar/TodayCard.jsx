
import React from 'react';
import { motion } from 'framer-motion';

export default function TodayCard({ entry }) {
  const { nepal_sambat, gregorian, bikram_sambat, festival } = entry;

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg p-6 border border-yellow-300"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-xl font-bold mb-2">📍 Today</h2>
      <p><strong>Gregorian:</strong> {gregorian}</p>
      <p><strong>BS:</strong> {bikram_sambat.year} {bikram_sambat.month} {bikram_sambat.day}</p>
      <p><strong>NS:</strong> {nepal_sambat.year} {nepal_sambat.month} {nepal_sambat.day}</p>
      <p><strong>Tithi:</strong> {nepal_sambat.tithi} ({nepal_sambat.fortnight})</p>
      <p><strong>Weekday:</strong> {nepal_sambat.weekday}</p>
      {festival && (
        <p className="mt-3 text-red-600 font-semibold">🎉 Festival: {festival}</p>
      )}
    </motion.div>
  );
}
