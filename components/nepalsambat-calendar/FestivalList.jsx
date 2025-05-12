
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import enrichedCalendar from '../../public/ns-calendar-enriched-2024-2034.json';

export default function FestivalList() {
  const [festivals, setFestivals] = useState([]);

  useEffect(() => {
    const data = enrichedCalendar.filter(f => f.festival);
    setFestivals(data);
  }, []);

  return (
    <motion.div
      className="bg-white rounded-2xl shadow p-4 border border-yellow-200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ul className="space-y-2 max-h-[400px] overflow-y-auto">
        {festivals.map((f, idx) => (
          <li key={idx} className="p-2 rounded hover:bg-yellow-50">
            <div className="font-semibold text-gray-800">🎊 {f.festival}</div>
            <div className="text-sm text-gray-600">
              NS: {f.nepal_sambat.year} {f.nepal_sambat.month} {f.nepal_sambat.day} • 
              AD: {f.gregorian}
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
