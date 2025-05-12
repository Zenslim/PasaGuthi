import { useState } from 'react';

export default function FestivalList({ calendar }) {
  const [query, setQuery] = useState('');

  const festivals = calendar.filter(e => e.festival?.trim());

  const results = festivals.filter(e =>
    e.festival.toLowerCase().includes(query.toLowerCase()) ||
    e.nepal_sambat.month.toLowerCase().includes(query.toLowerCase()) ||
    e.nepal_sambat.tithi.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-yellow-800 mb-4">🎊 Festival Explorer</h2>
      <input
        type="text"
        className="w-full mb-4 p-2 border border-yellow-400 rounded"
        placeholder="Search festival name, month, or tithi..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.map((entry, idx) => (
        <div key={idx} className="bg-white border-l-4 border-yellow-500 shadow mb-3 p-3 rounded-md">
          <h2 className="font-bold text-yellow-800 text-lg">📅 {entry.festival}</h2>
          <p className="text-sm text-gray-700 mt-1">
            N.S.: {entry.nepal_sambat.year} {entry.nepal_sambat.month}{entry.nepal_sambat.fortnight} {entry.nepal_sambat.day}, {entry.nepal_sambat.tithi}, {entry.nepal_sambat.weekday}<br />
            B.S.: {entry.bikram_sambat.year} {entry.bikram_sambat.month} {entry.bikram_sambat.day}<br />
            Gregorian: {entry.gregorian}
          </p>
        </div>
      ))}
      {results.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No festivals found. Try another keyword.</p>
      )}
    </div>
  );
}