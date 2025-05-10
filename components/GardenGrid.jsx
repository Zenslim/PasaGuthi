// components/GardenGrid.jsx
import PlantCard from './PlantCard';

export default function GardenGrid({ users, onPlantClick }) {
  if (!users || users.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        🌱 No plants in this grove yet. Whisper to begin.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 p-6">
      {users.map((user) => (
        <PlantCard key={user.id} user={user} onClick={() => onPlantClick(user)} />
      ))}
    </div>
  );
}
