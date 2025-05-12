
import React, { useEffect, useState } from 'react';
import MonthView from '../components/nepalsambat-calendar/MonthView';
import TodayCard from '../components/nepalsambat-calendar/TodayCard';
import FestivalList from '../components/nepalsambat-calendar/FestivalList';
import DateConverter from '../components/nepalsambat-calendar/DateConverter';
import { getTodayNS } from '../lib/NSDateUtils';

export default function NepalSambatPage() {
  const [todayEntry, setTodayEntry] = useState(null);

  useEffect(() => {
    const todayData = getTodayNS();
    setTodayEntry(todayData);
  }, []);

  return (
    <div className="min-h-screen bg-yellow-50 text-gray-900 p-4">
      <h1 className="text-3xl font-bold text-center mb-4">📅 Nepal Sambat Calendar</h1>

      {todayEntry && (
        <div className="mb-6">
          <TodayCard entry={todayEntry} />
        </div>
      )}

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">🗓️ This Month</h2>
        <MonthView />
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">🎊 Annual Festivals</h2>
        <FestivalList />
      </section>

      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">🔁 Date Converter</h2>
        <DateConverter />
      </section>
    </div>
  );
}
