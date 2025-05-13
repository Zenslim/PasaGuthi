import { useEffect, useState } from 'react';
import Head from 'next/head';
import TodayCard from '@/components/nepalsambat-calendar/TodayCard';
import FestivalList from '@/components/nepalsambat-calendar/FestivalList';
import MonthView from '@/components/nepalsambat-calendar/MonthView';

export default function NepalSambatPage() {
  const [today, setToday] = useState(null);

  useEffect(() => {
    const now = new Date();
    const ad = now.toISOString().split('T')[0]; // YYYY-MM-DD
    import('@/lib/resolveNSDate')
      .then(({ resolveNSDate }) => {
        const ns = resolveNSDate(ad);
        setToday(ns);
      })
      .catch((err) => {
        console.error("Failed to load NS date", err);
      });
  }, []);

  return (
    <>
      <Head>
        <title>Nepal Sambat Calendar</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-slate-900 text-white p-4">
        <h1 className="text-3xl font-bold mb-4 text-yellow-300 text-center">
          📅 Nepal Sambat Calendar
        </h1>

        <div className="mb-6">
          {today ? (
            <TodayCard nsDate={today} />
          ) : (
            <p className="text-center text-gray-400">Loading today’s NS date...</p>
          )}
        </div>

        <div className="mb-6">
          <MonthView />
        </div>

        <div className="border-t border-gray-600 pt-6">
          <FestivalList />
        </div>
      </div>
    </>
  );
}
