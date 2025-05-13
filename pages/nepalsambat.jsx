import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const TodayCard = dynamic(() => import('@/components/nepalsambat-calendar/TodayCard'), { ssr: false });
const MonthView = dynamic(() => import('@/components/nepalsambat-calendar/MonthView'), { ssr: false });

export default function NepalSambatPage() {
  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 px-4 py-6">
      <motion.h1
        className="text-3xl font-bold text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        🕰️ Living Nepal Sambat Calendar
      </motion.h1>

      <div className="mb-6 max-w-xl mx-auto">
        <TodayCard />
      </div>

         <div>
        <MonthView />
      </div>
    </div>
  );
}
