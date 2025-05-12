export default function TodayCard({ todayEntry }) {
  if (!todayEntry) return null;
  const ns = todayEntry.nepal_sambat;
  const bs = todayEntry.bikram_sambat;

  return (
    <div className="max-w-xl mx-auto bg-yellow-200 text-yellow-900 px-6 py-4 rounded-xl shadow mb-6">
      <h2 className="text-xl font-bold text-center mb-1">
        🌟 Today — {ns.month}{ns.fortnight} {ns.tithi}
      </h2>
      <p className="text-center text-sm">
        N.S. {ns.year}, B.S. {bs.year} {bs.month} {bs.day}, {todayEntry.gregorian} ({ns.weekday})
      </p>

      {todayEntry.festival && (
        <div className="mt-3 bg-yellow-100 border border-yellow-400 p-2 rounded text-center">
          <p className="font-semibold text-yellow-800">🎊 {todayEntry.festival}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-center italic text-yellow-800">
        🪔 "May today’s tithi inspire clarity, harmony, and sacred action."
      </div>
    </div>
  );
}
