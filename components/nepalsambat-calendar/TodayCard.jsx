export default function TodayCard({ today }) {
  const ns = today.nepal_sambat;
  const bs = today.bikram_sambat;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded shadow mb-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-yellow-800 mb-1">
        🌞 Today: N.S. {ns.year} {ns.month}{ns.fortnight} {ns.day}
      </h2>
      <p className="text-sm text-gray-700">
        {ns.tithi}, {ns.weekday}<br />
        B.S.: {bs.year} {bs.month} {bs.day}<br />
        Gregorian: {today.gregorian}
      </p>
      {today.festival && (
        <div className="mt-2 text-yellow-800 text-sm">
          {today.festival.split(" | ").map((f, i) => (
            <div key={i}>🎊 {f}</div>
          ))}
        </div>
      )}
    </div>
  );
}