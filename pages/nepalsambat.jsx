import { useEffect, useState } from 'react';
import TodayCard from '../components/nepalsambat-calendar/TodayCard';
import WeekView from '../components/nepalsambat-calendar/WeekView';
import MonthView from '../components/nepalsambat-calendar/MonthView';
import FestivalList from '../components/nepalsambat-calendar/FestivalList';

export default function NepalSambatPage() {
  const [calendar, setCalendar] = useState([]);
  const [today, setToday] = useState(null);
  const [tab, setTab] = useState('today');

  useEffect(() => {
    fetch('/ns-calendar-enriched-2024-2034.json')
      .then(res => res.json())
      .then(data => {
        setCalendar(data);
        const now = new Date().toISOString().split('T')[0];
        const match = data.find(e => e.gregorian === now);
        setToday(match);
      });
  }, []);

  return (
    <div className="min-h-screen bg-yellow-100 text-gray-800 px-4 py-6">
      <h1 className="text-3xl font-bold text-yellow-700 mb-4 text-center">📅 Nepal Sambat Calendar</h1>
      <div className="flex justify-center gap-4 mb-6">
        {['today', 'week', 'month', 'festivals'].map(t => (
          <button key={t} className={`px-4 py-2 rounded ${tab === t ? 'bg-yellow-600 text-white' : 'bg-yellow-200'}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      {tab === 'today' && today && <TodayCard today={today} />}
      {tab === 'week' && <WeekView calendar={calendar} />}
      {tab === 'month' && today && <MonthView calendar={calendar} currentMonth={today.nepal_sambat.month} />}
      {tab === 'festivals' && <FestivalList calendar={calendar} />}
    </div>
  );
}