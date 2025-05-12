import { useState } from 'react';

export default function DateConverter({ calendar }) {
  const [inputDate, setInputDate] = useState('');
  const [result, setResult] = useState(null);

  const handleConvert = () => {
    const match = calendar.find(e => e.gregorian === inputDate);
    if (match) setResult(match);
    else setResult({ error: 'No matching date found in Nepal Sambat calendar.' });
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold text-yellow-800 mb-2">🔁 Date Converter (AD → NS / BS)</h2>

      <input
        type="date"
        className="w-full mb-3 p-2 border border-yellow-500 rounded"
        value={inputDate}
        onChange={(e) => setInputDate(e.target.value)}
      />

      <button
        onClick={handleConvert}
        className="bg-yellow-600 text-white px-4 py-2 rounded shadow"
      >
        Convert
      </button>

      {result && (
        <div className="mt-4 p-3 bg-yellow-100 rounded text-sm">
          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p><strong>Gregorian:</strong> {result.gregorian}</p>
              <p><strong>Nepal Sambat:</strong> {result.nepal_sambat.year} {result.nepal_sambat.month}{result.nepal_sambat.fortnight} {result.nepal_sambat.day}</p>
              <p><strong>Tithi:</strong> {result.nepal_sambat.tithi} ({result.nepal_sambat.weekday})</p>
              <p><strong>Bikram Sambat:</strong> {result.bikram_sambat.year} {result.bikram_sambat.month} {result.bikram_sambat.day}</p>
              {result.festival && (
                <p className="text-yellow-900 mt-1"><strong>Festival:</strong> 🎊 {result.festival}</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
