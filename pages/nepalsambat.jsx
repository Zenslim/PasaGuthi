import TodayCard from '@/components/nepalsambat-calendar/TodayCard';
import MonthView from '@/components/nepalsambat-calendar/MonthView';
import FestivalList from '@/components/nepalsambat-calendar/FestivalList';

export default function NepalSambatPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-200 dark:from-black dark:via-slate-900 dark:to-slate-800 p-4 text-gray-900 dark:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-indigo-600 dark:text-indigo-300">🗓️ Nepal Sambat Calendar</h1>

        <TodayCard />
        <MonthView />
        <FestivalList />
      </div>
    </div>
  );
}
