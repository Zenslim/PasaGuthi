
import React from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';

const TodayCard = dynamic(() => import('../components/nepalsambat-calendar/TodayCard'), { ssr: false });
const WeekView = dynamic(() => import('../components/nepalsambat-calendar/WeekView'), { ssr: false });
const MonthView = dynamic(() => import('../components/nepalsambat-calendar/MonthView'), { ssr: false });

export default function NepalSambatPage() {
  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 p-4">
      <motion.h1
        className="text-3xl font-bold text-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        📅 Nepal Sambat Calendar (Live Panchanga)
      </motion.h1>

      <div className="mb-6">
        <TodayCard />
      </div>

      <div className="mb-6">
        <WeekView />
      </div>

      <div className="mb-6">
        <MonthView />
      </div>
    </div>
  );
}
