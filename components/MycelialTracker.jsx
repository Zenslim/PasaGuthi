export default function MycelialTracker({ count = 7 }) {
  const total = 13;
  return (
    <div className="flex justify-center items-center space-x-2 my-6">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full ${i < count ? 'bg-purple-500' : 'bg-gray-700'}`}
        />
      ))}
    </div>
  );
}
